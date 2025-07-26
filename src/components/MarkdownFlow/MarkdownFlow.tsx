import React from 'react'
import ContentRender from '../ContentRender'
import { ContentRenderProps } from '@/components/ContentRender/ContentRender'

// 定义组件 Props 类型
interface MarkdownFlowProps {
  contentList?: ContentRenderProps[]
}

const MarkdownFlow: React.FC<MarkdownFlowProps> = ({ contentList }) => {
  return (
    <div className='markdown-flow'>
      {contentList?.map((contentInfo, index) => (
        <ContentRender key={index} {...contentInfo} />
      ))}
    </div>
  )
}

export default MarkdownFlow
