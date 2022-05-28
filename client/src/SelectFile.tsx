import React from 'react'


export interface UploadFileProps {
  onFileSelected?: (file: File) => void
  onError?: (reason: string) => void
}

export const SelectFile: React.FC<UploadFileProps> = (props: UploadFileProps) => {


  return <form onSubmit={(e) => e.preventDefault()}>
    <input
      type="file"
      onChange={(event) => {
        let file: File | undefined = event.target.files?.[0]
        if (file == null) {
          props.onError?.('Error occurred while selecting a file.')
          return
        }
        props.onFileSelected?.(file)
      }}
    />
  </form>
}