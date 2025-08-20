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

const useTypewriterStream = ({
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
  const lastParsedLengthRef = useRef(0)

  // Cleanup function
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // 增量解析内容 - 只解析新增的部分
  const parseIncrementalContent = useCallback((fullText: string, previousLength: number): Segment[] => {
    const segments: Segment[] = []
    
    // 如果是全新内容，解析整个文本
    if (previousLength === 0) {
      return parseFullContent(fullText)
    }
    
    // 只解析新增的部分
    const newContent = fullText.substring(previousLength)
    if (!newContent) return []
    
    // 对新增内容进行简单的字符级分段
    // 不使用正则匹配，避免不完整的 Markdown 格式导致的问题
    for (const char of newContent) {
      segments.push({
        content: char,
        isMarkdown: false
      })
    }
    
    return segments
  }, [])

  // 完整解析内容 - 用于初始内容或内容重置
  const parseFullContent = useCallback((text: string): Segment[] => {
    const segments: Segment[] = []
    
    // 简单地将每个字符作为一个段
    // 这样可以避免正则匹配的问题
    for (const char of text) {
      segments.push({
        content: char,
        isMarkdown: false
      })
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
      lastParsedLengthRef.current = newContent.length
      return
    }

    // 检查是否是内容增长
    const isContentGrowth = newContent.length >= oldContent.length && newContent.startsWith(oldContent)

    if (isContentGrowth && oldContent) {
      // 内容增长：只解析新增部分
      const newSegments = parseIncrementalContent(newContent, lastParsedLengthRef.current)
      parsedSegmentsRef.current = [...parsedSegmentsRef.current, ...newSegments]
      lastParsedLengthRef.current = newContent.length

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
      const segments = parseFullContent(newContent)
      parsedSegmentsRef.current = segments
      displayIndexRef.current = 0
      lastParsedLengthRef.current = newContent.length
      
      const isNowComplete = segments.length === 0
      setIsComplete(isNowComplete)
      
      if (!isNowComplete && newContent && isMountedRef.current) {
        setIsTyping(true)
        type()
      }
    }

    lastContentRef.current = newContent
  }, [content, disabled, clearTimer, parseIncrementalContent, parseFullContent, type, isTyping])

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
    lastParsedLengthRef.current = 0
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

export default useTypewriterStream