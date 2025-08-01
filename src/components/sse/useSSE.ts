import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchEventSource } from '@microsoft/fetch-event-source'

interface UseSSEReturn<T = any> {
  data: T | null
  isLoading: boolean
  error: Error | null
  sseIndex: number | null
  connect: () => Promise<void>
  close: () => void
}

const FINISHED_MESSAGE = '[DONE]'

interface UseSSEOptions extends RequestInit {
  autoConnect?: boolean
  onFinish?: (finalData: any, index: number) => void
}

const useSSE = <T = any>(
  url: string,
  options: UseSSEOptions = {}
): UseSSEReturn<T> => {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const [sseIndex, setSseIndex] = useState<number | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)
  const hasConnectedRef = useRef(false)
  const mountedRef = useRef(true)
  const isManuallyClosedRef = useRef(false)
  const currentIndexRef = useRef(-1)
  const finalDataRef = useRef<string>('')

  const { autoConnect = true } = options

  const connect = useCallback(async () => {
    if (
      hasConnectedRef.current ||
      !mountedRef.current ||
      isManuallyClosedRef.current
    ) {
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      isManuallyClosedRef.current = false
      hasConnectedRef.current = true

      const newIndex = ++currentIndexRef.current
      setSseIndex(newIndex)
      finalDataRef.current = ''

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      await fetchEventSource(url, {
        ...options,
        method: 'POST',
        headers: {
          Accept: 'text/event-stream',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          ...Object.entries(options.headers || {}).reduce(
            (acc, [key, value]) => {
              acc[key] = String(value)
              return acc
            },
            {} as Record<string, string>
          )
        },
        signal: abortController.signal,
        openWhenHidden: true,
        onopen: async response => {
          if (mountedRef.current && !isManuallyClosedRef.current) {
            setIsLoading(false)
            setError(null)
          }
        },
        onmessage: event => {
          if (mountedRef.current && !isManuallyClosedRef.current) {
            if (event.data.toUpperCase() === FINISHED_MESSAGE) {
              options.onFinish?.(finalDataRef.current, newIndex)
              close()
              return
            }

            try {
              let parsedData: any = event.data
              // try {
              //   parsedData = JSON.parse(event.data)
              // } catch (e) {}
              // setData(parsedData)
              finalDataRef.current += parsedData
              setData(finalDataRef.current as any)
            } catch (err) {
              console.error('Error parsing SSE message:', err)
            }
          }
        },
        onclose: () => {
          if (mountedRef.current && !isManuallyClosedRef.current) {
            setIsLoading(false)
          }
        },
        onerror: err => {
          if (mountedRef.current && !isManuallyClosedRef.current) {
            setError(err)
            setIsLoading(false)
          }
          return
        }
      })
    } catch (err) {
      if (mountedRef.current && !isManuallyClosedRef.current) {
        setError(err as Error)
        setIsLoading(false)
      }
    }
  }, [url, JSON.stringify(options)])

  const close = useCallback(() => {
    isManuallyClosedRef.current = true
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    hasConnectedRef.current = false
    if (mountedRef.current) {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    isManuallyClosedRef.current = false
    hasConnectedRef.current = false

    if (autoConnect) {
      const timeoutId = setTimeout(() => {
        if (!hasConnectedRef.current) {
          connect()
        }
      }, 100)

      return () => {
        mountedRef.current = false
        isManuallyClosedRef.current = true
        clearTimeout(timeoutId)
        close()
      }
    } else {
      return () => {
        mountedRef.current = false
        isManuallyClosedRef.current = true
        close()
      }
    }
  }, [connect, close, autoConnect])

  // 监听 url 和 options 变化以重新连接
  useEffect(() => {
    // 如果不是首次加载，则关闭当前连接并重新连接
    if (hasConnectedRef.current) {
      close()
      hasConnectedRef.current = false
      isManuallyClosedRef.current = false
      setData(null)
      setError(null)
      setIsLoading(true)
      finalDataRef.current = ''

      const timeoutId = setTimeout(() => {
        if (!hasConnectedRef.current) {
          connect()
        }
      }, 100)

      return () => {
        clearTimeout(timeoutId)
      }
    }
  }, [url, JSON.stringify(options), connect, close])

  return {
    data,
    isLoading,
    error,
    sseIndex,
    connect,
    close
  }
}

export default useSSE
