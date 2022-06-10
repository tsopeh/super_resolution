import React from 'react'
import { BiError } from 'react-icons/bi'
import './Errored.scss'

export interface ErroredProps {
  message: string
}

export const Errored: React.FC<ErroredProps> = ({message}: ErroredProps) => {
  return <div className="content errored"><BiError className="icon"/><span>{message}</span></div>
}