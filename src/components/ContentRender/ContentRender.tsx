import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import remarkBreaks from 'remark-breaks';
import remarkFlow from 'remark-flow';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { OnSendContentParams, CustomRenderBarProps } from '../types';

import CustomButtonInputVariable, { ComponentsWithCustomVariable } from './plugins/CustomVariable';
import MermaidChart from './plugins/MermaidChart';
import useTypewriterStateMachine from './useTypewriterStateMachine';
import { highlightLanguages, subsetLanguages } from './utils/highlight-languages';
import { processMarkdownText } from './utils/process-markdown';

import 'highlight.js/styles/github.css';
import 'katex/dist/katex.min.css';
import './github-markdown-light.css';

import './contentRender.css';

// Define component Props type
export interface ContentRenderProps {
  content: string;
  customRenderBar?: CustomRenderBarProps;
  onSend?: (content: OnSendContentParams) => void;
  typingSpeed?: number;
  disableTyping?: boolean;
  defaultButtonText?: string;
  defaultInputText?: string; // Text input by user
  readonly?: boolean;
  onTypeFinished?: () => void;
  tooltipMinLength?: number; // Control minimum character length for tooltip display, default 10
}

// Extended component interface
type CustomComponents = ComponentsWithCustomVariable;

const ContentRender: React.FC<ContentRenderProps> = ({
  content,
  customRenderBar,
  onSend,
  typingSpeed = 30,
  disableTyping = true,
  defaultButtonText,
  defaultInputText,
  readonly = false,
  onTypeFinished,
  tooltipMinLength,
}) => {
  // Use custom Hook to handle typewriter effect
  const { displayContent, isComplete } = useTypewriterStateMachine({
    content: processMarkdownText(content),
    typingSpeed,
    disabled: disableTyping,
  });

  const components: CustomComponents = {
    'custom-variable': props => (
      <CustomButtonInputVariable
        {...props}
        readonly={readonly}
        defaultButtonText={defaultButtonText}
        defaultInputText={defaultInputText}
        onSend={onSend}
        tooltipMinLength={tooltipMinLength}
      />
    ),
    code: props => {
      const { inline, className, children, ...rest } = props;
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';

      // Handle Mermaid diagrams
      if (!inline && language === 'mermaid') {
        return <MermaidChart chart={String(children).replace(/\n$/, '')} />;
      }

      return !inline && match ? (
        <code className={className} {...rest}>
          {children}
        </code>
      ) : (
        <code className={className} {...rest}>
          {children}
        </code>
      );
    },
    table: ({ ...props }) => (
      <div className='content-render-table-container'>
        <table className='content-render-table' {...props} />
      </div>
    ),
    th: ({ ...props }) => <th className='content-render-th' {...props} />,
    td: ({ ...props }) => <td className='content-render-td' {...props} />,
    tr: ({ ...props }) => <tr className='content-render-tr' {...props} />,
    li: ({ node, ...props }) => {
      const className = node?.properties?.className;
      const hasTaskListItem =
        (typeof className === 'string' && className.includes('task-list-item')) ||
        (Array.isArray(className) && className.includes('task-list-item'));
      if (hasTaskListItem) {
        return <li className='content-render-task-list-item' {...props} />;
      }
      return <li {...props} />;
    },
    ol: ({ ...props }) => <ol className='content-render-ol' {...props} />,
    ul: ({ ...props }) => <ul className='content-render-ul' {...props} />,
    input: ({ ...props }) => {
      if (props.type === 'checkbox') {
        return <input type='checkbox' className='content-render-checkbox' disabled {...props} />;
      }
      return <input {...props} />;
    },
  };

  const hasCompleted = useRef(false);

  useEffect(() => {
    if (isComplete && !hasCompleted.current) {
      console.log('[ContentRender] Typing is complete, calling onTypeFinished');
      hasCompleted.current = true; // Mark as completed
      onTypeFinished?.(); // Call the passed callback
    }
  }, [isComplete, onTypeFinished]);
  useEffect(() => {
    hasCompleted.current = false; // Reset completion status when content changes
  }, [content]);

  return (
    <div className='content-render markdown-body'>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkFlow, remarkBreaks]}
        rehypePlugins={[
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
