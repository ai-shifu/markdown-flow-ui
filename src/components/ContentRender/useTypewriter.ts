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

  // 解析内容，识别各种 Markdown 语法块
  const parseContent = (text: string) => {
    const segments: string[] = []
    let i = 0

    while (i < text.length) {
      const char = text[i]

      // 1. 标题 (# 开头的行)
      if (char === '#' && (i === 0 || text[i - 1] === '\n')) {
        // 找到行结束
        let lineEnd = text.indexOf('\n', i)
        if (lineEnd === -1) lineEnd = text.length
        segments.push(text.substring(i, lineEnd + (lineEnd < text.length ? 1 : 0)))
        i = lineEnd + (lineEnd < text.length ? 1 : 0)
        continue
      }

      // 2. 代码块 (``` 开头)
      if (char === '`' && text[i + 1] === '`' && text[i + 2] === '`') {
        const blockEnd = text.indexOf('```', i + 3)
        if (blockEnd !== -1) {
          segments.push(text.substring(i, blockEnd + 3))
          i = blockEnd + 3
          continue
        }
      }

      // 3. 行内代码 (`code`)
      if (char === '`') {
        const inlineEnd = text.indexOf('`', i + 1)
        if (inlineEnd !== -1) {
          segments.push(text.substring(i, inlineEnd + 1))
          i = inlineEnd + 1
          continue
        }
      }

      // 4. 链接 [text](url)
      if (char === '[') {
        const closeBracket = text.indexOf(']', i)
        if (closeBracket !== -1 && text[closeBracket + 1] === '(') {
          const closeParen = text.indexOf(')', closeBracket)
          if (closeParen !== -1) {
            segments.push(text.substring(i, closeParen + 1))
            i = closeParen + 1
            continue
          }
        }
      }

      // 5. 图片 ![alt](url)
      if (char === '!' && text[i + 1] === '[') {
        const closeBracket = text.indexOf(']', i + 1)
        if (closeBracket !== -1 && text[closeBracket + 1] === '(') {
          const closeParen = text.indexOf(')', closeBracket)
          if (closeParen !== -1) {
            segments.push(text.substring(i, closeParen + 1))
            i = closeParen + 1
            continue
          }
        }
      }

      // 6. 引用块 (> 开头的行)
      if (char === '>' && (i === 0 || text[i - 1] === '\n')) {
        let lineEnd = text.indexOf('\n', i)
        if (lineEnd === -1) lineEnd = text.length
        segments.push(text.substring(i, lineEnd + (lineEnd < text.length ? 1 : 0)))
        i = lineEnd + (lineEnd < text.length ? 1 : 0)
        continue
      }

      // 7. 原有的标记块 ?[text]
      if (char === '?' && text[i + 1] === '[') {
        const closeBracket = text.indexOf(']', i + 2)
        if (closeBracket !== -1) {
          segments.push(text.substring(i, closeBracket + 1))
          i = closeBracket + 1
          continue
        }
      }

      // 8. 粗体 **text**
      if (char === '*' && text[i + 1] === '*') {
        const boldEnd = text.indexOf('**', i + 2)
        if (boldEnd !== -1) {
          segments.push(text.substring(i, boldEnd + 2))
          i = boldEnd + 2
          continue
        }
      }

      // 9. 斜体 *text*
      if (char === '*' && text[i + 1] !== '*') {
        const italicEnd = text.indexOf('*', i + 1)
        if (italicEnd !== -1) {
          segments.push(text.substring(i, italicEnd + 1))
          i = italicEnd + 1
          continue
        }
      }

      // 10. 删除线 ~~text~~
      if (char === '~' && text[i + 1] === '~') {
        const strikeEnd = text.indexOf('~~', i + 2)
        if (strikeEnd !== -1) {
          segments.push(text.substring(i, strikeEnd + 2))
          i = strikeEnd + 2
          continue
        }
      }

      // 11. 分割线
      if ((char === '-' && text[i + 1] === '-' && text[i + 2] === '-') ||
        (char === '*' && text[i + 1] === '*' && text[i + 2] === '*')) {
        let lineEnd = text.indexOf('\n', i)
        if (lineEnd === -1) lineEnd = text.length
        segments.push(text.substring(i, lineEnd + (lineEnd < text.length ? 1 : 0)))
        i = lineEnd + (lineEnd < text.length ? 1 : 0)
        continue
      }

      // 普通字符
      segments.push(char)
      i++
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