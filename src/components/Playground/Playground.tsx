import React, { useState, useEffect } from 'react'
import useSSE from '@/components/sse/useSSE'
import useMarkdownInfo from './useMarkdownInfo'
import MarkdownFlow from '../MarkdownFlow'
import { ContentRenderProps } from '@/components/ContentRender/ContentRender'
import { OnSendContentParams } from '@/components/types'

type PlaygroundComponentProps = {
  defaultContent: string
  defaultVariables?: {
    [key: string]: any
  }
  defaultDocumentPrompt?: string
  sseUrl?: string
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
  sseUrl = 'https://play.dev.pillowai.cn/api/v1/playground/generate'
}) => {
  const { data: markdownInfo, loading: isMarkdownLoading } =
    useMarkdownInfo(defaultContent)
  const { block_count = 0, interaction_blocks = [] } = markdownInfo || {}

  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(0)
  const [contentList, setContentList] = useState<ContentRenderProps[]>([])

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
  // 判断是否应该继续到下一个块：用户操作和最后一个块停下来
  const shouldContinueToNextBlock = (data: string): boolean => {
    const nextIndex = currentBlockIndex + 1
    return !(
      (data && interaction_blocks.includes(currentBlockIndex)) ||
      nextIndex >= block_count
    )
  }
  // 返回sse params中的context字段
  const updateContextParamsForNextBlock = (
    currentData: string
  ): Array<{ role: string; content: string }> => {
    const newContext = [...sseParams.context]

    // 确保数组长度足够
    while (newContext.length <= currentBlockIndex) {
      newContext.push({ role: 'assistant', content: '' })
    }

    // 更新当前块内容
    newContext[currentBlockIndex] = {
      ...newContext[currentBlockIndex],
      content: currentData
    }

    // 添加下一个块的占位符
    if (newContext.length <= currentBlockIndex + 1) {
      newContext.push({ role: 'assistant', content: '' })
    }

    return newContext
  }
  // 返回sse data更新后的contentList
  const updateContentListWithSseData = (
    newData: string
  ): ContentRenderProps[] => {
    const newList = [...contentList]

    // 确保数组长度足够
    while (newList.length <= currentBlockIndex) {
      newList.push({ content: '' })
    }

    // 更新当前块内容
    newList[currentBlockIndex] = {
      ...newList[currentBlockIndex],
      content: newData
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

  const handleOnFinish = (data: string) => {
    if (!shouldContinueToNextBlock(data)) {
      return
    }

    const newContext = updateContextParamsForNextBlock(data)
    const nextIndex = currentBlockIndex + 1

    setSseParams(prev => ({
      ...prev,
      user_input: null,
      block_index: nextIndex,
      context: newContext
    }))

    setCurrentBlockIndex(nextIndex)
  }

  const { data, connect } = useSSE<any>(sseUrl, {
    method: 'POST',
    body: getSSEBody(),
    autoConnect: !!markdownInfo && !isMarkdownLoading,
    onFinish: handleOnFinish
  })

  useEffect(() => {
    if (markdownInfo && !isMarkdownLoading) {
      connect()
    }
  }, [markdownInfo, isMarkdownLoading, connect])

  useEffect(() => {
    if (data) {
      try {
        const updatedList = updateContentListWithSseData(data)
        setContentList(updatedList)
      } catch (error) {
        console.error('Error processing SSE message:', error)
      }
    }
  }, [data])

  const handleSend = (params: OnSendContentParams) => {
    const userInput = params.inputText || params.buttonText || ''

    // 更新上下文
    const newContext = [...sseParams.context]
    if (newContext[currentBlockIndex]) {
      newContext[currentBlockIndex] = {
        ...newContext[currentBlockIndex],
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
      }
    }))

    // 更新内容列表
    const updatedList = updateContentListWithUserOperate(params)
    setContentList(updatedList)
  }

  return (
    <div className='w-full'>
      <MarkdownFlow initialContentList={contentList} onSend={handleSend} />
    </div>
  )
}

export default PlaygroundComponent
