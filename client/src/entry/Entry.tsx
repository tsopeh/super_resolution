import React from 'react'
import { BsFillTrashFill } from 'react-icons/bs'
import { Errored } from './content/Errored'
import { ProgressBar, ProgressBarProps } from './content/ProgressBar'
import { Results, ResultsProps } from './content/Results'
import { UpsampleOptions, UpsampleOptionsProps } from './content/UpsampleOptions'

export enum ContentType {
  UpsampleOptions = 'upsample-options',
  Uploading = 'uploading',
  Processing = 'processing',
  Results = 'result',
  Errored = 'errored',
}

export type ContentModel =
  | { type: ContentType.UpsampleOptions } & UpsampleOptionsProps
  | { type: ContentType.Uploading } & ProgressBarProps
  | { type: ContentType.Processing } & ProgressBarProps
  | { type: ContentType.Results } & ResultsProps
  | { type: ContentType.Errored } & { message: string }


export interface EntryModel {
  resourceId: string
  fileName: string
  content: ContentModel
  onRemove?: () => void
}

export const Entry: React.FC<Omit<EntryModel, 'resourceId'>> = (props) => {
  return <div className="entry">
    <div className="file-name"><span>{props.fileName}</span></div>
    {renderEntryContent(props.content)}
    <BsFillTrashFill className="remove"></BsFillTrashFill>
  </div>
}

const renderEntryContent = (content: ContentModel) => {
  switch (content.type) {
    case ContentType.UpsampleOptions:
      return <UpsampleOptions {...content}/>
    case ContentType.Uploading:
      return <ProgressBar {...content} />
    case ContentType.Processing:
      return <ProgressBar {...content} />
    case ContentType.Results:
      return <Results {...content}/>
    case ContentType.Errored:
      return <Errored {...content}/>
    default:
      return <div>NO CONTENT HERE</div>
  }
}