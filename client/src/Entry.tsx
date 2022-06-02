import React from 'react'
import { ProgressBar, ProgressBarProps } from './ProgressBar'
import { UpsampleOptions, UpsampleOptionsProps } from './UpsampleOptions'

export enum ContentType {
  UpsampleOptions = 'upsample-options',
  Uploading = 'uploading',
  Processing = 'processing',
  Results = 'result'
}

export type ContentModel =
  | { type: ContentType.UpsampleOptions } & UpsampleOptionsProps
  | { type: ContentType.Uploading } & ProgressBarProps
  | { type: ContentType.Processing } & ProgressBarProps
  | { type: ContentType.Results } & ResultsProps


export interface EntryModel {
  id: string
  fileName: string
  content: ContentModel
  onRemove?: () => void
}

export const Entry: React.FC<Omit<EntryModel, 'id'>> = (props) => {
  return <div className="entry">
    <div className="file-name">{props.fileName}</div>
    {renderEntryContent(props.content)}
    <div className="remove">X</div>
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
    default:
      return <div>NO CONTENT HERE</div>
  }
}

export interface ResultsProps {
  url: string
}

const Results: React.FC<ResultsProps> = ({url}: ResultsProps) => {
  return <div>
    <a href={url}>Result URL</a>
  </div>
}