import { useState, useEffect, useRef, useCallback } from 'react'

interface UseTypewriterProps {
  content: string
  typingSpeed?: number
  isStreaming?: boolean
}

interface UseTypewriterReturn {
  displayContent: string
  isTyping: boolean
  reset: () => void
  start: () => void
}

const useTypewriter = ({
  content,
  typingSpeed = 30,
  isStreaming = false
}: UseTypewriterProps): UseTypewriterReturn => {
  const [displayContent, setDisplayContent] = useState<string>('')
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const contentRef = useRef<string>('')
  const indexRef = useRef<number>(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const previousContentRef = useRef<string>('')

  // 清理定时器
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // 打字机核心逻辑
  const typeWriter = useCallback(() => {
    if (indexRef.current < contentRef.current.length) {
      setDisplayContent(prev => prev + contentRef.current.charAt(indexRef.current))
      indexRef.current++
      timerRef.current = setTimeout(typeWriter, typingSpeed)
    } else {
      setIsTyping(false)
    }
  }, [typingSpeed])

  // 重置打字机
  const reset = useCallback(() => {
    clearTimer()
    contentRef.current = ''
    indexRef.current = 0
    setDisplayContent('')
    setIsTyping(false)
    previousContentRef.current = ''
  }, [clearTimer])

  // 启动打字机
  const start = useCallback(() => {
    clearTimer()
    contentRef.current = content
    indexRef.current = 0
    setIsTyping(true)
    setDisplayContent('')
    typeWriter()
  }, [clearTimer, content, typeWriter])

  // 处理内容变化
  useEffect(() => {
    if (isStreaming) {
      // 流式模式：只处理新增内容
      if (content.length > previousContentRef.current.length) {
        clearTimer()
        const newContent = content.slice(previousContentRef.current.length)
        contentRef.current = newContent
        indexRef.current = 0
        setIsTyping(true)
        typeWriter()
      }
    } else {
      // 普通模式：完整重新开始
      start()
    }
    
    previousContentRef.current = content
  }, [content, isStreaming, start, typeWriter, clearTimer])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      clearTimer()
    }
  }, [clearTimer])

  return {
    displayContent,
    isTyping,
    reset,
    start
  }
}

export default useTypewriter