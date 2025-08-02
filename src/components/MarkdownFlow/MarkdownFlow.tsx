import React from 'react'
import ContentRender from '../ContentRender'
import './markdownFlow.css'
import { OnSendContentParams, CustomRenderBarProps } from '@/components/types'

interface MarkdownFlowProps {
  initialContentList?: {
    content: string
    isFinished?: boolean
    defaultInputText?: string
    defaultButtonText?: string
    readonly?: boolean
  }[]
  customRenderBar?: CustomRenderBarProps
  onSend?: (content: OnSendContentParams) => void
  typingSpeed?: number
  disableTyping?: boolean
}

const MarkdownFlow: React.FC<MarkdownFlowProps> = ({
  initialContentList = [],
  customRenderBar,
  onSend: onSendProp,
  typingSpeed: typingSpeedProp,
  disableTyping: disableTypingProp
}) => {
  return (
    <div className='markdown-flow'>
      {initialContentList.map((contentInfo, index) => {
        const isFinished = contentInfo.isFinished ?? false
        const disableTyping = isFinished || disableTypingProp
        const onSend = isFinished ? undefined : onSendProp
        const typingSpeed = isFinished ? undefined : typingSpeedProp

        return (
          <ContentRender
            key={index}
            content={contentInfo.content}
            defaultInputText={contentInfo.defaultInputText}
            defaultButtonText={contentInfo.defaultButtonText}
            readonly={contentInfo.readonly}
            disableTyping={disableTyping}
            customRenderBar={customRenderBar}
            onSend={onSend}
            typingSpeed={typingSpeed}
          />
        )
      })}
    </div>
  )
}

export default MarkdownFlow
