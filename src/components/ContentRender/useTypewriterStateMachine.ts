import { useState, useEffect, useRef, useCallback } from 'react'

interface UseTypewriterProps {
  content?: string
  typingSpeed?: number
  disabled?: boolean
}

interface Segment {
  content: string
  isMarkdown: boolean
  type?: string
}

// 状态机状态
type ParseState = 'normal' | 'code_block' | 'inline_code' | 'bold' | 'italic' | 'link_text' | 'link_url' | 'custom_tag'

interface ParserState {
  state: ParseState
  buffer: string
  depth: number
  tempBuffer: string
}

const useTypewriterStateMachine = ({
  content = '',
  typingSpeed = 80,
  disabled = false
}: UseTypewriterProps = {}) => {
  const [displayContent, setDisplayContent] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const parsedSegmentsRef = useRef<Segment[]>([])
  const displayIndexRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMountedRef = useRef(true)
  const lastContentRef = useRef('')
  const parserStateRef = useRef<ParserState>({
    state: 'normal',
    buffer: '',
    depth: 0,
    tempBuffer: ''
  })

  // Cleanup function
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // 状态机解析器 - 增量解析
  const parseWithStateMachine = useCallback((newChars: string): Segment[] => {
    const segments: Segment[] = []
    const state = parserStateRef.current
    
    for (let i = 0; i < newChars.length; i++) {
      const char = newChars[i]
      const nextChar = newChars[i + 1]
      const nextNextChar = newChars[i + 2]
      
      switch (state.state) {
        case 'normal':
          // 检查自定义标签 ?[
          if (char === '?' && nextChar === '[') {
            if (state.buffer) {
              // 输出之前的普通文本
              for (const c of state.buffer) {
                segments.push({ content: c, isMarkdown: false })
              }
              state.buffer = ''
            }
            state.state = 'custom_tag'
            state.tempBuffer = '?['
            i++
          }
          // 检查代码块开始
          else if (char === '`' && nextChar === '`' && nextNextChar === '`') {
            if (state.buffer) {
              // 输出之前的普通文本
              for (const c of state.buffer) {
                segments.push({ content: c, isMarkdown: false })
              }
              state.buffer = ''
            }
            state.state = 'code_block'
            state.tempBuffer = '```'
            i += 2
          }
          // 检查内联代码
          else if (char === '`') {
            if (state.buffer) {
              for (const c of state.buffer) {
                segments.push({ content: c, isMarkdown: false })
              }
              state.buffer = ''
            }
            state.state = 'inline_code'
            state.tempBuffer = '`'
          }
          // 检查加粗
          else if (char === '*' && nextChar === '*') {
            if (state.buffer) {
              for (const c of state.buffer) {
                segments.push({ content: c, isMarkdown: false })
              }
              state.buffer = ''
            }
            state.state = 'bold'
            state.tempBuffer = '**'
            i++
          }
          // 检查斜体
          else if (char === '*') {
            if (state.buffer) {
              for (const c of state.buffer) {
                segments.push({ content: c, isMarkdown: false })
              }
              state.buffer = ''
            }
            state.state = 'italic'
            state.tempBuffer = '*'
          }
          // 检查链接
          else if (char === '[') {
            if (state.buffer) {
              for (const c of state.buffer) {
                segments.push({ content: c, isMarkdown: false })
              }
              state.buffer = ''
            }
            state.state = 'link_text'
            state.tempBuffer = '['
          }
          else {
            state.buffer += char
          }
          break
          
        case 'code_block':
          state.tempBuffer += char
          // 检查代码块结束
          if (char === '`' && nextChar === '`' && nextNextChar === '`') {
            state.tempBuffer += '``'
            segments.push({ content: state.tempBuffer, isMarkdown: true, type: 'code-block' })
            state.tempBuffer = ''
            state.state = 'normal'
            i += 2
          }
          break
          
        case 'inline_code':
          state.tempBuffer += char
          if (char === '`') {
            segments.push({ content: state.tempBuffer, isMarkdown: true, type: 'inline-code' })
            state.tempBuffer = ''
            state.state = 'normal'
          }
          break
          
        case 'bold':
          state.tempBuffer += char
          if (char === '*' && nextChar === '*') {
            state.tempBuffer += '*'
            segments.push({ content: state.tempBuffer, isMarkdown: true, type: 'bold' })
            state.tempBuffer = ''
            state.state = 'normal'
            i++
          }
          break
          
        case 'italic':
          state.tempBuffer += char
          if (char === '*' && nextChar !== '*') {
            segments.push({ content: state.tempBuffer, isMarkdown: true, type: 'italic' })
            state.tempBuffer = ''
            state.state = 'normal'
          }
          break
          
        case 'link_text':
          state.tempBuffer += char
          if (char === ']' && nextChar === '(') {
            state.tempBuffer += '('
            state.state = 'link_url'
            i++
          }
          break
          
        case 'link_url':
          state.tempBuffer += char
          if (char === ')') {
            segments.push({ content: state.tempBuffer, isMarkdown: true, type: 'link' })
            state.tempBuffer = ''
            state.state = 'normal'
          }
          break
          
        case 'custom_tag':
          state.tempBuffer += char
          if (char === ']') {
            segments.push({ content: state.tempBuffer, isMarkdown: true, type: 'custom-tag' })
            state.tempBuffer = ''
            state.state = 'normal'
          }
          break
      }
    }
    
    // 处理剩余的普通文本
    if (state.state === 'normal' && state.buffer) {
      for (const c of state.buffer) {
        segments.push({ content: c, isMarkdown: false })
      }
      state.buffer = ''
    }
    
    return segments
  }, [])

  // Typing function
  const type = useCallback(() => {
    if (!isMountedRef.current) return

    if (displayIndexRef.current < parsedSegmentsRef.current.length) {
      const segment = parsedSegmentsRef.current[displayIndexRef.current]
      setDisplayContent(prev => prev + (segment?.content || ''))
      displayIndexRef.current++
      
      if (isMountedRef.current) {
        timerRef.current = setTimeout(type, typingSpeed)
      }
    } else {
      setIsTyping(false)
      setIsComplete(true)
    }
  }, [typingSpeed])

  // Main effect
  useEffect(() => {
    const newContent = content || ''
    const oldContent = lastContentRef.current

    // 如果内容相同，不处理
    if (newContent === oldContent) {
      return
    }

    // 禁用模式：立即显示全部
    if (disabled) {
      clearTimer()
      setDisplayContent(newContent)
      setIsTyping(false)
      setIsComplete(true)
      lastContentRef.current = newContent
      return
    }

    // 检查是否是内容增长
    const isContentGrowth = newContent.length >= oldContent.length && newContent.startsWith(oldContent)

    if (isContentGrowth && oldContent) {
      // 内容增长：只解析新增部分
      const newChars = newContent.substring(oldContent.length)
      const newSegments = parseWithStateMachine(newChars)
      parsedSegmentsRef.current = [...parsedSegmentsRef.current, ...newSegments]

      // 更新完成状态
      const isNowComplete = displayIndexRef.current >= parsedSegmentsRef.current.length
      setIsComplete(isNowComplete)
      
      // 如果还有内容要打，确保打字机继续工作
      if (!isNowComplete && !isTyping) {
        setIsTyping(true)
        type()
      }
    } else {
      // 全新内容：重新开始
      clearTimer()
      setDisplayContent('')
      
      // 重置解析器状态
      parserStateRef.current = {
        state: 'normal',
        buffer: '',
        depth: 0,
        tempBuffer: ''
      }
      
      const segments = parseWithStateMachine(newContent)
      parsedSegmentsRef.current = segments
      displayIndexRef.current = 0
      
      const isNowComplete = segments.length === 0
      setIsComplete(isNowComplete)
      
      if (!isNowComplete && newContent && isMountedRef.current) {
        setIsTyping(true)
        type()
      }
    }

    lastContentRef.current = newContent
  }, [content, disabled, clearTimer, parseWithStateMachine, type, isTyping])

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      clearTimer()
    }
  }, [clearTimer])

  const reset = useCallback(() => {
    clearTimer()
    setDisplayContent('')
    parsedSegmentsRef.current = []
    displayIndexRef.current = 0
    setIsTyping(false)
    setIsComplete(false)
    lastContentRef.current = ''
    parserStateRef.current = {
      state: 'normal',
      buffer: '',
      depth: 0,
      tempBuffer: ''
    }
  }, [clearTimer])

  const start = useCallback(() => {
    clearTimer()
    displayIndexRef.current = 0
    setDisplayContent('')
    setIsTyping(true)
    setIsComplete(false)
    type()
  }, [clearTimer, type])

  return {
    displayContent,
    isTyping,
    isComplete,
    reset,
    start,
    getSegments: () => parsedSegmentsRef.current
  }
}

export default useTypewriterStateMachine