import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkCustomButton from './plugins/remark-custom-button'
import CustomButton, {
  ComponentsWithCustomButton
} from './plugins/CustomButton'

import remarkCustomButtonInputVariable from './plugins/remark-custom-variable'
import CustomButtonInputVariable, {
  ComponentsWithCustomVariable
} from './plugins/CustomVariable'

// 定义组件 Props 类型
interface ContentRenderProps {
  content: string
}

// 扩展组件接口
type CustomComponents = ComponentsWithCustomVariable &
  ComponentsWithCustomButton

const ContentRender: React.FC<ContentRenderProps> = ({ content }) => {
  const components: CustomComponents = {
    'custom-variable': CustomButtonInputVariable,
    'custom-button': CustomButton
  }

  return (
    <div className='content-render'>
      <ReactMarkdown
        remarkPlugins={[
          remarkCustomButtonInputVariable, // 处理复杂按钮插件
          remarkCustomButton // 处理简单按钮插件
        ]}
        components={components} // 使用正确的组件映射
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default ContentRender
