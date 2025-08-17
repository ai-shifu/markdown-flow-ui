import React, { useState, useEffect, useRef } from 'react'
import useSSE from '../sse/useSSE'
import useMarkdownInfo from './useMarkdownInfo'
import ScrollableMarkdownFlow from '../MarkdownFlow/ScrollableMarkdownFlow'
import { ContentRenderProps } from '../ContentRender/ContentRender'
import { OnSendContentParams, CustomRenderBarProps } from '../types'
import { Loader } from 'lucide-react'

type PlaygroundComponentProps = {
  defaultContent: string
  defaultVariables?: {
    [key: string]: any
  }
  defaultDocumentPrompt?: string
  styles?: React.CSSProperties
  sseUrl?: string
  sessionId?: string
  disableTyping?: boolean
}

type SSEParams = {
  content: string
  block_index: number
  context: Array<{
    role: string
    content: string
  }>
  variables?: {
    [key: string]: any
  }
  user_input: string | null
  document_prompt: string | null
  interaction_prompt: string | null
  interaction_error_prompt: string | null
  model: string | null
}

const PlaygroundComponent: React.FC<PlaygroundComponentProps> = ({
  defaultContent,
  defaultVariables = {},
  defaultDocumentPrompt = '',
  styles = {},
  sseUrl = 'https://play.dev.pillowai.cn/api/v1/playground/generate',
  sessionId,
  disableTyping
}) => {
  const { data: markdownInfo, loading: isMarkdownLoading } =
    useMarkdownInfo(defaultContent)
  const { block_count = 0, interaction_blocks = [] } = markdownInfo || {}
  const currentBlockIndexRef = useRef<number>(0)
  const currentMessageIndexRef = useRef<number>(0)
  const userOperateErrorFlag = useRef<boolean>(false)
  const [contentList, setContentList] = useState<ContentRenderProps[]>([])
  const [loadingBlockIndex, setLoadingBlockIndex] = useState<number | null>(
    null
  )

  const [sseParams, setSseParams] = useState<SSEParams>({
    content: defaultContent,
    block_index: 0,
    context: [{ role: 'assistant', content: '' }],
    variables: defaultVariables,
    user_input: null,
    document_prompt: defaultDocumentPrompt,
    interaction_prompt: null,
    interaction_error_prompt: null,
    model: null
  })

  const getSSEBody = (): string => {
    return JSON.stringify(sseParams)
  }
  // 返回sse params中的context字段
  const updateContextParamsForNextBlock = (
    currentData: string
  ): Array<{ role: string; content: string }> => {
    const newContext = [...sseParams.context]

    // 确保数组长度足够
    while (newContext.length <= currentBlockIndexRef.current) {
      newContext.push({ role: 'assistant', content: '' })
    }

    // 更新当前块内容
    newContext[currentBlockIndexRef.current] = {
      ...newContext[currentBlockIndexRef.current],
      content: currentData
    }

    // 添加下一个块的占位符
    if (newContext.length <= currentBlockIndexRef.current + 1) {
      newContext.push({ role: 'assistant', content: '' })
    }

    return newContext
  }
  // 返回sse data更新后的contentList
  const updateContentListWithSseData = (
    newData: string
  ): ContentRenderProps[] => {
    const newList = [...contentList]
    const currentIndex = currentMessageIndexRef.current
    while (newList.length <= currentIndex) {
      newList.push({ content: '' })
    }

    // 更新当前块内容
    newList[currentIndex] = {
      ...newList[currentIndex],
      content: newData
    }

    // 清除 loading 状态
    if (loadingBlockIndex === currentIndex) {
      setLoadingBlockIndex(null)
    }

    return newList
  }

  // 返回用户操作后的contentList
  const updateContentListWithUserOperate = (
    params: OnSendContentParams
  ): ContentRenderProps[] => {
    const newList = [...contentList]
    const lastIndex = newList.length - 1
    if (lastIndex >= 0) {
      newList[lastIndex] = {
        ...newList[lastIndex],
        readonly: true,
        defaultButtonText: params.buttonText,
        defaultInputText: params.inputText
      }
    }
    return newList
  }

  const updateContentListWithUserError = (data: string) => {
    const newList = [...contentList]
    const lastIndex = newList.length - 1
    const item = {
      ...newList[lastIndex]
    }
    newList.push({
      content: data
    })
    newList.push({
      ...item,
      readonly: false,
      defaultButtonText: '',
      defaultInputText: ''
    })

    return newList
  }

  const handleOnFinish = (data: string) => {

    const isCurrentInteractionBlock = interaction_blocks.includes(
      currentBlockIndexRef.current
    )

    // 如果当前块是 interaction block内容，且有数据，则停止继续
    if (data && isCurrentInteractionBlock && data.match(/\?\[/)) {
      return
    }

    // 如果当前块是 interaction block回复，且有数据，则标记用户操作错误
    if (data && isCurrentInteractionBlock && !data.match(/\?\[/)) {
      userOperateErrorFlag.current = true
      const updatedList = updateContentListWithUserError(data)
      setContentList(updatedList)
      setLoadingBlockIndex(null) // 清除loading状态
      return
    }

    // 如果下一个块是 interaction block，预设 loading 状态
    const nextIndex = currentBlockIndexRef.current + 1
    const isNextInteractionBlock = interaction_blocks.includes(nextIndex)
    if (isNextInteractionBlock && nextIndex < block_count) {
      setLoadingBlockIndex(nextIndex)
    }

    // 如果已经到达最后一个块，则停止
    if (nextIndex >= block_count) {
      return
    }

    const newContext = updateContextParamsForNextBlock(data)

    setSseParams(prev => ({
      ...prev,
      user_input: null,
      block_index: nextIndex,
      context: newContext,
      t: +new Date()
    }))
    // 更新当前块索引
    currentBlockIndexRef.current = nextIndex
  }

  const handleOnStart = () => {
    currentMessageIndexRef.current = contentList.length
    setLoadingBlockIndex(currentMessageIndexRef.current)
  }

  // 为 contentList 添加 loading 状态处理
  const getContentListWithLoading = (): ContentRenderProps[] => {
    const list = [...contentList]

    // 如果有 loadingBlockIndex，确保该位置有内容并添加 loading 标识
    if (loadingBlockIndex !== null) {
      while (list.length <= loadingBlockIndex) {
        list.push({ content: '' })
      }
      // 为 loading 的块添加自定义渲染栏
      list[loadingBlockIndex] = {
        ...list[loadingBlockIndex],
        customRenderBar: LoadingBar
      }
    }

    return list
  }

  const { data, connect } = useSSE<any>(sseUrl, {
    method: 'POST',
    body: getSSEBody(),
    headers: sessionId ? { 'session-id': sessionId } : {},
    autoConnect: !!markdownInfo && !isMarkdownLoading,
    onStart: handleOnStart,
    onFinish: handleOnFinish
  })

  useEffect(() => {
    if (markdownInfo && !isMarkdownLoading) {
      connect()
    }
  }, [markdownInfo, isMarkdownLoading, connect])

  useEffect(() => {
    if (data && !userOperateErrorFlag.current) {
      try {
        const updatedList = updateContentListWithSseData(data)
        setContentList(updatedList)
      } catch (error) {
        console.error('Error processing SSE message:', error)
      }
    }
  }, [data])

  // 创建 Loading 组件
  const LoadingBar: CustomRenderBarProps = ({
    content,
    displayContent,
    onSend
  }) => {
    return (
      <span className='flex gap-[10px] items-center'>
        <Loader
          className='animate-spin'
          style={{ width: '15px', height: '15px' }}
        />
        请稍等...
      </span>
    )
  }

  const handleSend = (params: OnSendContentParams) => {
    userOperateErrorFlag.current = false
    const userInput = params.inputText || params.buttonText || ''
    // 更新上下文
    const newContext = [...sseParams.context]
    if (newContext[currentBlockIndexRef.current]) {
      newContext[currentBlockIndexRef.current] = {
        ...newContext[currentBlockIndexRef.current],
        content: userInput,
        role: 'user'
      }
    }

    // 更新 SSE 参数
    setSseParams(prev => ({
      ...prev,
      context: newContext,
      user_input: userInput ?? null,
      variables: {
        ...prev.variables,
        [params.variableName || '']: userInput
      },
      t: +new Date()
    }))

    // 更新内容列表
    const updatedList = updateContentListWithUserOperate(params)
    setContentList(updatedList)
  }

  // 类型适配函数
  const getAdaptedContentList = () => {
    return getContentListWithLoading().map(item => ({
      content: item.content,
      customRenderBar: item.customRenderBar || (() => null),
      defaultButtonText: item.defaultButtonText,
      defaultInputText: item.defaultInputText,
      readonly: item.readonly
    }))
  }

  return (
    <div style={styles}>
      <ScrollableMarkdownFlow
        initialContentList={getAdaptedContentList()}
        onSend={handleSend}
        disableTyping={disableTyping}
      />
    </div>
  )
}

export default PlaygroundComponent
