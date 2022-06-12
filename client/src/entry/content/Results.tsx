import { saveAs } from 'file-saver'
import React from 'react'
import './Results.scss'
import { modelPronounceableNames, NNModels } from './UpsampleOptions'

export interface ResultsProps {
  fileName: string
  url: string
  model: NNModels,
  scale: 2 | 3 | 4
}

export const Results: React.FC<ResultsProps> = (props: ResultsProps) => {
  const {fileName, url, model, scale} = props
  return <div className="content results">
    <a className="download" href={url}
       onClick={(event) => {
         event.preventDefault()
         saveAs(url, fileName)
       }}
    >Download</a>
    <div className="description">(<i>{modelPronounceableNames[model]}</i>, <b>×{scale}</b> scale)</div>
  </div>
}