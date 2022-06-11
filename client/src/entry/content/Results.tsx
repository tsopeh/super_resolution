import React from 'react'
import './Results.scss'
import { modelPronounceableNames, NNModels } from './UpsampleOptions'

export interface ResultsProps {
  url: string
  model: NNModels,
  scale: 2 | 3 | 4
}

export const Results: React.FC<ResultsProps> = ({url, model, scale}: ResultsProps) => {
  return <div className="content results">
    <a className="download" href={url} download target="_blank" rel="noreferrer">Download</a>
    <div className="description">(<i>{modelPronounceableNames[model]}</i>, <b>×{scale}</b> scale)</div>
  </div>
}