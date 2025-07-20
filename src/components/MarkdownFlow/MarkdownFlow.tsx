import React from 'react'
import ContentRender from '../ContentRender'

// 定义组件 Props 类型
interface MarkdownFlowProps {
  contents: string[]
  customRenderBar?: React.ReactNode // 可选的自定义渲染栏
  onButtonClick?: (buttonText: string) => void
  onVariableSet?: (variableName: string, value: string) => void
}

const MarkdownFlow: React.FC<MarkdownFlowProps> = ({
  contents,
  customRenderBar,
  onButtonClick,
  onVariableSet
}) => {
  return (
    <div className='markdown-flow'>
      {contents?.map((content, index) => (
        <ContentRender
          key={index}
          content={content}
          customRenderBar={customRenderBar}
          onButtonClick={onButtonClick}
          onVariableSet={onVariableSet}
        />
      ))}
    </div>
  )
}

export default MarkdownFlow
