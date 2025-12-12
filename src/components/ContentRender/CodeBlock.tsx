import React, { useState, ReactNode } from "react";
import "./CodeBlock.css";
import { Copy, Check } from "lucide-react";

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
}

const getCodeString = (children: ReactNode): string => {
  let text = "";
  React.Children.forEach(children, (child) => {
    if (typeof child === "string") {
      text += child;
    } else if (React.isValidElement(child) && child.props.children) {
      text += getCodeString(child.props.children);
    }
  });
  return text;
};

const CodeBlock: React.FC<CodeBlockProps> = ({
  children,
  className: preClassName,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  let codeClassName = "";
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === "code") {
      codeClassName = child.props.className || "";
    }
  });

  const match = /language-(\w+)/.exec(codeClassName || "");
  const language = match ? match[1] : "";

  const handleCopy = async () => {
    const codeString = getCodeString(children);
    try {
      await navigator.clipboard.writeText(codeString);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
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
          {isCopied ? "已复制" : "复制源码"}
        </button>
      </div>
      <pre className={preClassName}>{children}</pre>
    </div>
  );
};

export default CodeBlock;
