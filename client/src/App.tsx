import axios from 'axios'
import React, { useEffect, useState } from 'react'
import './App.scss'
import { ContentType, Entry, EntryModel } from './Entry'
import './Entry.scss'
import { getPersistedResourceInfo, persistResourceInfo } from './persistent-info'
import { SelectFile } from './SelectFile'
import { checkStatus, ResourceStatusOutput, resourceStatusOutputToEntryModel } from './status'
import { NNModels, UpsampleOptionsModel } from './UpsampleOptions'

const UPLOAD_URL = 'http://localhost:5100/upload'

// TODO: Remove this once the `localStorage` handling gets stable.
// localStorage.clear()

const App = () => {

  const [tmpEntries, setTmpEntries] = useState<ReadonlyArray<EntryModel>>([])
  const [persistedEntries, setPersistedEntries] = useState<ReadonlyArray<EntryModel>>([])

  useEffect(() => {
    const intervalId = setInterval(() => {
      const persisted = getPersistedResourceInfo()
      if (persisted.length === 0) {
        return
      }
      checkStatus(persisted.map(info => info.resourceId))
        .then((result) => {
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
                  fileName: persisted.find(p => p.resourceId == newOne.resourceId)!.fileName,
                  content: {
                    type: ContentType.Uploading,
                    progress: 0,
                  },
                  onRemove: () => {
                  }, // TODO: Fix remove.
                }, newOne)
              }),
            ]
            persistResourceInfo(nextState.map(entry => ({resourceId: entry.resourceId, fileName: entry.fileName})))
            return nextState
          })
        })
        .catch((error) => {
          console.error(error)
        })
    }, 2000)
    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="App">
      <div>Upsample videos</div>
      <SelectFile onFileSelected={(files) => {
        setTmpEntries((prevState) => {
          const newEntries: ReadonlyArray<EntryModel> =
            Array.from(files).map((file) => ({
              resourceId: file.name,
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
                      return existing.resourceId !== file.name
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
                submit: () => {
                  uploadFileAndStartProcessing(file, setTmpEntries)
                },
              },
            }))
          return [...prevState, ...newEntries]
        })
      }}></SelectFile>
      {
        [
          ...persistedEntries.map(({resourceId, content, fileName}) => {
            return <Entry key={resourceId} content={content} fileName={fileName}></Entry>
          }),
          ...tmpEntries.map(({resourceId, content, fileName}) => {
            return <Entry key={resourceId} content={content} fileName={fileName}></Entry>
          }),
        ]
      }
    </div>
  )
}

const uploadFileAndStartProcessing = (file: File, setTmpEntries: React.Dispatch<React.SetStateAction<readonly EntryModel[]>>) => {

  const formData = new FormData()
  formData.append('name', file.name)
  formData.append('file', file)


  setTmpEntries((prevState) => {
    return prevState.map(existing => {
      return existing.resourceId !== file.name
        ? existing
        : {
          ...existing,
          content: {
            type: ContentType.Uploading,
            progress: 0,
          },
        }
    })
  })

  axios
    .post<string>(UPLOAD_URL, formData, {
      onUploadProgress: ({loaded, total}) => {
        setTmpEntries((prevState) => {
          return prevState.map(entry => {
            return entry.resourceId !== file.name
              ? entry
              : {
                ...entry,
                content: {
                  ...entry.content,
                  progress: loaded / total,
                },
              }
          })
        })
      },
    })
    .then((res) => {
      const resourceId = res.data
      setTmpEntries((prevState) => {
        return prevState.map(entry => {
          return entry.resourceId !== file.name
            ? entry
            : {
              ...entry,
              resourceId: resourceId,
              content: {
                ...entry.content,
                progress: 1,
                text: 'Upload completed.',
              },
            }
        })
      })
      persistResourceInfo([...getPersistedResourceInfo(), {resourceId, fileName: file.name}])
    })
    .catch((err) => console.error('File Upload Error', err))
}

export default App