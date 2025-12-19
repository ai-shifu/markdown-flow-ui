import "highlight.js/styles/github.css";
import "katex/dist/katex.min.css";
import React, { useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
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
  beforeSend?: (param: OnSendContentParams) => boolean;
  // tooltipMinLength?: number; // Control minimum character length for tooltip display, default 10
}

// Extended component interface
type CustomComponents = ComponentsWithCustomVariable & {
  "custom-button-after-content"?: React.ComponentType<{
    children: React.ReactNode;
  }>;
};

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
  onClickCustomButtonAfterContent,
  beforeSend,
  // tooltipMinLength,
}) => {
  // Use custom Hook to handle typewriter effect
  const { displayContent, isComplete } = useTypewriterStateMachine({
    // processMarkdownText will let code block printf("You win!\n") become printf("You win!<br/>");
    // content: processMarkdownText(content),
    content: content,
    typingSpeed,
    disabled: !enableTypewriter,
  });

  function SvgInShadow({
    children,
    ...props
  }: React.ComponentPropsWithoutRef<"svg"> & { node?: any }) {
    const hostRef = useRef<HTMLDivElement>(null);
    const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);

    useEffect(() => {
      if (hostRef.current && !shadowRoot) {
        if (!hostRef.current.shadowRoot) {
          const root = hostRef.current.attachShadow({ mode: "open" });
          setShadowRoot(root);
        } else {
          setShadowRoot(hostRef.current.shadowRoot);
        }
      }
    }, [shadowRoot]);

    useEffect(() => {
      if (shadowRoot) {
        const html = renderToStaticMarkup(
          <svg {...props} style={{ ...props.style, display: "block" }}>
            {children}
          </svg>
        );
        shadowRoot.innerHTML = html;
      }
    }, [shadowRoot, children, props]);

    return <div ref={hostRef} style={{ display: "inline-block" }} />;
  }

  // Render svg string via Shadow DOM to avoid markdown wrapping
  const SvgBlockInShadow: React.FC<{ svg: string }> = ({ svg }) => {
    const hostRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const host = hostRef.current;
      if (!host) return;
      const shadowRoot = host.shadowRoot ?? host.attachShadow({ mode: "open" });
      shadowRoot.innerHTML = svg;
    }, [svg]);

    return <div className="content-render-svg" ref={hostRef} />;
  };

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
          {children}
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
    svg: (props) => <SvgInShadow {...props} />,
  };

  const hasCompleted = useRef(false);

  useEffect(() => {
    if (isComplete && !hasCompleted.current) {
      hasCompleted.current = true; // Mark as completed
      onTypeFinished?.(); // Call the passed callback
    }
  }, [isComplete, onTypeFinished]);
  useEffect(() => {
    hasCompleted.current = false; // Reset completion status when content changes
  }, [content]);

  const segments = parseMarkdownSegments(displayContent);

  return (
    <div className={`content-render markdown-body`}>
      {segments.map((seg, index) => {
        if (seg.type === "text") {
          return (
            <ReactMarkdown
              key={index}
              remarkPlugins={[remarkGfm, remarkMath, remarkFlow, remarkBreaks]}
              rehypePlugins={[
                preserveCustomVariableProperties,
                rehypeRaw,
                restoreCustomVariableProperties,
                [
                  rehypeHighlight,
                  { languages: highlightLanguages, subset: subsetLanguages },
                ],
                rehypeKatex,
              ]}
              components={components}
            >
              {seg.value}
            </ReactMarkdown>
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

      {customRenderBar &&
        React.createElement(customRenderBar, {
          content,
          displayContent,
          onSend,
        })}
    </div>
  );
};

export default ContentRender;
