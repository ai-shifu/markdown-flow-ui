import React from 'react'
import ContentRender from '../ContentRender'
import { OnSendContentParams } from '@/components/types'

// 定义组件 Props 类型
interface MarkdownFlowProps {
  contents: string[]
  customRenderBar?: React.ReactNode // 可选的自定义渲染栏
  onSend?: (content: OnSendContentParams) => void // 用户操作后的回调
}

const MarkdownFlow: React.FC<MarkdownFlowProps> = ({
  contents,
  customRenderBar,
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
        />
      ))}
    </div>
  )
}

export default MarkdownFlow
