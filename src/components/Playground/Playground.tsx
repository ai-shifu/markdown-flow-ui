import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import useSSE from '@/components/sse/useSSE'
import useMarkdownInfo from './useMarkdownInfo'
import MarkdownFlow from '../MarkdownFlow'
import { ContentRenderProps } from '@/components/ContentRender/ContentRender'

type PlaygroundComponentProps = {
  defaultContent: string // 原始markdown文本
  defaultVariables?: {
    // 默认变量组
    [key: string]: any
  }
  defaultDocumentPrompt?: string // 默认文档提示
  sseUrl?: string // 建立sse连接人url
}
const PlaygroundComponent: React.FC<PlaygroundComponentProps> = ({
  defaultContent,
  defaultVariables,
  defaultDocumentPrompt,
  sseUrl = 'https://play.dev.pillowai.cn/api/v1/playground/generate'
}) => {
  // 当前展示的消息
  const [content, setContent] = useState<string>('')
  const contentEndRef = useRef<HTMLDivElement>(null)
  const { data: markdownInfo, loading: isMarkdownLoading } =
    useMarkdownInfo(defaultContent)
  const { block_count, interaction_blocks } = markdownInfo || {}
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(0)
  const [contentList, setContentList] = useState<ContentRenderProps[]>([])

  const [sseParams, setSseParams] = useState<any>({
    content: defaultContent,
    block_index: 0,
    context: [
      {
        role: 'assistant',
        content: ''
      }
    ],
    variables: defaultVariables,
    user_input: null,
    document_prompt: defaultDocumentPrompt,
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
    [currentBlockIndex, block_count, interaction_blocks, sseParams]
  )

  // data是sse推送的message
  const { data, sseIndex, connect, close } = useSSE<any>(sseUrl, {
    method: 'POST',
    body: getSSEBody(),
    autoConnect: !!markdownInfo,
    onFinish: handleOnFinish
  })

  useEffect(() => {
    if (!!markdownInfo) {
      connect()
    }
  }, [isMarkdownLoading, markdownInfo, connect])

  // 追加新消息
  useEffect(() => {
    if (data) {
      try {
        const newContent = data
        setContent(newContent)
        
        const empList = contentList ? [...contentList] : []
        if (!empList[currentBlockIndex]) {
          empList[currentBlockIndex] = {
            content: newContent,
          }
        } else {
          empList[currentBlockIndex].content = newContent
        }
        setContentList(empList)
      } catch (error) {
        console.error('Error processing SSE message:', error)
      }
    }
  }, [data])

  // 自动滚动
  useEffect(() => {
    contentEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [defaultContent])

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

    const empList = contentList ? [...contentList] : []
    const last = empList[empList.length - 1]
    last.readonly = true
    last.defaultButtonText = params.buttonText
    last.defaultInputText = params.inputText
    setContentList(empList)
  }

  const customRenderBar = () => {
    return <></>
  }

  return (
    <div className='w-full'>
      <MarkdownFlow
        contentList={contentList}
        customRenderBar={customRenderBar}
        onSend={handleSend}
      />
      <div ref={contentEndRef} />
    </div>
  )
}

export default PlaygroundComponent
