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
import remarkGfm from 'remark-gfm' // GitHub Flavored Markdown
import rehypeHighlight from 'rehype-highlight' // 代码高亮
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import html from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import sql from 'highlight.js/lib/languages/sql'
import markdown from 'highlight.js/lib/languages/markdown'
import 'highlight.js/styles/github.css' // 引入样式
import useTypewriter from './useTypewriter'

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
    ),
    // 自定义代码块组件以支持更好的高亮效果
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <code className={className} {...props}>
          {children}
        </code>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      )
    }
  }

  return (
    <div className='content-render'>
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm, // 添加GitHub Flavored Markdown支持
          remarkCustomButtonInputVariable,
          remarkCustomButton
        ]}
        rehypePlugins={[
          [rehypeHighlight, {
            languages: {
              javascript,
              js: javascript,
              typescript,
              ts: typescript,
              python,
              py: python,
              java,
              html,
              css,
              json,
              bash,
              sh: bash,
              sql,
              markdown,
              md: markdown
            },
            subset: [
              'javascript', 'typescript', 'python', 'java', 'html', 'css', 
              'json', 'bash', 'sql', 'markdown'
            ]
          }]
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