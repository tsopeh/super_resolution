import axios from 'axios'
import React, {useEffect, useState} from 'react'
import './App.scss'
import {NNModels, UpsampleOptionsModel} from './entry/content/UpsampleOptions'
import {ContentType, Entry, EntryModel} from './entry/Entry'
import './entry/Entry.scss'
import {getPersistedResourceInfo, persistResourceInfo} from './entry/persistent-info'
import {checkStatus, ResourceStatusOutput, resourceStatusOutputToEntryModel} from './entry/status'
import {SelectFile} from './SelectFile'

const getUrl = (path: string) => `http://localhost:5100/${path}`

// TODO: Remove this once the `localStorage` handling gets stable.
// localStorage.clear()

enum ServerStatus {
  Unimportant = 'unimportant',
  Online = 'online',
  Offline = 'offline',
}

const App = () => {

  const [serverStatus, setServerStatus] = useState<ServerStatus>(ServerStatus.Unimportant)
  const [tmpEntries, setTmpEntries] = useState<ReadonlyArray<EntryModel>>([])
  const [persistedEntries, setPersistedEntries] = useState<ReadonlyArray<EntryModel>>([])

  // TODO: Do not wait for two seconds and then fire a request;
  //  Instead, create a throttle that can be hurried.
  useEffect(() => {
    const intervalId = setInterval(() => {
      const persisted = getPersistedResourceInfo()
      if (persisted.length === 0) {
        return
      }
      checkStatus(persisted.map(info => info.resourceId))
        .then((result) => {
          setServerStatus(ServerStatus.Online)
          setPersistedEntries(prevState => {
            const toUpdate = result.filter(res => res != null && prevState.some(existing => existing.resourceId === res?.resourceId)) as ReadonlyArray<ResourceStatusOutput>
            const toAdd = result.filter(res => res != null && !prevState.some(existing => existing.resourceId === res?.resourceId)) as ReadonlyArray<ResourceStatusOutput>
            const toRemove = persisted.filter(p => !result.some(r => r?.resourceId === p.resourceId))
            const nextState: ReadonlyArray<EntryModel> = [
              ...prevState
                .filter(existing => !toRemove.some(r => r.resourceId === existing.resourceId))
                .map((entry): EntryModel => {
                  const found = toUpdate.find(x => x.resourceId === entry.resourceId)
                  if (found != null) {
                    return resourceStatusOutputToEntryModel(entry, found)
                  } else {
                    return entry
                  }
                }),
              ...toAdd.map((newOne): EntryModel => {
                return resourceStatusOutputToEntryModel({
                  resourceId: newOne.resourceId,
                  fileName: persisted.find(p => p.resourceId === newOne.resourceId)!.fileName,
                  content: {
                    type: ContentType.Uploading,
                    progress: 0,
                  },
                  onRemove: () => {
                    removeResource(newOne.resourceId)
                      .then(() => {
                        // TODO: Invalidate cache?
                        console.log('Removed', newOne.resourceId)
                      })
                  },
                }, newOne)
              }),
            ]
            persistResourceInfo(nextState.map(entry => ({
              resourceId: entry.resourceId,
              fileName: entry.fileName,
            })))
            return nextState
          })
        })
        .catch((error) => {
          setServerStatus(ServerStatus.Offline)
          console.error(error)
        })
    }, 1000)
    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="App">
      <h1>Upsample videos or images</h1>
      {
        serverStatus === ServerStatus.Unimportant
          ? null
          : <div
            className={`server-status ${serverStatus === ServerStatus.Online ? 'online' : 'offline'}`}
            title={`Server status: ${serverStatus === ServerStatus.Online ? 'Online' : 'Offline'}`}
          />
      }
      <SelectFile onFileSelected={(files) => {
        setTmpEntries((prevState) => {
          const newEntries: ReadonlyArray<EntryModel> =
            Array.from(files).map((file) => {
              const tmpFileId = `${file.name}_${new Date().getTime()}`
              return ({
                resourceId: tmpFileId,
                fileName: file.name,
                content: {
                  type: ContentType.UpsampleOptions,
                  options: {
                    model: NNModels.RealSrAnimeVideoV3,
                    scale: 2,
                  },
                  updateForm: (newOptions: UpsampleOptionsModel) => {
                    setTmpEntries((prevState) => {
                      return prevState.map(existing => {
                        return existing.resourceId !== tmpFileId
                          ? existing
                          : {
                            ...existing,
                            content: {
                              ...existing.content,
                              options: newOptions,
                            },
                          }
                      })
                    })
                  },
                  submit: (options) => {
                    uploadFileAndStartProcessing(tmpFileId, file, options, setTmpEntries)
                  },
                },
                onRemove: () => {
                  setTmpEntries((prevState) => {
                    return prevState.filter(existing => existing.resourceId !== tmpFileId)
                  })
                },
              })
            })
          return [...prevState, ...newEntries]
        })
      }}/>
      {
        persistedEntries.length + tmpEntries.length > 0
          ? <div className="entries">
            {
              [
                ...persistedEntries.map((entry) => {
                  return <Entry key={entry.resourceId} {...entry}></Entry>
                }),
                ...tmpEntries.map((entry) => {
                  return <Entry key={entry.resourceId} {...entry}></Entry>
                }),
              ]
            }
          </div>
          : null
      }
    </div>
  )
}

const uploadFileAndStartProcessing = (
  tmpFileId: string,
  file: File,
  options: UpsampleOptionsModel,
  setTmpEntries: React.Dispatch<React.SetStateAction<readonly EntryModel[]>>,
) => {

  const formData = new FormData()
  formData.append('name', file.name)
  formData.append('file', file)

  const data = {
    model: options.model,
    scale: options.model === NNModels.RealSrAnimeVideoV3 ? options.scale : null,
  }

  setTmpEntries((prevState) => {
    return prevState.map(existing => {
      return existing.resourceId !== tmpFileId
        ? existing
        : {
          ...existing,
          content: {
            type: ContentType.Uploading,
            progress: 0,
            text: `Uploaded: 0%`,
          },
        }
    })
  })

  axios
    .post<string>(getUrl('upload'), formData, {
      params: data,
      onUploadProgress: ({loaded, total}) => {
        setTmpEntries((prevState) => {
          return prevState.map(entry => {
            return entry.resourceId !== tmpFileId
              ? entry
              : {
                ...entry,
                content: {
                  ...entry.content,
                  progress: loaded / total,
                  text: `Uploaded: ${(loaded / total * 100).toFixed(1)}%`,
                },
              }
          })
        })
      },
    })
    .then((res) => {
      const resourceId = res.data
      setTmpEntries((prevState) => {
        return prevState.filter(existing => existing.resourceId !== tmpFileId)
      })
      persistResourceInfo([...getPersistedResourceInfo(), {resourceId, fileName: file.name}])
    })
    .catch((err) => {
      setTmpEntries((prevState) => {
        return prevState.map(existing => {
          return existing.resourceId !== tmpFileId
            ? existing
            : {
              ...existing,
              content: {
                type: ContentType.Errored,
                message: 'Upload failed.',
              },
            }
        })
      })
    })
}

const removeResource = (resourceId: string): Promise<unknown> => {
  return axios.delete(getUrl(`resource/${resourceId}`))
}

export default App