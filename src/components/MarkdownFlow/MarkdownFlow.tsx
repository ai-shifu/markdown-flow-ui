import React from "react";
import ContentRender from "../ContentRender";
import { CustomRenderBarProps, OnSendContentParams } from "../types";
import "./markdownFlow.css";

export interface MarkdownFlowProps {
  initialContentList?: {
    content: string;
    isFinished?: boolean;
    defaultInputText?: string;
    defaultButtonText?: string;
    defaultSelectedValues?: string[];
    readonly?: boolean;
    customRenderBar?: CustomRenderBarProps;
    onClickCustomButtonAfterContent?: () => void;
    dynamicInteractionFormat?: string;
  }[];
  customRenderBar?: CustomRenderBarProps;
  onSend?: (content: OnSendContentParams) => void;
  typingSpeed?: number;
  enableTypewriter?: boolean;
  onBlockComplete?: (blockIndex: number) => void;
  // Multi-select confirm button text (i18n support)
  confirmButtonText?: string;
  // Copy button text for code blocks
  copyButtonText?: string;
  // Copied state text for code blocks
  copiedButtonText?: string;
  beforeSend?: (content: OnSendContentParams) => boolean;
}

const MarkdownFlow: React.FC<MarkdownFlowProps> = ({
  initialContentList = [],
  customRenderBar,
  onSend: onSendProp,
  typingSpeed: typingSpeedProp,
  enableTypewriter = false,
  onBlockComplete,
  confirmButtonText,
  copyButtonText,
  copiedButtonText,
  beforeSend: beforeSendProp,
}) => {
  return (
    <div className="markdown-flow">
      {initialContentList.map((contentInfo, index) => {
        const isFinished = contentInfo.isFinished ?? false;
        const enableTypewriterForBlock = !isFinished && enableTypewriter;
        const onSend = isFinished ? undefined : onSendProp;
        const typingSpeed = isFinished ? undefined : typingSpeedProp;
        const beforeSend = beforeSendProp ?? (() => true);
        return (
          <ContentRender
            key={index}
            content={contentInfo.content}
            defaultInputText={contentInfo.defaultInputText}
            defaultButtonText={contentInfo.defaultButtonText}
            defaultSelectedValues={contentInfo.defaultSelectedValues}
            readonly={contentInfo.readonly}
            enableTypewriter={enableTypewriterForBlock}
            customRenderBar={contentInfo.customRenderBar || customRenderBar}
            onSend={onSend}
            beforeSend={beforeSend}
            onClickCustomButtonAfterContent={
              contentInfo.onClickCustomButtonAfterContent
            }
            typingSpeed={typingSpeed}
            confirmButtonText={confirmButtonText}
            copyButtonText={copyButtonText}
            copiedButtonText={copiedButtonText}
            dynamicInteractionFormat={contentInfo.dynamicInteractionFormat}
            onTypeFinished={() => {
              onBlockComplete?.(index);
            }}
          />
        );
      })}
    </div>
  );
};

export default MarkdownFlow;
