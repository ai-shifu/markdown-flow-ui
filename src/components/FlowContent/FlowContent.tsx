import React from 'react'
import './flowContent.css'

export interface FlowContentProps {
  content?: string
}

/** Primary UI component for user interaction */
const FlowContent = ({ content, ...props }: FlowContentProps) => {
  return (
    <div className={`flowContent`} {...props}>
      test
    </div>
  )
}
export default FlowContent
