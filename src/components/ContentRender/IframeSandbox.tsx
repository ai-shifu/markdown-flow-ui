import React, { useEffect, useRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import SandboxApp from "./SandboxApp";

export interface IframeSandboxProps {
  content: string;
  className?: string;
  loadingText?: string;
}

const IframeSandbox: React.FC<IframeSandboxProps> = ({
  content,
  className,
  loadingText,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const rootRef = useRef<Root | null>(null);
  const docRef = useRef<Document | null>(null);
  const updateHeightRef = useRef<() => void>(() => {});
  const [height, setHeight] = useState(480);

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
    <style>
      html, body { margin: 0; padding: 0; }
    </style>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`);
    doc.close();
    docRef.current = doc;

    const rootEl = doc.getElementById("root");
    if (!rootEl) return undefined;

    const root = createRoot(rootEl);
    rootRef.current = root;

    const updateHeight = () => {
      if (!iframeRef.current || !doc.body) return;
      const bodyRect = doc.body.getBoundingClientRect();
      const htmlRect = doc.documentElement?.getBoundingClientRect();
      const bodyHeight = bodyRect.height;
      const htmlHeight = htmlRect?.height || 0;
      const contentHeight = Math.max(bodyHeight, htmlHeight);
      const nextHeight = Math.max(200, Math.ceil(contentHeight));
      setHeight(nextHeight);
    };
    updateHeightRef.current = updateHeight;

    updateHeight();

    const resizeObserver = new ResizeObserver(() => updateHeight());
    resizeObserver.observe(doc.body);
    if (rootEl) {
      resizeObserver.observe(rootEl);
    }

    return () => {
      resizeObserver.disconnect();
      root.unmount();
      rootRef.current = null;
      docRef.current = null;
      updateHeightRef.current = () => {};
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    root.render(<SandboxApp html={content} loadingText={loadingText} />);
    requestAnimationFrame(() => updateHeightRef.current?.());
  }, [content, loadingText]);

  return (
    <iframe
      ref={iframeRef}
      sandbox="allow-scripts allow-same-origin"
      className={className}
      style={{
        width: "100%",
        height: `${height}px`,
        margin: "16px 0",
      }}
      title="HTML Sandbox"
    />
  );
};

export default IframeSandbox;
