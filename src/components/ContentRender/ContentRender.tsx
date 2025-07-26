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
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github.css'
import highlightLanguages from './utils/highlightLanguages'
import useTypewriter from './useTypewriter'
import './contentRender.css'
import { OnSendContentParams } from '@/components/types'
import "@/styles/globals.css";


// 定义组件 Props 类型
interface ContentRenderProps {
  content: string
  customRenderBar?: React.ReactNode
  onSend?: (content: OnSendContentParams) => void
  typingSpeed?: number
  disableTyping?: boolean
  isStreaming?: boolean
}

// 扩展组件接口
type CustomComponents = ComponentsWithCustomVariable &
  ComponentsWithCustomButton

const ContentRender: React.FC<ContentRenderProps> = ({
  content,
  customRenderBar,
  onSend,
  typingSpeed = 30,
  disableTyping = false,
  isStreaming = false,
  
}) => {
  // 使用自定义Hook处理打字机效果
  const { displayContent, isTyping } = useTypewriter({
    content,
    typingSpeed,
    isStreaming,
    disabled: disableTyping
  })

  const components: CustomComponents = {
    'custom-variable': props => (
      <CustomButtonInputVariable {...props} onSend={onSend} />
    ),
    'custom-button': props => (
      <CustomButton {...props} onSend={onSend} />
    ),
    // 自定义代码块组件以支持更好的高亮效果
    code: props => {
      const { inline, className, children, ...rest } = props as any
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <code className={className} {...rest}>
          {children}
        </code>
      ) : (
        <code className={className} {...rest}>
          {children}
        </code>
      )
    },
    table: ({ node, ...props }) => (
      <div className='content-render-table-container'>
        <table className='content-render-table' {...props} />
      </div>
    ),
    th: ({ node, ...props }) => <th className='content-render-th' {...props} />,
    td: ({ node, ...props }) => <td className='content-render-td' {...props} />,
    tr: ({ node, ...props }) => <tr className='content-render-tr' {...props} />,
    li: ({ node, ...props }) => {
      const className = node?.properties?.className;
      const hasTaskListItem =
        (typeof className === 'string' && className.includes('task-list-item')) ||
        (Array.isArray(className) && className.includes('task-list-item'));
      if (hasTaskListItem) {
        return <li className='content-render-task-list-item' {...props} />
      }
      return <li {...props} />
    },
    input: ({ node, ...props }) => {
      if (props.type === 'checkbox') {
        return (
          <input
            type='checkbox'
            className='content-render-checkbox'
            disabled
            {...props}
          />
        )
      }
      return <input {...props} />
    }
  }

  return (
    <div className='content-render'>
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
          remarkCustomButtonInputVariable,
          remarkCustomButton
        ]}
        rehypePlugins={[
          [
            rehypeHighlight,
            {
              languages: highlightLanguages,
              subset: [
                'javascript',
                'typescript',
                'python',
                'java',
                'html',
                'css',
                'json',
                'bash',
                'sql',
                'markdown'
              ]
            }
          ]
        ]}
        components={components}
      >
        {displayContent}
      </ReactMarkdown>
      {customRenderBar}
      {isTyping && <span className='typing-cursor ml-1 animate-pulse'>|</span>}
    </div>
  )
}

export default ContentRender
