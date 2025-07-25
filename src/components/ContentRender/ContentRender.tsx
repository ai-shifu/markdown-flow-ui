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
import useTypewriter from './useTypewriter' // 引入自定义Hook

// 定义组件 Props 类型
interface ContentRenderProps {
  content: string
  customRenderBar?: React.ReactNode
  onButtonClick?: (buttonText: string) => void
  onVariableSet?: (variableName: string, value: string) => void
  typingSpeed?: number
  isStreaming?: boolean
}

// 扩展组件接口
type CustomComponents = ComponentsWithCustomVariable &
  ComponentsWithCustomButton

const ContentRender: React.FC<ContentRenderProps> = ({ 
  content, 
  customRenderBar,
  onButtonClick, 
  onVariableSet,
  typingSpeed = 30,
  isStreaming = false
}) => {
  // 使用自定义Hook处理打字机效果
  const { displayContent, isTyping } = useTypewriter({
    content,
    typingSpeed,
    isStreaming
  })

  const components: CustomComponents = {
    'custom-variable': (props) => (
      <CustomButtonInputVariable 
        {...props} 
        onVariableSet={onVariableSet}
      />
    ),
    'custom-button': (props) => (
      <CustomButton {...props} onButtonClick={onButtonClick} />
    )
  }

  return (
    <div className='content-render'>
      <ReactMarkdown
        remarkPlugins={[
          remarkCustomButtonInputVariable,
          remarkCustomButton
        ]}
        components={components}
      >
        {displayContent}
      </ReactMarkdown>
      {customRenderBar}
      {isTyping && (
        <span className="typing-cursor ml-1 animate-pulse">|</span>
      )}
    </div>
  )
}

export default ContentRender