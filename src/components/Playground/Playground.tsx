import React, { useState, useRef, useEffect, useCallback } from 'react'
import ContentRender from '@/components/ContentRender'
import useSSE from '@/components/sse/useSSE'
import useMarkdownInfo from './useMarkdownInfo'
import MarkdownFlow from '../MarkdownFlow'
import { ContentRenderProps } from '@/components/ContentRender/ContentRender'

type ChatSSEComponentProps = {
  originContent: string
}
const ChatSSEComponent: React.FC<ChatSSEComponentProps> = ({
  originContent
}) => {
  const [content, setContent] = useState<string>('')
  const contentEndRef = useRef<HTMLDivElement>(null)
  const { data: markdownInfo, loading: isMarkdownLoading } =
    useMarkdownInfo(originContent)

  const { block_count, interaction_blocks } = markdownInfo || {}

  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(0)
  const [contentList, setContentList] = useState<ContentRenderProps[]>([])

  const [sseParams, setSseParams] = useState<any>({
    content: originContent,
    block_index: 0,
    context: [
      {
        role: 'assistant',
        content: ''
      }
    ],
    variables: null,
    user_input: null,
    document_prompt: null,
    interaction_prompt: null,
    interaction_error_prompt: null,
    model: null
  })
  const getSSEBody = () => {
    return JSON.stringify(sseParams)
  }

  const handleOnFinish = useCallback(
    (data: string, sseIndex: number) => {
      setContent('')
      const newIndex = currentBlockIndex + 1
      if (
        (data && interaction_blocks?.includes(currentBlockIndex)) ||
        newIndex >= (block_count ?? 0)
      ) {
        return
      }
      const newContext = sseParams.context ? [...sseParams.context] : []
      if (!newContext[currentBlockIndex]) {
        newContext[currentBlockIndex] = {
          role: 'assistant',
          content: ''
        }
      } else {
        // newContext[currentBlockIndex].content = data
      }
      newContext.push({
        role: 'assistant',
        content: ''
      })
      setSseParams({
        ...sseParams,
        block_index: newIndex,
        context: newContext
      })
      setCurrentBlockIndex(newIndex)
    },
    [currentBlockIndex, block_count, interaction_blocks]
  )

  const { data, sseIndex, connect, close } = useSSE<any>(
    'https://play.dev.pillowai.cn/api/v1/playground/generate',
    {
      method: 'POST',
      body: getSSEBody(),
      autoConnect: !!markdownInfo,
      onFinish: handleOnFinish
    }
  )

  useEffect(() => {
    if (!!markdownInfo) {
      connect()
    }
  }, [isMarkdownLoading, markdownInfo, connect])

  // 追加新消息
  useEffect(() => {
    if (data) {
      try {
        let newContent = ''
        if (typeof data === 'string') {
          newContent = data
        }
        const totalContent = content + newContent
        setContent(totalContent)
        const empList = contentList ? [...contentList] : []
        if (!empList[currentBlockIndex]) {
          empList[currentBlockIndex] = {
            content: totalContent,
            disableTyping: true,
            onSend: handleSend
          }
        } else {
          empList[currentBlockIndex].content = totalContent
        }
        console.log('empList', empList)
        setContentList(empList)
      } catch (error) {
        console.error('Error processing SSE message:', error)
      }
    }
  }, [data])

  // 自动滚动
  useEffect(() => {
    contentEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [content])

  // 处理自定义组件的回调
  const handleSend = (params: any) => {
    const newVariables = {
      ...sseParams.variables,
      [params.variableName]: params.inputText || params.buttonText
    }
    const newContext = [...sseParams.context]
    newContext.push({
      role: 'user',
      content: params.inputText || params.buttonText
    })
    setSseParams({
      ...sseParams,
      context: newContext,
      user_input: params.inputText || params.buttonText,
      variables: newVariables
    })
    const newContentList = [...contentList]
    contentList[currentBlockIndex].defaultInputText = params.inputText
    contentList[currentBlockIndex].defaultButtonText = params.buttonText
    setContentList(newContentList)
  }

  return (
    <div className='w-full'>
      <MarkdownFlow contentList={contentList} />
      <div ref={contentEndRef} />
    </div>
  )
}

export default ChatSSEComponent
