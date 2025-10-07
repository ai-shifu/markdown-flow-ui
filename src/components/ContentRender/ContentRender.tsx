import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkFlow from "remark-flow";
import CustomButtonInputVariable, {
  ComponentsWithCustomVariable,
} from "./plugins/CustomVariable";
import MermaidChart from "./plugins/MermaidChart";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/github.css";
import "./github-markdown-light.css";
import "katex/dist/katex.min.css";
import {
  highlightLanguages,
  subsetLanguages,
} from "./utils/highlight-languages";
import useTypewriterStateMachine from "./useTypewriterStateMachine";
import "./contentRender.css";
import { OnSendContentParams, CustomRenderBarProps } from "../types";
import remarkBreaks from "remark-breaks";
import { processMarkdownText } from "./utils/process-markdown";
import {
  preserveCustomVariableProperties,
  restoreCustomVariableProperties,
} from "./utils/custom-variable-props";

// Define component Props type
export interface ContentRenderProps {
  content: string;
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
  onClickCustomButtonAfterContent,
  // tooltipMinLength,
}) => {
  // Use custom Hook to handle typewriter effect
  const { displayContent, isComplete } = useTypewriterStateMachine({
    content: processMarkdownText(content),
    typingSpeed,
    disabled: !enableTypewriter,
  });

  const components: CustomComponents = {
    "custom-button-after-content": (props) => {
      const { children } = props as any;
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
        confirmButtonText={confirmButtonText}
        // tooltipMinLength={tooltipMinLength}
      />
    ),
    code: (props) => {
      const { className, children, ...rest } = props as any;
      const match = /language-(\w+)/.exec(className || "");
      const language = match?.[1];
      if (language === "mermaid") {
        const chartContent = children?.toString().replace(/\n$/, "") || "";
        return <MermaidChart chart={chartContent} />;
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

  return (
    <div className="content-render markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkFlow, remarkBreaks]}
        rehypePlugins={[
          preserveCustomVariableProperties, // before rehypeRaw, put button texts and values in properties
          rehypeRaw, // support html
          restoreCustomVariableProperties, // after rehypeRaw, restore button texts and values from properties
          [
            rehypeHighlight,
            {
              languages: highlightLanguages,
              subset: subsetLanguages,
            },
          ],
          rehypeKatex,
        ]}
        components={components}
      >
        {displayContent}
      </ReactMarkdown>
      {/* {isTyping && <span className='typing-cursor animate-pulse' style={{
        display: 'inline',
        fontSize: '0.25em',
        lineHeight: 'inherit',
        marginLeft: '1px',
        verticalAlign: 'baseline'
      }}>●</span>} */}
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
