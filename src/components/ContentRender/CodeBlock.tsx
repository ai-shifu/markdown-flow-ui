import React, { useState, ReactNode } from "react";
import "./CodeBlock.css";
import { Copy, Check, WrapText } from "lucide-react";
import {
  toggleCodeWrapPreference,
  useCodeWrapPreference,
} from "../../lib/codeWrapPreference";

// Nested code inherits the pre element's direction unless the author overrides it.
export const CodeBlockContext = React.createContext(false);

/**
 * Props for the CodeBlock component.
 */
export interface CodeBlockProps {
  /** The code content and nested elements to render.*/
  children?: React.ReactNode;
  /** Optional CSS class name for the pre element. */
  className?: string;
  /** Authored text direction; defaults to LTR for ordinary source code. */
  dir?: React.HTMLAttributes<HTMLPreElement>["dir"];
  /** Preserves the language supplied on authored preformatted content. */
  lang?: string;
  /** Text to display on the copy button (i18n support). */
  copyButtonText?: string;
  /** Text to display when code is copied (i18n support). */
  copiedButtonText?: string;
  /** Accessible name and tooltip of the line wrap toggle (i18n support). */
  wrapLinesLabel?: string;
}

const getCodeString = (children: ReactNode): string => {
  let text = "";
  React.Children.forEach(children, (child) => {
    if (typeof child === "string") {
      text += child;
    } else if (
      React.isValidElement(child) &&
      (child?.props as { children?: ReactNode })?.children
    ) {
      text += getCodeString((child.props as { children: ReactNode }).children);
    }
  });
  return text;
};

const CodeBlock: React.FC<CodeBlockProps> = ({
  children,
  className: preClassName,
  dir = "ltr",
  lang,
  copyButtonText = "Copy",
  copiedButtonText = "Copied",
  wrapLinesLabel = "Wrap lines",
}) => {
  const isWrapped = useCodeWrapPreference();
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    // Cleanup timeout on component unmount
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  let codeClassName = "";
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      const childProps = child.props as { className?: string };
      if (childProps.className) {
        codeClassName = childProps.className;
      }
    }
  });

  const match = /language-(\w+)/.exec(codeClassName || "");
  const language = match ? match[1] : "";

  const handleCopy = async () => {
    const codeString = getCodeString(children);
    try {
      await navigator.clipboard.writeText(codeString);
      setIsCopied(true);

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="code-block-container">
      <div className="code-block-header">
        <span className="language-name">{language}</span>
        <div className="code-block-actions">
          <button
            type="button"
            onClick={toggleCodeWrapPreference}
            className="wrap-button"
            aria-label={wrapLinesLabel}
            aria-pressed={isWrapped}
            title={wrapLinesLabel}
          >
            <WrapText className="copy-icon" aria-hidden="true" />
          </button>
          <button onClick={handleCopy} className="copy-button">
            {isCopied ? (
              <Check className="copy-icon" />
            ) : (
              <Copy className="copy-icon" />
            )}
            {isCopied ? copiedButtonText : copyButtonText}
          </button>
        </div>
      </div>
      <CodeBlockContext.Provider value={true}>
        <pre
          className={
            isWrapped
              ? [preClassName, "code-block-pre--wrap"].filter(Boolean).join(" ")
              : preClassName
          }
          dir={dir}
          lang={lang}
        >
          {children}
        </pre>
      </CodeBlockContext.Provider>
    </div>
  );
};

CodeBlock.displayName = "CodeBlock";
export default CodeBlock;
