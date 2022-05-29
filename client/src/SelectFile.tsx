import React from 'react'
import './SelectFile.scss'


export interface UploadFileProps {
  onFileSelected?: (file: File) => void
  onError?: (reason: string) => void
  labelName?: string
}

export const SelectFile: React.FC<UploadFileProps> = (props: UploadFileProps) => {

  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [dragActive, setDragActive] = React.useState<boolean>(false)

  const handleFileChange = (file: File | undefined): void => {
    if (file instanceof File) {
      setSelectedFile(file)
      props.onFileSelected?.(file)
    } else {
      setSelectedFile(null)
      props.onError?.('Error occurred while selecting a file.')
    }
  }

  const labelName = props.labelName ?? 'select-file'
  return <form
    className="select-file-form"
    onSubmit={(e) => e.preventDefault()}
  >
    <input
      type="file"
      id={labelName}
      name={labelName}
      onChange={(event) => {
        event.preventDefault()
        handleFileChange(event.target.files?.[0])
      }}
    />
    <label
      htmlFor={labelName}
      className={dragActive ? 'active' : ''}
      onDragEnter={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(true)
      }}
      onDragOver={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(true)
      }}
      onDragLeave={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        handleFileChange(e.dataTransfer.files[0])
      }}
    >
      <span>{
        selectedFile == null
          ? 'Drag and drop a file here or click here to select it from your device.'
          : selectedFile.name
      }</span>
    </label>
  </form>
}