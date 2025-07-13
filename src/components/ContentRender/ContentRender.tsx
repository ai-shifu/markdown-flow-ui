import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkCustomButton from './plugins/remark-custom-button'
import CustomButton, {
  ComponentsWithCustomButton
} from './plugins/CustomButton'

// 定义组件 Props 类型
interface ContentRenderProps {
  content: string
}

interface CustomComponents extends ComponentsWithCustomButton {}

const ContentRender: React.FC<ContentRenderProps> = ({ content }) => {
  const components: CustomComponents = {
    customButton: CustomButton
  }

  return (
    <div className='content-render'>
      <ReactMarkdown
        remarkPlugins={[remarkCustomButton]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default ContentRender
