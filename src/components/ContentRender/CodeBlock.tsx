import React, { useState, ReactNode } from "react";
import "./CodeBlock.css";
import { Copy, Check } from "lucide-react";

/**
 * Props for the CodeBlock component.
 */
export interface CodeBlockProps {
  /** The code content and nested elements to render.*/
  children: React.ReactNode;
  /** Optional CSS class name for the pre element. */
  className?: string;
  /** Text to display on the copy button (i18n support). */
  copyButtonText?: string;
  /** Text to display when code is copied (i18n support). */
  copiedButtonText?: string;
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
  copyButtonText = "Copy",
  copiedButtonText = "Copied",
}) => {
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
        <button onClick={handleCopy} className="copy-button">
          {isCopied ? (
            <Check className="copy-icon" />
          ) : (
            <Copy className="copy-icon" />
          )}
          {isCopied ? copiedButtonText : copyButtonText}
        </button>
      </div>
      <pre className={preClassName}>{children}</pre>
    </div>
  );
};

CodeBlock.displayName = "CodeBlock";
export default CodeBlock;
