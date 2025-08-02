import React, { useRef } from 'react'
import MarkdownFlow from './MarkdownFlow'
import useScrollToBottom from './useScrollToBottom'
import { OnSendContentParams, CustomRenderBarProps } from '@/components/types'
import { ChevronDown } from 'lucide-react'
import { Button } from '../ui/button'

import './markdownFlow.css'

interface ScrollableMarkdownFlowProps {
  initialContentList?: {
    content: string
    isFinished?: boolean
    defaultInputText?: string
    defaultButtonText?: string
    readonly?: boolean
  }[]
  customRenderBar?: CustomRenderBarProps
  onSend?: (content: OnSendContentParams) => void
  typingSpeed?: number
  disableTyping?: boolean
  height?: string | number
  className?: string
}

const ScrollableMarkdownFlow: React.FC<ScrollableMarkdownFlowProps> = ({
  initialContentList = [],
  customRenderBar,
  onSend,
  typingSpeed,
  disableTyping,
  height = '100%',
  className = '',
  ...restProps
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const { showScrollToBottom, handleUserScrollToBottom } = useScrollToBottom(
    containerRef,
    [
      initialContentList?.length >= 1
        ? JSON.stringify(initialContentList[initialContentList?.length - 1])
        : null
    ],
    {
      // 监听内容数量变化
      behavior: 'smooth',
      autoScrollOnInit: true,
      scrollDelay: 100
    }
  )

  return (
    <div
      className={`scrollable-markdown-container ${className}`}
      style={{ height, position: 'relative' }}
      {...restProps}
    >
      <div ref={containerRef} style={{ height: '100%', overflow: 'auto' }}>
        <MarkdownFlow
          initialContentList={initialContentList}
          customRenderBar={customRenderBar}
          onSend={onSend}
          typingSpeed={typingSpeed}
          disableTyping={disableTyping}
        />
      </div>
      {showScrollToBottom && (
        <Button
          className='h-6 w-6 border hover:bg-gray-200 scroll-to-bottom-btn'
          type='button'
          variant='ghost'
          size='icon'
          onClick={handleUserScrollToBottom}
          aria-label='滚动到底部'
        >
          <ChevronDown />
        </Button>
      )}
    </div>
  )
}

export default ScrollableMarkdownFlow
