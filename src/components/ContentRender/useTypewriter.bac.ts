import { useState, useEffect, useRef } from 'react'

interface UseTypewriterProps {
  content: string
  typingSpeed?: number
  disabled?: boolean
}

const useTypewriter = ({
  content,
  typingSpeed = 30,
  disabled = false
}: UseTypewriterProps) => {
  const [displayContent, setDisplayContent] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 清理定时器
  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  // 解析内容，将标记块视为单个字符
  const parseContent = (text: string) => {
    const segments: string[] = []
    let i = 0
    
    while (i < text.length) {
      // 检查是否是标记块开始
      if (text[i] === '?' && text[i + 1] === '[') {
        let endIndex = text.indexOf(']', i + 2)
        if (endIndex !== -1) {
          // 找到完整的标记块
          segments.push(text.substring(i, endIndex + 1))
          i = endIndex + 1
        } else {
          // 没有找到结束符，当作普通字符处理
          segments.push(text[i])
          i++
        }
      } else {
        // 普通字符
        segments.push(text[i])
        i++
      }
    }
    
    return segments
  }

  useEffect(() => {
    // 如果禁用，直接显示全部内容
    if (disabled) {
      clearTimer()
      setDisplayContent(content)
      setIsTyping(false)
      return
    }

    clearTimer()
    setDisplayContent('')
    setIsTyping(true)

    const segments = parseContent(content)
    let currentIndex = 0

    const type = () => {
      if (currentIndex < segments.length) {
        setDisplayContent(prev => prev + (segments[currentIndex] || ''))
        currentIndex++
        timerRef.current = setTimeout(type, typingSpeed)
      } else {
        setIsTyping(false)
      }
    }

    type()

    return () => clearTimer()
  }, [content, typingSpeed, disabled])

  const reset = () => {
    clearTimer()
    setDisplayContent('')
    setIsTyping(false)
  }

  const start = () => {
    clearTimer()
    setDisplayContent('')
    setIsTyping(true)
  }

  return {
    displayContent,
    isTyping,
    reset,
    start
  }
}

export default useTypewriter