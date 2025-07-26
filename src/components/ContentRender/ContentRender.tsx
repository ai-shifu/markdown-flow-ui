import React, { useEffect, useState } from 'react'
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
import { highlightLanguages, subsetLanguages } from './utils/highlightLanguages'
import useTypewriter from './useTypewriter'
import './contentRender.css'
import { OnSendContentParams, CustomRenderBarProps } from '@/components/types'
import '@/styles/globals.css'
import remarkBreaks from 'remark-breaks'

// 定义组件 Props 类型
export interface ContentRenderProps  {
  content: string
  customRenderBar?: CustomRenderBarProps
  onSend?: (content: OnSendContentParams) => void
  typingSpeed?: number
  disableTyping?: boolean
  isStreaming?: boolean
  defaultButtonText?: string
  defaultVariableName?: string // 用户设置变量的名称
  defaultInputText?: string // 用户输入的文本
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
  defaultButtonText,
  defaultInputText
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
      <CustomButtonInputVariable {...props} defaultButtonText={defaultButtonText} defaultInputText={defaultInputText} onSend={onSend} />
    ),
    'custom-button': props => <CustomButton {...props} defaultButtonText={defaultButtonText} onSend={onSend} />,
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
      const className = node?.properties?.className
      const hasTaskListItem =
        (typeof className === 'string' &&
          className.includes('task-list-item')) ||
        (Array.isArray(className) && className.includes('task-list-item'))
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
          remarkCustomButton,
          remarkBreaks
        ]}
        rehypePlugins={[
          [
            rehypeHighlight,
            {
              languages: highlightLanguages,
              subset: subsetLanguages
            }
          ]
        ]}
        components={components}
      >
        {displayContent}
      </ReactMarkdown>
      {customRenderBar &&
        React.createElement(customRenderBar, {
          content,
          displayContent,
          onSend
        })}
      {isTyping && <span className='typing-cursor ml-1 animate-pulse'>|</span>}
    </div>
  )
}

export default ContentRender
