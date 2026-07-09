import React, { useRef } from "react";
import MarkdownFlow from "./MarkdownFlow";
import useScrollToBottom from "./useScrollToBottom";
// import type { OnSendContentParams, CustomRenderBarProps } from "../types";
import { ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
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
  scrollToBottomAriaLabel,
  ...restProps
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const localeTexts = getContentRenderLocaleTexts(locale);
  const resolvedScrollToBottomAriaLabel =
    scrollToBottomAriaLabel || localeTexts.scrollToBottomLabel;

  const { showScrollToBottom, handleUserScrollToBottom } = useScrollToBottom(
    containerRef,
    [
      initialContentList?.length >= 1
        ? JSON.stringify(initialContentList[initialContentList?.length - 1])
        : null,
    ],
    {
      // Listen for content count changes
      behavior: "smooth",
      autoScrollOnInit: true,
      scrollDelay: 100,
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
          initialContentList={initialContentList}
          customRenderBar={customRenderBar}
          onSend={onSend}
          locale={locale}
          confirmButtonText={confirmButtonText}
          copyButtonText={copyButtonText}
          copiedButtonText={copiedButtonText}
        />
      </div>
      {showScrollToBottom && (
        <Button
          className="h-6 w-6 border hover:bg-gray-200 scroll-to-bottom-btn"
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleUserScrollToBottom}
          aria-label={resolvedScrollToBottomAriaLabel}
        >
          <ChevronDown />
        </Button>
      )}
    </div>
  );
};

export default ScrollableMarkdownFlow;
