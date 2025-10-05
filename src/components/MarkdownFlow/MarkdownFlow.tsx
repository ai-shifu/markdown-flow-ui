import React from "react";
import ContentRender from "../ContentRender";
import "./markdownFlow.css";
import { OnSendContentParams, CustomRenderBarProps } from "../types";

export interface MarkdownFlowProps {
  initialContentList?: {
    content: string;
    isFinished?: boolean;
    defaultInputText?: string;
    defaultButtonText?: string;
    defaultSelectedValues?: string[];
    readonly?: boolean;
    customRenderBar?: CustomRenderBarProps;
  }[];
  onClickAskButton?: () => void;
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
  onClickAskButton,
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
            onClickAskButton={onClickAskButton}
            typingSpeed={typingSpeed}
            confirmButtonText={confirmButtonText}
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
