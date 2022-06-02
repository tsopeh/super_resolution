import axios from 'axios'
import React, { useEffect, useState } from 'react'
import './App.scss'
import { ContentType, Entry, EntryModel } from './Entry'
import './Entry.scss'
import { SelectFile } from './SelectFile'
import { NNModels, UpsampleOptionsModel } from './UpsampleOptions'

const UPLOAD_URL = 'http://localhost:5100/upload'

const App = () => {

  const [entries, setEntries] = useState<ReadonlyArray<EntryModel>>([])

  useEffect(() => {
    fetchData()
      .then((result) => console.log(result))
      .catch((error) => {
        console.error(error)
        console.error('An error has occurred.')
      })
  }, [])

  return (
    <div className="App">
      <div>Upsample videos</div>
      {
        entries.map(({id, content, fileName}) => {
          return <Entry key={id} content={content} fileName={fileName}></Entry>
        })
      }
      <SelectFile onFileSelected={(files) => {
        setEntries((prevState) => {
          const newEntries: ReadonlyArray<EntryModel> =
            Array.from(files).map((file) => ({
              id: file.name,
              fileName: file.name,
              content: {
                type: ContentType.UpsampleOptions,
                options: {
                  model: NNModels.RealSrAnimeVideoV3,
                  scale: 2,
                },
                updateForm: (newOptions: UpsampleOptionsModel) => {
                  setEntries((prevState) => {
                    return prevState.map(existing => {
                      return existing.id !== file.name
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
                  uploadFileAndStartProcessing(file, setEntries)
                },
              },
            }))
          return [...prevState, ...newEntries]
        })
      }}></SelectFile>
    </div>
  )
}

const fetchData = async () => {
  return axios
    .request<string>({url: 'http://localhost:5100/ping'})
    .then(res => res.data)
}

const uploadFileAndStartProcessing = (file: File, setEntries: React.Dispatch<React.SetStateAction<readonly EntryModel[]>>) => {

  const formData = new FormData()
  formData.append('name', file.name)
  formData.append('file', file)


  setEntries((prevState) => {
    return prevState.map(existing => {
      return existing.id !== file.name
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
    .post(UPLOAD_URL, formData, {
      onUploadProgress: ({loaded, total}) => {
        setEntries((prevState) => {
          return prevState.map(entry => {
            return entry.id !== file.name
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
      const resourceId = res.data.id
      // TODO: Save to local-storage.
      setEntries((prevState) => {
        return prevState.map(entry => {
          return entry.id !== file.name
            ? entry
            : {
              ...entry,
              id: resourceId,
              content: {
                ...entry.content,
                progress: 1,
                text: 'Upload completed.',
              },
            }
        })
      })
    })
    .catch((err) => console.error('File Upload Error', err))
}


export default App