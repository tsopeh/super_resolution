import React from 'react'
import './ProgressBar.scss'

export interface ProgressBarProps {
  /**
   * In range from 0 to 1
   */
  progress: number
  text?: string
  color?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({text, progress, color}: ProgressBarProps) => {
  return <div className="content progress">
    <div>{text ?? `${progress * 100}%`}</div>
    <div className="bar" style={{
      width: `${progress * 100}%`,
      backgroundColor: color ?? '#6495ed',
    }}>
    </div>
  </div>
}