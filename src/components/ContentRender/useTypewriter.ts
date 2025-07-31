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

  // Markdown 模式定义（按优先级排序）
  const markdownPatterns = [
    // 自定义标记块 ?[xxx]（最高优先级）
    { pattern: /\?\[[^\]]*\]/, type: 'custom-tag' },
    
    // 代码块
    { pattern: /```[\s\S]*?```/, type: 'code-block' },
    
    // 标题（行首的 #）
    { pattern: /^#{1,6}\s[^\n]*$/m, type: 'header' },
    
    // 粗斜体
    { pattern: /\*\*\*[^*]+\*\*\*/, type: 'bold-italic' },
    
    // 粗体
    { pattern: /\*\*[^*]+\*\*/, type: 'bold' },
    
    // 斜体
    { pattern: /(?<!\*)\*[^*]+\*(?!\*)/, type: 'italic' },
    
    // 删除线
    { pattern: /~~[^~]+~~/, type: 'strikethrough' },
    
    // 行内代码
    { pattern: /`[^`]+`/, type: 'inline-code' },
    
    // 图片
    { pattern: /!\[[^\]]*\]\([^\)]*\)/, type: 'image' },
    
    // 链接
    { pattern: /(?<!\!)\[[^\]]*\]\([^\)]*\)/, type: 'link' },
    
    // 引用块（整行）
    { pattern: /^(>\s*)+[^\n]*$/m, type: 'blockquote' },
    
    // 分割线
    { pattern: /^[-*]{3,}$/m, type: 'hr' },
    
    // 无序列表项
    { pattern: /^[*-]\s+[^\n]*$/m, type: 'list-item' },
    
    // 有序列表项
    { pattern: /^\d+\.\s+[^\n]*$/m, type: 'ordered-list-item' },
  ]

  // 解析内容，识别各种 Markdown 语法块
  const parseContent = (text: string) => {
    const segments: string[] = []
    let remainingText = text
    
    while (remainingText.length > 0) {
      let matched = false
      let earliestMatch: { match: RegExpExecArray; pattern: typeof markdownPatterns[0] } | null = null
      let earliestIndex = Infinity
      
      // 查找所有模式中最早匹配的
      for (const pattern of markdownPatterns) {
        const match = pattern.pattern.exec(remainingText)
        if (match && match.index < earliestIndex) {
          earliestIndex = match.index
          earliestMatch = { match, pattern }
        }
      }
      
      if (earliestMatch && earliestIndex >= 0) {
        // 如果在匹配之前有普通文本，先添加普通文本
        if (earliestIndex > 0) {
          segments.push(remainingText.substring(0, earliestIndex))
          remainingText = remainingText.substring(earliestIndex)
        }
        
        // 添加匹配到的 Markdown 语法块
        segments.push(earliestMatch.match[0])
        remainingText = remainingText.substring(earliestMatch.match[0].length)
        matched = true
      }
      
      // 如果没有匹配到任何模式，添加第一个字符
      if (!matched) {
        segments.push(remainingText[0])
        remainingText = remainingText.substring(1)
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
        setDisplayContent(prev => prev + segments[currentIndex])
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