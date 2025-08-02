import React, { useRef, useEffect } from 'react'
import ContentRender from '../ContentRender'
import './markdownFlow.css'
import { OnSendContentParams, CustomRenderBarProps } from '@/components/types'

// 定义组件 Props 类型
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
  const contentEndRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    contentEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [initialContentList])

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
      <div ref={contentEndRef} />
    </div>
  )
}

export default MarkdownFlow
