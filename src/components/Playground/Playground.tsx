import React, { useState, useEffect, useRef } from "react";
import useSSE from "../sse/useSSE";
import useMarkdownInfo from "./useMarkdownInfo";
import ScrollableMarkdownFlow from "../MarkdownFlow/ScrollableMarkdownFlow";
import { ContentRenderProps } from "../ContentRender/ContentRender";
import { OnSendContentParams, CustomRenderBarProps } from "../types";
import { Loader } from "lucide-react";

type PlaygroundComponentProps = {
  defaultContent: string;
  defaultVariables?: {
    [key: string]: any;
  };
  defaultDocumentPrompt?: string;
  styles?: React.CSSProperties;
  sseUrl?: string;
  sessionId?: string;
  disableTyping?: boolean;
};

type SSEParams = {
  content: string;
  block_index: number;
  context: Array<{
    role: string;
    content: string;
  }>;
  variables?: {
    [key: string]: any;
  };
  user_input: string | null;
  document_prompt: string | null;
  interaction_prompt: string | null;
  interaction_error_prompt: string | null;
  model: string | null;
};

const PlaygroundComponent: React.FC<PlaygroundComponentProps> = ({
  defaultContent,
  defaultVariables = {},
  defaultDocumentPrompt = "",
  styles = {},
  sseUrl = "https://play.dev.pillowai.cn/api/v1/playground/generate",
  sessionId,
  disableTyping,
}) => {
  const { data: markdownInfo, loading: isMarkdownLoading } =
    useMarkdownInfo(defaultContent);
  const { block_count = 0, interaction_blocks = [] } = markdownInfo || {};
  const currentBlockIndexRef = useRef<number>(0);
  const currentMessageIndexRef = useRef<number>(0);
  const userOperateErrorFlag = useRef<boolean>(false);
  const [contentList, setContentList] = useState<ContentRenderProps[]>([]);
  const [loadingBlockIndex, setLoadingBlockIndex] = useState<number | null>(
    null
  );

  const [sseParams, setSseParams] = useState<SSEParams>({
    content: defaultContent,
    block_index: 0,
    context: [{ role: "assistant", content: "" }],
    variables: defaultVariables,
    user_input: null,
    document_prompt: defaultDocumentPrompt,
    interaction_prompt: null,
    interaction_error_prompt: null,
    model: null,
  });

  const getSSEBody = (): string => {
    return JSON.stringify(sseParams);
  };
  // Update context params for next block from SSE response
  const updateContextParamsForNextBlock = (
    currentData: string
  ): Array<{ role: string; content: string }> => {
    const newContext = [...sseParams.context];

    // Ensure array has sufficient length
    while (newContext.length <= currentBlockIndexRef.current) {
      newContext.push({ role: "assistant", content: "" });
    }

    // Update current block content
    newContext[currentBlockIndexRef.current] = {
      ...newContext[currentBlockIndexRef.current],
      content: currentData,
    };

    // Add placeholder for next block
    if (newContext.length <= currentBlockIndexRef.current + 1) {
      newContext.push({ role: "assistant", content: "" });
    }

    return newContext;
  };
  // Return updated contentList after SSE data update
  const updateContentListWithSseData = (
    newData: string
  ): ContentRenderProps[] => {
    const newList = [...contentList];
    const currentIndex = currentMessageIndexRef.current;
    while (newList.length <= currentIndex) {
      newList.push({ content: "" });
    }

    // Update current block content
    newList[currentIndex] = {
      ...newList[currentIndex],
      content: newData,
    };

    // Clear loading state
    if (loadingBlockIndex === currentIndex) {
      setLoadingBlockIndex(null);
    }

    return newList;
  };

  // Return contentList after user operation
  const updateContentListWithUserOperate = (
    params: OnSendContentParams
  ): ContentRenderProps[] => {
    const newList = [...contentList];
    const lastIndex = newList.length - 1;
    if (lastIndex >= 0) {
      newList[lastIndex] = {
        ...newList[lastIndex],
        readonly: true,
        defaultButtonText: params.buttonText,
        defaultInputText: params.inputText,
      };
    }
    return newList;
  };

  const updateContentListWithUserError = (data: string) => {
    const newList = [...contentList];
    const lastIndex = newList.length - 1;
    const item = {
      ...newList[lastIndex],
    };
    newList.push({
      content: data,
    });
    newList.push({
      ...item,
      readonly: false,
      defaultButtonText: "",
      defaultInputText: "",
    });

    return newList;
  };

  const handleOnFinish = (data: string) => {
    const isCurrentInteractionBlock = interaction_blocks.includes(
      currentBlockIndexRef.current
    );

    // Stop if current block is interaction block content with data
    if (data && isCurrentInteractionBlock && data.match(/\?\[/)) {
      return;
    }

    // Mark user operation error if current block is interaction block reply with data
    if (data && isCurrentInteractionBlock && !data.match(/\?\[/)) {
      userOperateErrorFlag.current = true;
      const updatedList = updateContentListWithUserError(data);
      setContentList(updatedList);
      setLoadingBlockIndex(null); // Clear loading state
      return;
    }

    // Set loading state if next block is interaction block
    const nextIndex = currentBlockIndexRef.current + 1;
    const isNextInteractionBlock = interaction_blocks.includes(nextIndex);
    if (isNextInteractionBlock && nextIndex < block_count) {
      setLoadingBlockIndex(nextIndex);
    }

    // Stop if reached the last block
    if (nextIndex >= block_count) {
      setLoadingBlockIndex(null); // Clear loading state
      return;
    }

    const newContext = updateContextParamsForNextBlock(data);

    setSseParams((prev) => ({
      ...prev,
      user_input: null,
      block_index: nextIndex,
      context: newContext,
      t: +new Date(),
    }));
    // Update current block index
    currentBlockIndexRef.current = nextIndex;
  };

  const handleOnStart = () => {
    currentMessageIndexRef.current = contentList.length;
    setLoadingBlockIndex(currentMessageIndexRef.current);
  };

  // Add loading state handling to contentList
  const getContentListWithLoading = (): ContentRenderProps[] => {
    const list = [...contentList];

    // If loadingBlockIndex exists, ensure content at that position and add loading identifier
    if (loadingBlockIndex !== null) {
      while (list.length <= loadingBlockIndex) {
        list.push({ content: "" });
      }
      // Add custom render bar for loading block
      list[loadingBlockIndex] = {
        ...list[loadingBlockIndex],
        customRenderBar: LoadingBar,
      };
    }

    return list;
  };

  const { data, connect } = useSSE<any>(sseUrl, {
    method: "POST",
    body: getSSEBody(),
    headers: sessionId ? { "session-id": sessionId } : {},
    autoConnect: !!markdownInfo && !isMarkdownLoading,
    onStart: handleOnStart,
    onFinish: handleOnFinish,
  });

  useEffect(() => {
    if (markdownInfo && !isMarkdownLoading) {
      connect();
    }
  }, [markdownInfo, isMarkdownLoading, connect]);

  useEffect(() => {
    if (data && !userOperateErrorFlag.current) {
      try {
        const updatedList = updateContentListWithSseData(data);
        setContentList(updatedList);
      } catch (error) {
        console.error("Error processing SSE message:", error);
      }
    }
  }, [data]);

  // Create Loading component
  const LoadingBar: CustomRenderBarProps = ({
    content: _content,
    displayContent: _displayContent,
    onSend: _onSend,
  }) => {
    return (
      <span className="flex gap-[10px] items-center">
        <Loader
          className="animate-spin"
          style={{ width: "15px", height: "15px" }}
        />
        Loading...
      </span>
    );
  };

  const handleSend = (params: OnSendContentParams) => {
    userOperateErrorFlag.current = false;
    const userInput = params.inputText || params.buttonText || "";
    // Update context
    const newContext = [...sseParams.context];
    if (newContext[currentBlockIndexRef.current]) {
      newContext[currentBlockIndexRef.current] = {
        ...newContext[currentBlockIndexRef.current],
        content: userInput,
        role: "user",
      };
    }

    // Update SSE parameters
    setSseParams((prev) => ({
      ...prev,
      context: newContext,
      user_input: userInput ?? null,
      variables: {
        ...prev.variables,
        [params.variableName || ""]: userInput,
      },
      t: +new Date(),
    }));

    // Update content list
    const updatedList = updateContentListWithUserOperate(params);
    setContentList(updatedList);
  };

  // Type adapter function
  const getAdaptedContentList = () => {
    return getContentListWithLoading().map((item) => ({
      content: item.content,
      customRenderBar: item.customRenderBar || (() => null),
      defaultButtonText: item.defaultButtonText,
      defaultInputText: item.defaultInputText,
      readonly: item.readonly,
    }));
  };

  return (
    <div style={styles}>
      <ScrollableMarkdownFlow
        initialContentList={getAdaptedContentList()}
        onSend={handleSend}
        disableTyping={disableTyping}
      />
    </div>
  );
};

export default PlaygroundComponent;
