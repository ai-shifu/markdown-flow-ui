import React, { useRef } from "react";
import MarkdownFlow, { type MarkdownFlowProps } from "./MarkdownFlow";
import ScrollToBottomControl from "./ScrollToBottomControl";
import { getContentRenderLocaleTexts } from "../ContentRender/contentRenderI18n";

import "./markdownFlow.css";

export interface ScrollableMarkdownFlowProps extends MarkdownFlowProps {
  height?: string | number;
  className?: string;
  scrollToBottomAriaLabel?: string;
}

const ScrollableMarkdownFlow: React.FC<ScrollableMarkdownFlowProps> = (
  props
) => {
  const {
    height = "100%",
    className = "",
    scrollToBottomAriaLabel,
    ...markdownFlowProps
  } = props;
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const initialContentList = markdownFlowProps.initialContentList ?? [];
  const localeTexts = getContentRenderLocaleTexts(markdownFlowProps.locale);
  const resolvedScrollToBottomAriaLabel =
    scrollToBottomAriaLabel || localeTexts.scrollToBottomLabel;

  return (
    <div
      className={`scrollable-markdown-container ${className}`.trim()}
      style={{ height, position: "relative" }}
    >
      <div ref={viewportRef} style={{ height: "100%", overflowY: "auto" }}>
        <div ref={contentRef}>
          <MarkdownFlow
            {...markdownFlowProps}
            initialContentList={initialContentList}
          />
          <div ref={endRef} aria-hidden="true" />
        </div>
      </div>
      <ScrollToBottomControl
        viewportRef={viewportRef}
        contentRef={contentRef}
        endRef={endRef}
        contentVersion={initialContentList}
        autoScrollOnInit
        scrollThreshold={150}
        ariaLabel={resolvedScrollToBottomAriaLabel}
      />
    </div>
  );
};

export default ScrollableMarkdownFlow;
