import React, { useRef } from "react";
import MarkdownFlow from "./MarkdownFlow";
import useScrollToBottom from "./useScrollToBottom";
// import type { OnSendContentParams, CustomRenderBarProps } from "../types";
import ScrollToBottomButton from "./ScrollToBottomButton";
import type { MarkdownFlowProps } from "./MarkdownFlow";
import { getContentRenderLocaleTexts } from "../ContentRender/contentRenderI18n";

import "./markdownFlow.css";

export interface ScrollableMarkdownFlowProps extends MarkdownFlowProps {
  height?: string | number;
  className?: string;
  scrollToBottomAriaLabel?: string;
}

const ScrollableMarkdownFlow: React.FC<ScrollableMarkdownFlowProps> = ({
  initialContentList = [],
  customRenderBar,
  onSend,
  height = "100%",
  className = "",
  locale,
  confirmButtonText,
  copyButtonText,
  copiedButtonText,
  beforeSend,
  interactionDefaultValueOptions,
  scrollToBottomAriaLabel,
  ...restProps
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const localeTexts = getContentRenderLocaleTexts(locale);
  const resolvedScrollToBottomAriaLabel =
    scrollToBottomAriaLabel || localeTexts.scrollToBottomLabel;

  const { showScrollToBottom, scrollToBottom } = useScrollToBottom(
    containerRef,
    {
      contentVersion: initialContentList,
      autoScrollOnInit: true,
      scrollThreshold: 150,
    }
  );

  return (
    <div
      className={`scrollable-markdown-container ${className}`}
      style={{ height, position: "relative" }}
      {...restProps}
    >
      <div ref={containerRef} style={{ height: "100%", overflow: "auto" }}>
        <MarkdownFlow
          {...restProps}
          initialContentList={initialContentList}
          customRenderBar={customRenderBar}
          onSend={onSend}
          locale={locale}
          confirmButtonText={confirmButtonText}
          copyButtonText={copyButtonText}
          copiedButtonText={copiedButtonText}
          beforeSend={beforeSend}
          interactionDefaultValueOptions={interactionDefaultValueOptions}
        />
      </div>
      {showScrollToBottom && (
        <ScrollToBottomButton
          visible={showScrollToBottom}
          onClick={() => scrollToBottom()}
          ariaLabel={resolvedScrollToBottomAriaLabel}
        />
      )}
    </div>
  );
};

export default ScrollableMarkdownFlow;
