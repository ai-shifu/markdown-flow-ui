import React from "react";
import ContentRender from "../ContentRender";
import { CustomRenderBarProps, OnSendContentParams } from "../types";
import "./markdownFlow.css";

export interface MarkdownFlowProps {
  initialContentList?: {
    content: string;
    isFinished?: boolean;
    defaultInputText?: string;
    defaultInputTextMaxLength?: number; // Max length for this specific content block
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
  defaultInputMaxLength?: number; // Default max length for all input fields
  // Multi-select confirm button text (i18n support)
  confirmButtonText?: string;
}

const MarkdownFlow: React.FC<MarkdownFlowProps> = ({
  initialContentList = [],
  customRenderBar,
  onSend: onSendProp,
  typingSpeed: typingSpeedProp,
  enableTypewriter = false,
  onBlockComplete,
  defaultInputMaxLength = 140, // Default max input length is 140 characters
  confirmButtonText,
}) => {
  return (
    <div className="markdown-flow">
      {initialContentList.map((contentInfo, index) => {
        const isFinished = contentInfo.isFinished ?? false;
        const enableTypewriterForBlock = !isFinished && enableTypewriter;
        const onSend = isFinished ? undefined : onSendProp;
        const typingSpeed = isFinished ? undefined : typingSpeedProp;
        return (
          <ContentRender
            key={index}
            content={contentInfo.content}
            defaultInputText={contentInfo.defaultInputText}
            defaultInputMaxLength={
              contentInfo.defaultInputTextMaxLength || defaultInputMaxLength
            }
            defaultButtonText={contentInfo.defaultButtonText}
            defaultSelectedValues={contentInfo.defaultSelectedValues}
            readonly={contentInfo.readonly}
            enableTypewriter={enableTypewriterForBlock}
            customRenderBar={contentInfo.customRenderBar || customRenderBar}
            onSend={onSend}
            onClickCustomButtonAfterContent={
              contentInfo.onClickCustomButtonAfterContent
            }
            typingSpeed={typingSpeed}
            confirmButtonText={confirmButtonText}
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
