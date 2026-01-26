import "highlight.js/styles/github.css";
import "katex/dist/katex.min.css";
import React, { useEffect, useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import remarkFlow from "remark-flow";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { CustomRenderBarProps, OnSendContentParams } from "../types";
import "./contentRender.css";
import "./github-markdown-light.css";
import CodeBlock from "./CodeBlock";
import CustomButtonInputVariable, {
  ComponentsWithCustomVariable,
} from "./plugins/CustomVariable";
import MermaidChart from "./plugins/MermaidChart";
import useTypewriterStateMachine from "./useTypewriterStateMachine";
import {
  preserveCustomVariableProperties,
  restoreCustomVariableProperties,
} from "./utils/custom-variable-props";
import {
  highlightLanguages,
  subsetLanguages,
} from "./utils/highlight-languages";
// import { processMarkdownText } from "./utils/process-markdown";
import {
  parseMarkdownSegments,
  mermaidBlockIsComplete,
} from "./utils/mermaid-parse";
import { normalizeInlineHtml } from "./utils/normalize-inline-html";
import IframeSandbox from "./IframeSandbox";
import { splitContentSegments } from "./utils/split-content";
// Define component Props type
export interface ContentRenderProps {
  content: string;
  /**
+   * Callback invoked when the custom button after content is clicked.
+   * This button is rendered via the `<custom-button-after-content>` tag in markdown content.
+   * @example
+   * ```tsx
+   * <ContentRender
+   *   content="Hello <custom-button-after-content>Ask</custom-button-after-content>"
+   *   onClickCustomButtonAfterContent={() => console.log('Button clicked')}
+   * />
+   * ```
+   */
  customRenderBar?: CustomRenderBarProps;
  onClickCustomButtonAfterContent?: () => void;
  onSend?: (content: OnSendContentParams) => void;
  typingSpeed?: number;
  enableTypewriter?: boolean;
  defaultButtonText?: string;
  defaultInputText?: string; // Text input by user
  defaultSelectedValues?: string[]; // Default selected values for multi-select
  readonly?: boolean;
  onTypeFinished?: () => void;
  // Multi-select confirm button text (i18n support)
  confirmButtonText?: string;
  // Copy button text (i18n support)
  copyButtonText?: string;
  // Copied state text (i18n support)
  copiedButtonText?: string;
  // Dynamic interaction format for multi-select support
  dynamicInteractionFormat?: string;
  // Loading text before first HTML block renders inside iframe (i18n support)
  sandboxLoadingText?: string;
  // Loading text while styles are being generated inside iframe
  sandboxStyleLoadingText?: string;
  // Loading text while scripts are being cached/executed inside iframe
  sandboxScriptLoadingText?: string;
  // Fullscreen button text for iframe sandbox
  sandboxFullscreenButtonText?: string;
  // Sandbox render mode
  sandboxMode?: "content" | "blackboard";
  beforeSend?: (param: OnSendContentParams) => boolean;
  // tooltipMinLength?: number; // Control minimum character length for tooltip display, default 10
}

// Render svg string via Shadow DOM to avoid markdown wrapping
const SvgBlockInShadow: React.FC<{ svg: string }> = ({ svg }) => {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const shadowRoot = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    const styleId = "content-render-svg-style";
    let styleEl = shadowRoot.getElementById(styleId) as HTMLStyleElement | null;

    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      // Keep intrinsic SVG width so the wrapper can scroll horizontally when needed
      styleEl.textContent = `
        svg { height: auto; display: inline-block; }
        svg.content-render-svg-el--responsive { width: 100%; max-width: 100%; }
        svg.content-render-svg-el--fixed { max-width: none; }
      `;
      shadowRoot.appendChild(styleEl);
    }

    const nodesToRemove = Array.from(shadowRoot.childNodes).filter(
      (node) => node !== styleEl
    );
    nodesToRemove.forEach((node) => shadowRoot.removeChild(node));

    const template = document.createElement("template");
    template.innerHTML = svg;
    shadowRoot.append(template.content.cloneNode(true));

    let hasResponsiveSvg = false;
    let hasFixedSvg = false;

    shadowRoot.querySelectorAll("svg").forEach((svgEl) => {
      // Derive responsive sizing from viewBox so pure viewBox SVGs stay visible and fluid
      const viewBox = svgEl.getAttribute("viewBox");
      if (!viewBox) return;

      const dimensions = viewBox
        .trim()
        .split(/[\s,]+/)
        .map((value) => Number(value));

      if (dimensions.length !== 4 || dimensions.some(Number.isNaN)) return;

      const [, , viewBoxWidth, viewBoxHeight] = dimensions;
      const widthAttr = svgEl.getAttribute("width");
      const heightAttr = svgEl.getAttribute("height");
      const hasWidth = !!widthAttr && widthAttr !== "0";
      const hasHeight = !!heightAttr && heightAttr !== "0";
      const shouldUseResponsiveSize = !hasWidth && !hasHeight;

      if (shouldUseResponsiveSize) {
        hasResponsiveSvg = true;
        svgEl.classList.add("content-render-svg-el--responsive");
        svgEl.classList.remove("content-render-svg-el--fixed");
        svgEl.style.width = "100%";
        svgEl.style.height = "auto";
        if (!svgEl.style.aspectRatio && viewBoxHeight > 0) {
          svgEl.style.aspectRatio = `${viewBoxWidth} / ${viewBoxHeight}`;
        }
        return;
      }

      hasFixedSvg = true;
      svgEl.classList.add("content-render-svg-el--fixed");
      svgEl.classList.remove("content-render-svg-el--responsive");
      if (!hasWidth && viewBoxWidth > 0) {
        svgEl.setAttribute("width", `${viewBoxWidth}`);
      }
      if (!hasHeight && viewBoxHeight > 0) {
        svgEl.setAttribute("height", `${viewBoxHeight}`);
      }
    });

    const hostResponsive = hasResponsiveSvg && !hasFixedSvg;
    host.classList.toggle("content-render-svg--responsive", hostResponsive);
    host.classList.toggle("content-render-svg--fixed", !hostResponsive);
  }, [svg]);

  return (
    <div className="content-render-svg-scroll">
      <div className="content-render-svg" ref={hostRef} />
    </div>
  );
};

// Extended component interface
type CustomComponents = ComponentsWithCustomVariable & {
  "custom-button-after-content"?: React.ComponentType<{
    children: React.ReactNode;
  }>;
};

const remarkPlugins = [remarkGfm, remarkMath, remarkFlow, remarkBreaks];

const rehypePlugins = [
  preserveCustomVariableProperties,
  rehypeRaw,
  restoreCustomVariableProperties,
  [rehypeHighlight, { languages: highlightLanguages, subset: subsetLanguages }],
  rehypeKatex,
];

export const MarkdownRenderer: React.FC<{
  content: string;
  components: CustomComponents;
}> = ({ content: markdownContent, components }) => (
  <div className="markdown-renderer">
    <ReactMarkdown
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
      components={components}
    >
      {markdownContent}
    </ReactMarkdown>
  </div>
);

const ContentRender: React.FC<ContentRenderProps> = ({
  content,
  customRenderBar,
  onSend,
  typingSpeed = 30,
  enableTypewriter = false,
  defaultButtonText,
  defaultInputText,
  defaultSelectedValues,
  readonly = false,
  onTypeFinished,
  confirmButtonText,
  copyButtonText,
  copiedButtonText,
  sandboxLoadingText,
  sandboxStyleLoadingText,
  sandboxScriptLoadingText,
  sandboxFullscreenButtonText,
  sandboxMode = "content",
  onClickCustomButtonAfterContent,
  beforeSend,
  // tooltipMinLength,
}) => {
  const normalizedContent = useMemo(
    () => normalizeInlineHtml(content),
    [content]
  );

  // Use custom Hook to handle typewriter effect
  const components: CustomComponents = {
    "custom-button-after-content": ({
      children,
    }: {
      children: React.ReactNode;
    }) => {
      return (
        <button
          className="content-render-custom-button-after-content"
          onClick={onClickCustomButtonAfterContent}
        >
          <span className="content-render-custom-button-after-content-inner">
            {children}
          </span>
        </button>
      );
    },
    "custom-variable": (props) => (
      <CustomButtonInputVariable
        {...props}
        readonly={readonly}
        defaultButtonText={defaultButtonText}
        defaultInputText={defaultInputText}
        defaultSelectedValues={defaultSelectedValues}
        onSend={onSend}
        beforeSend={beforeSend}
        confirmButtonText={confirmButtonText}
        // tooltipMinLength={tooltipMinLength}
      />
    ),
    code: (props) => {
      const { className, children, ...rest } = props as {
        className?: string;
        children?: React.ReactNode;
      };
      const match = /language-(\w+)/.exec(className || "");
      const language = match?.[1];
      if (language === "mermaid") {
        const chartContent = children?.toString().replace(/\n$/, "") || "";
        const frozen = mermaidBlockIsComplete(content, chartContent);
        return <MermaidChart chart={chartContent} frozen={frozen} />;
      }

      return (
        <code className={className} {...rest}>
          {children}
        </code>
      );
    },
    table: ({ ...props }) => (
      <div className="content-render-table-container">
        <table className="content-render-table" {...props} />
      </div>
    ),
    th: ({ ...props }) => <th className="content-render-th" {...props} />,
    td: ({ ...props }) => <td className="content-render-td" {...props} />,
    tr: ({ ...props }) => <tr className="content-render-tr" {...props} />,
    li: ({ node, ...props }) => {
      const className = node?.properties?.className;
      const hasTaskListItem =
        (typeof className === "string" &&
          className.includes("task-list-item")) ||
        (Array.isArray(className) && className.includes("task-list-item"));
      if (hasTaskListItem) {
        return <li className="content-render-task-list-item" {...props} />;
      }
      return <li {...props} />;
    },
    ol: ({ ...props }) => <ol className="content-render-ol" {...props} />,
    ul: ({ ...props }) => <ul className="content-render-ul" {...props} />,
    input: ({ ...props }) => {
      if (props.type === "checkbox") {
        return (
          <input
            type="checkbox"
            className="content-render-checkbox"
            disabled
            {...props}
          />
        );
      }
      return <input {...props} />;
    },
    a: ({ children, ...props }) => (
      <a target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    ),
    pre: (props) => (
      <CodeBlock
        {...props}
        copyButtonText={copyButtonText}
        copiedButtonText={copiedButtonText}
      />
    ),
  };

  const { displayContent, isComplete } = useTypewriterStateMachine({
    // processMarkdownText will let code block printf("You win!\n") become printf("You win!<br/>");
    // content: processMarkdownText(content),
    content: normalizedContent,
    typingSpeed,
    disabled: !enableTypewriter,
  });

  const renderSegments = useMemo(
    () => splitContentSegments(content),
    [content]
  );
  const hasSandbox = renderSegments.some(
    (segment) => segment.type === "sandbox"
  );

  const segments = useMemo(
    () => parseMarkdownSegments(displayContent),
    [displayContent]
  );

  const hasCompleted = useRef(false);

  useEffect(() => {
    if (hasSandbox) return;
    if (isComplete && !hasCompleted.current) {
      hasCompleted.current = true; // Mark as completed
      onTypeFinished?.(); // Call the passed callback
    }
  }, [hasSandbox, isComplete, onTypeFinished]);

  useEffect(() => {
    if (hasSandbox) return;
    hasCompleted.current = false; // Reset completion status when content changes
  }, [hasSandbox, content]);

  if (hasSandbox) {
    return (
      <div className="content-render markdown-body">
        {renderSegments.map((segment, idx) =>
          segment.type === "sandbox" ? (
            <IframeSandbox
              key={`sandbox-${idx}`}
              content={segment.value}
              className="content-render-iframe"
              loadingText={sandboxLoadingText}
              styleLoadingText={sandboxStyleLoadingText}
              scriptLoadingText={sandboxScriptLoadingText}
              fullScreenButtonText={sandboxFullscreenButtonText}
              mode={sandboxMode}
            />
          ) : (
            <MarkdownRenderer
              key={`md-${idx}`}
              components={components}
              content={normalizeInlineHtml(segment.value)}
            />
          )
        )}
      </div>
    );
  }

  return (
    <div className="content-render markdown-body">
      {segments.map((seg, index) => {
        if (seg.type === "text") {
          return (
            <MarkdownRenderer
              key={index}
              components={components}
              content={seg.value}
            />
          );
        }

        if (seg.type === "mermaid") {
          return (
            <MermaidChart
              key={index}
              chart={seg.value}
              frozen={!seg.complete}
            />
          );
        }

        if (seg.type === "svg") {
          return <SvgBlockInShadow key={index} svg={seg.value} />;
        }
      })}

      {customRenderBar && (
        <div className="content-render-custom-bar">
          {React.createElement(customRenderBar, {
            content,
            displayContent,
            onSend,
          })}
        </div>
      )}
    </div>
  );
};

export default ContentRender;
