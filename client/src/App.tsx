import axios from 'axios'
import React, { useEffect, useState } from 'react'
import './App.scss'
import { SelectFile } from './SelectFile'

const UPLOAD_URL = 'http://localhost:5100/upload_video'

const App = () => {

  const [data, setData] = useState('Loading...')
  const [file, setFile] = useState<File | undefined>()

  const uploadVideo = (file: File) => {

    if (file == null) {
      console.warn('No file was selected for upload.')
      return
    }

    const formData = new FormData()
    formData.append('name', file.name)
    formData.append('file', file)

    axios
      .post(UPLOAD_URL, formData)
      .then((res) => {
        alert('File Upload success')
      })
      .catch((err) => alert('File Upload Error'))
  }

  useEffect(() => {
    fetchData()
      .then((result) => setData(result))
      .catch(console.error)
  }, [])

  return (
    <div className="App">
      {data}
      <SelectFile onFileSelected={(file) => {
        setFile(file)
      }}></SelectFile>
      <button onClick={() => {
        if (file != null) {
          uploadVideo(file)
        }
      }}>
        Upload video!
      </button>
    </div>
  )
}

const fetchData = async () => {
  return fetch(`http://localhost:5100`)
    .then((res) => res.json())
}

export default App
