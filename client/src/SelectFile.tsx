import React from 'react'
import './SelectFile.scss'


export interface UploadFileProps {
  onFileSelected?: (file: FileList) => void
  onError?: (reason: string) => void
  labelName?: string
}

export const SelectFile: React.FC<UploadFileProps> = (props: UploadFileProps) => {

  const [dragActive, setDragActive] = React.useState<boolean>(false)

  const handleFileChange = (files: FileList): void => {
    props.onFileSelected?.(files)
  }

  const labelName = props.labelName ?? 'select-file'
  return <form
    className="select-file-form"
    onSubmit={(e) => e.preventDefault()}
  >
    <input
      type="file"
      multiple
      value={undefined}
      id={labelName}
      name={labelName}
      onChange={(event) => {
        event.preventDefault()
        if (event.target.files != null) {
          handleFileChange(event.target.files)
        }
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
        handleFileChange(e.dataTransfer.files)
      }}
    >
      <span>Drag and drop a file here or click here to select it from your device.</span>
    </label>
  </form>
}