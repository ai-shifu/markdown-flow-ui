import React, { useEffect, useRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import SandboxApp from "./SandboxApp";
import { splitContentSegments } from "./utils/split-content";
import ContentRender from "./ContentRender";
export interface IframeSandboxProps {
  content: string;
  className?: string;
  loadingText?: string;
  styleLoadingText?: string;
  scriptLoadingText?: string;
  fullScreenButtonText?: string;
  mode?: "content" | "blackboard";
  type: "sandbox" | "markdown";
}

const IframeSandbox: React.FC<IframeSandboxProps> = ({
  content,
  type,
  className,
  loadingText,
  styleLoadingText,
  scriptLoadingText,
  fullScreenButtonText,
  mode = "content",
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const rootRef = useRef<Root | null>(null);
  const docRef = useRef<Document | null>(null);
  const updateHeightRef = useRef<() => void>(() => {});
  const [height, setHeight] = useState(480);
  const [resetToken, setResetToken] = useState(0);
  const prevHtmlRef = useRef<string>("");
  const htmlContent = React.useMemo(() => {
    const segments = splitContentSegments(content);
    // console.log('segments=====', segments);
    const sandboxSegments = segments.filter((seg) => seg.type === "sandbox");
    const sandboxContent =
      mode === "blackboard"
        ? sandboxSegments[sandboxSegments.length - 1]?.value || ""
        : sandboxSegments.map((seg) => seg.value).join("\n");
    return sandboxContent || "";
  }, [content, mode]);

  useEffect(() => {
    if (mode !== "blackboard") {
      prevHtmlRef.current = htmlContent;
      return;
    }
    const prev = prevHtmlRef.current;
    const isContinuation = prev && htmlContent.startsWith(prev);
    if (!isContinuation && prev) {
      setResetToken((token) => token + 1);
    }
    prevHtmlRef.current = htmlContent;
  }, [htmlContent, mode]);

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

    root.render(
      <SandboxApp
        html={htmlContent}
        loadingText={loadingText}
        styleLoadingText={styleLoadingText}
        scriptLoadingText={scriptLoadingText}
        // fullScreenButtonText={fullScreenButtonText}
        resetToken={resetToken}
      />
    );
    requestAnimationFrame(() => updateHeightRef.current?.());
  }, [
    content,
    htmlContent,
    loadingText,
    styleLoadingText,
    scriptLoadingText,
    fullScreenButtonText,
    resetToken,
  ]);

  return (
    <div style={{ width: "100%", height: "100%", overflow: "auto" }}>
      {mode === "blackboard" && type === "markdown" ? (
        <ContentRender content={content} />
      ) : (
        <iframe
          ref={iframeRef}
          sandbox="allow-scripts allow-same-origin"
          allow="fullscreen"
          allowFullScreen
          className={className}
          style={{
            width: "100%",
            height: `${height}px`,
            // margin: "16px 0",
          }}
          title="HTML Sandbox"
        />
      )}
    </div>
  );
};

export default IframeSandbox;
