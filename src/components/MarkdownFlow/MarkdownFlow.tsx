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
<<<<<<< HEAD
    dynamicInteractionFormat?: string;
=======
>>>>>>> e7d1b13 (feat: support custom button after content (#39))
  }[];
  customRenderBar?: CustomRenderBarProps;
  onSend?: (content: OnSendContentParams) => void;
  typingSpeed?: number;
  enableTypewriter?: boolean;
  onBlockComplete?: (blockIndex: number) => void;
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
