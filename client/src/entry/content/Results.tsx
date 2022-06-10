import React from 'react'
import "./Results.scss"

export interface ResultsProps {
  url: string
}

export const Results: React.FC<ResultsProps> = ({url}: ResultsProps) => {
  return <div className="content results">
    <a href={url} target="_blank" rel="noopener noreferrer">Result URL</a>
  </div>
}