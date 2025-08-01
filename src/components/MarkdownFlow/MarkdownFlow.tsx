import React from 'react'
import ContentRender from '../ContentRender'
import { ContentRenderProps } from '@/components/ContentRender/ContentRender'
import './markdownFlow.css'

// 定义组件 Props 类型
interface MarkdownFlowProps {
  contentList?: {
    content: string
    defaultInputText?: string
    defaultButtonText?: string
    defaultVariableName?: string
    readonly?: boolean
  }[]
  currentContent?: ContentRenderProps
}

const MarkdownFlow: React.FC<MarkdownFlowProps> = ({
  contentList,
  currentContent
}) => {
  return (
    <div className='markdown-flow'>
      {contentList?.map((contentInfo, index) => (
        <ContentRender key={index} {...contentInfo} />
      ))}
      {currentContent ? <ContentRender {...currentContent} /> : ''}
    </div>
  )
}

export default MarkdownFlow
