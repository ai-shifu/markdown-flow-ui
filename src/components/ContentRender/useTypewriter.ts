import { useState, useEffect, useRef, useCallback } from 'react'

interface UseTypewriterProps {
  content: string
  typingSpeed?: number
  isStreaming?: boolean
  disabled?: boolean
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
  isStreaming = false,
  disabled = false
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

  // 更安全的字符处理函数
  const getCharacterAt = useCallback((str: string, index: number): string => {
    // 处理代理对（surrogate pairs）- 用于emoji和其他Unicode字符
    if (index >= str.length) return ''
    
    const char = str.charAt(index)
    // 检查是否是代理对的开始
    if (char >= '\uD800' && char <= '\uDBFF' && index + 1 < str.length) {
      const nextChar = str.charAt(index + 1)
      if (nextChar >= '\uDC00' && nextChar <= '\uDFFF') {
        return char + nextChar // 返回完整的代理对
      }
    }
    return char
  }, [])

  // 获取下一个字符的长度（用于正确递增索引）
  const getCharacterLength = useCallback((str: string, index: number): number => {
    if (index >= str.length) return 0
    
    const char = str.charAt(index)
    if (char >= '\uD800' && char <= '\uDBFF' && index + 1 < str.length) {
      const nextChar = str.charAt(index + 1)
      if (nextChar >= '\uDC00' && nextChar <= '\uDFFF') {
        return 2
      }
    }
    return 1
  }, [])

  // 打字机核心逻辑
  const typeWriter = useCallback(() => {
    if (indexRef.current < contentRef.current.length) {
      const char = getCharacterAt(contentRef.current, indexRef.current)
      const charLength = getCharacterLength(contentRef.current, indexRef.current)
      
      setDisplayContent(prev => prev + char)
      indexRef.current += charLength
      timerRef.current = setTimeout(typeWriter, typingSpeed)
    } else {
      setIsTyping(false)
    }
  }, [typingSpeed, getCharacterAt, getCharacterLength])

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
    // 如果禁用了打字机效果，直接显示全部内容
    if (disabled) {
      clearTimer()
      setDisplayContent(content)
      setIsTyping(false)
      contentRef.current = content
      indexRef.current = content.length
      previousContentRef.current = content
      return
    }

    if (isStreaming) {
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
  }, [content, isStreaming, start, typeWriter, clearTimer, disabled])

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