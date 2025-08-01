import React from 'react'
import ContentRender from '../ContentRender'
import './markdownFlow.css'
import { OnSendContentParams, CustomRenderBarProps } from '@/components/types'

// 定义组件 Props 类型
interface MarkdownFlowProps {
  contentList?: {
    content: string
    isFinished?: boolean
    defaultInputText?: string
    defaultButtonText?: string
    defaultVariableName?: string
    readonly?: boolean
  }[]
  customRenderBar?: CustomRenderBarProps
  onSend?: (content: OnSendContentParams) => void
  typingSpeed?: number
  disableTyping?: boolean
}

const MarkdownFlow: React.FC<MarkdownFlowProps> = ({
  contentList,
  customRenderBar,
  onSend,
  typingSpeed,
  disableTyping
}) => {
  return (
    <div className='markdown-flow'>
      {contentList?.map((contentInfo, index) => (
        <ContentRender
          key={index}
          {...contentInfo}
          disableTyping={contentInfo.isFinished ? true : disableTyping}
          customRenderBar={customRenderBar}
          onSend={contentInfo.isFinished ? undefined : onSend}
          typingSpeed={contentInfo.isFinished ? undefined : typingSpeed}
        />
      ))}
    </div>
  )
}

export default MarkdownFlow
