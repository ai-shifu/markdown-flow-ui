import React from 'react'
import ContentRender from '../ContentRender'
import { OnSendContentParams, CustomRenderBarProps } from '@/components/types'

// 定义组件 Props 类型
interface MarkdownFlowProps {
  contents: string[]
  customRenderBar?: CustomRenderBarProps
  typingSpeed?: number
  disableTyping?: boolean
  isStreaming?: boolean
  onSend?: (content: OnSendContentParams) => void // 用户操作后的回调
}

const MarkdownFlow: React.FC<MarkdownFlowProps> = ({
  contents,
  customRenderBar,
  disableTyping,
  isStreaming = false,
  typingSpeed = 30,
  onSend
}) => {
  return (
    <div className='markdown-flow'>
      {contents?.map((content, index) => (
        <ContentRender
          key={index}
          content={content}
          customRenderBar={customRenderBar}
          onSend={onSend}
          disableTyping={disableTyping}
          isStreaming={isStreaming}
          typingSpeed={typingSpeed}
        />
      ))}
    </div>
  )
}

export default MarkdownFlow
