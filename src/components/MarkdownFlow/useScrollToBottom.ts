import { useRef, useEffect, useCallback, RefObject, useState } from 'react'

interface UseScrollToBottomOptions {
  behavior?: 'smooth' | 'auto'
  autoScrollOnInit?: boolean
  scrollDelay?: number
  scrollThreshold?: number
}

interface UseScrollToBottomReturn {
  showScrollToBottom: boolean
  scrollToBottom: () => void
  handleUserScrollToBottom: () => void
  isAtBottom: boolean
  followNewContent: boolean
}

const useScrollToBottom = (
  containerRef: RefObject<HTMLDivElement | null>,
  dependencies: any[] = [],
  options: UseScrollToBottomOptions = {}
): UseScrollToBottomReturn => {
  const {
    behavior = 'smooth',
    autoScrollOnInit = true,
    scrollDelay = 100,
    scrollThreshold = 10
  } = options

  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const followNewContent = useRef(true)
  const isFirstLoad = useRef(true)
  const timers = useRef({
    scroll: null as NodeJS.Timeout | null,
    init: null as NodeJS.Timeout | null,
    content: null as NodeJS.Timeout | null
  })

  // 清理所有定时器
  const clearAllTimers = useCallback(() => {
    Object.values(timers.current).forEach(timer => {
      if (timer) clearTimeout(timer)
    })
  }, [])

  // 检查是否滚动到底部
  const checkIfAtBottom = useCallback((): boolean => {
    const container = containerRef.current
    if (!container) return true

    const { scrollTop, scrollHeight, clientHeight } = container
    return scrollTop + clientHeight >= scrollHeight - scrollThreshold
  }, [containerRef, scrollThreshold])

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    const container = containerRef.current
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior
      })
    }
  }, [containerRef, behavior])

  // 更新滚动状态
  const updateScrollState = useCallback(() => {
    const atBottom = checkIfAtBottom()
    setIsAtBottom(atBottom)
    setShowScrollToBottom(!atBottom)
    return atBottom
  }, [checkIfAtBottom])

  // 处理用户主动滚动到底部
  const handleUserScrollToBottom = useCallback(() => {
    scrollToBottom()
    followNewContent.current = true
    setShowScrollToBottom(false)
    setIsAtBottom(true)
  }, [scrollToBottom])

  // 滚动事件监听器
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      // 防抖处理
      if (timers.current.scroll) {
        clearTimeout(timers.current.scroll)
      }

      timers.current.scroll = setTimeout(() => {
        const atBottom = updateScrollState()

        // 关键逻辑：用户手动滚动时，禁用自动跟随
        if (!atBottom) {
          followNewContent.current = false
        } else {
          followNewContent.current = true
        }
      }, 150)
    }

    container.addEventListener('scroll', handleScroll)
    // 初始化状态
    updateScrollState()

    return () => {
      container.removeEventListener('scroll', handleScroll)
      if (timers.current.scroll) {
        clearTimeout(timers.current.scroll)
      }
    }
  }, [containerRef, updateScrollState])

  // 首次加载自动滚动
  useEffect(() => {
    if (autoScrollOnInit && isFirstLoad.current) {
      timers.current.init = setTimeout(() => {
        scrollToBottom()
        setIsAtBottom(true)
        setShowScrollToBottom(false)
        followNewContent.current = true
        isFirstLoad.current = false
      }, scrollDelay)
    }

    return () => {
      if (timers.current.init) {
        clearTimeout(timers.current.init)
      }
    }
  }, [autoScrollOnInit, scrollToBottom, scrollDelay])

  // 内容变化时的处理
  useEffect(() => {
    if (isFirstLoad.current) return

    timers.current.content = setTimeout(() => {
      if (followNewContent.current) {
        // 用户没有手动滚动时，自动滚动
        scrollToBottom()
        setIsAtBottom(true)
        setShowScrollToBottom(false)
      } else {
        // 用户手动滚动后，只更新按钮状态
        updateScrollState()
      }
    }, 50)

    return () => {
      if (timers.current.content) {
        clearTimeout(timers.current.content)
      }
    }
  }, [...dependencies, scrollToBottom, updateScrollState])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      clearAllTimers()
    }
  }, [clearAllTimers])

  return {
    showScrollToBottom,
    scrollToBottom: handleUserScrollToBottom,
    handleUserScrollToBottom,
    isAtBottom,
    followNewContent: followNewContent.current
  }
}

export default useScrollToBottom
