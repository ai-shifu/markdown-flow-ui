import React, { useEffect, useRef } from "react";
import { createRoot, Root } from "react-dom/client";
import SandboxApp from "./SandboxApp";

export interface IframeSandboxProps {
  content: string;
  className?: string;
}

const IframeSandbox: React.FC<IframeSandboxProps> = ({
  content,
  className,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const rootRef = useRef<Root | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return undefined;

    const doc = iframe.contentDocument;
    if (!doc) return undefined;

    doc.open();
    doc.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`);
    doc.close();

    const rootEl = doc.getElementById("root");
    if (!rootEl) return undefined;

    if (rootRef.current) {
      rootRef.current.unmount();
    }

    const root = createRoot(rootEl);
    rootRef.current = root;
    root.render(<SandboxApp html={content} />);

    return () => {
      root.unmount();
      rootRef.current = null;
    };
  }, [content]);

  return (
    <iframe
      ref={iframeRef}
      sandbox="allow-scripts allow-same-origin"
      className={className}
      style={{
        width: "100%",
        minHeight: "600px",
      }}
      title="HTML Sandbox"
    />
  );
};

export default IframeSandbox;
