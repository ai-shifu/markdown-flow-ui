import React, { useEffect, useRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import SandboxApp from "./SandboxApp";
import { splitContentSegments } from "./utils/split-content";
import ContentRender from "./ContentRender";
// Lazy-loaded to avoid bundling ~3.3 MB of vendor libs for non-blackboard consumers
const loadBlackboardVendor = () =>
  import("./blackboard-vendor").then((m) => m.injectBlackboardLibraries);
export interface IframeSandboxProps {
  content: string;
  className?: string;
  loadingText?: string;
  styleLoadingText?: string;
  scriptLoadingText?: string;
  fullScreenButtonText?: string;
  hideFullScreen?: boolean;
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
  hideFullScreen = false,
  mode = "content",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const rootRef = useRef<Root | null>(null);
  const docRef = useRef<Document | null>(null);
  const updateHeightRef = useRef<() => void>(() => {});
  const [height, setHeight] = useState(480);
  const [resetToken, setResetToken] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
  const hasRootVhHeight = React.useMemo(() => {
    const normalized = htmlContent.trim();
    if (!normalized) return false;
    const rootMatch = normalized.match(/^<([a-zA-Z][\w:-]*)(\s[^>]*?)?>/);
    if (!rootMatch) return false;
    const attrs = rootMatch[2] || "";
    const heightAttrMatch = attrs.match(/\bheight\s*=\s*["']([^"']+)["']/i);
    if (heightAttrMatch && /vh$/i.test(heightAttrMatch[1].trim())) {
      return true;
    }
    const styleAttrMatch = attrs.match(/\bstyle\s*=\s*["']([^"']+)["']/i);
    if (!styleAttrMatch) return false;
    return /height\s*:\s*[^;]*vh\b/i.test(styleAttrMatch[1]);
  }, [htmlContent]);
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
<html${mode === "blackboard" ? ' style="height: 100%;"' : ""}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      html, body { margin: 0; padding: 0;${mode === "blackboard" ? " width: 100%; height: 100%; overflow: auto;" : ""} }
      *, *::before, *::after { box-sizing: border-box; }
    </style>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`);
    doc.close();

    // Inject Tailwind/DaisyUI/GSAP into iframe for blackboard mode.
    // Dynamic import keeps ~3.3 MB of vendor libs out of the main bundle.
    // Tailwind's MutationObserver ensures styles apply even if content renders first.
    if (mode === "blackboard") {
      loadBlackboardVendor().then((inject) => inject(doc));
    }

    docRef.current = doc;

    const rootEl = doc.getElementById("root");
    if (!rootEl) return undefined;

    const root = createRoot(rootEl);
    rootRef.current = root;

    const parseExplicitHeight = (
      value: string,
      parentViewportHeight: number
    ) => {
      const normalized = value.trim().toLowerCase();
      if (!normalized) return null;
      const numeric = Number.parseFloat(normalized);
      if (Number.isNaN(numeric)) return null;
      if (normalized.endsWith("vh")) {
        return (numeric / 100) * parentViewportHeight;
      }
      if (normalized.endsWith("px") || /^[0-9.]+$/.test(normalized)) {
        return numeric;
      }
      return null;
    };

    const resolveExplicitHeight = () => {
      if (!iframeRef.current || !doc.body) return null;
      const wrapper = doc.body.querySelector(
        ".sandbox-wrapper"
      ) as HTMLElement | null;
      const container = wrapper?.firstElementChild as HTMLElement | null;
      if (!container) return null;
      const elements = Array.from(container.children) as HTMLElement[];
      if (elements.length !== 1) return null;
      const target = elements[0];
      const heightValue = target.style.height || target.getAttribute("height");
      if (!heightValue) return null;
      const parentViewportHeight =
        iframeRef.current.ownerDocument?.documentElement?.clientHeight ||
        window.innerHeight;
      const parsed = parseExplicitHeight(heightValue, parentViewportHeight);
      return parsed ? Math.ceil(parsed) : null;
    };

    const updateHeight = () => {
      if (!iframeRef.current || !doc.body) return;
      const bodyRect = doc.body.getBoundingClientRect();
      const htmlRect = doc.documentElement?.getBoundingClientRect();
      const bodyHeight = bodyRect.height;
      const htmlHeight = htmlRect?.height || 0;
      const contentHeight = Math.max(bodyHeight, htmlHeight);
      const explicitHeight = resolveExplicitHeight();
      const nextHeight = Math.max(
        200,
        explicitHeight ?? Math.ceil(contentHeight)
      );
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
      // Defer unmount to avoid React warning when parent is mid-render
      setTimeout(() => {
        root.unmount();
        rootRef.current = null;
        docRef.current = null;
        updateHeightRef.current = () => {};
      }, 0);
    };
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    const target = containerRef.current || iframeRef.current;
    if (!target) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      return;
    }
    if (target.requestFullscreen) {
      target.requestFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    root.render(
      <SandboxApp
        html={htmlContent}
        loadingText={loadingText}
        styleLoadingText={styleLoadingText}
        scriptLoadingText={scriptLoadingText}
        fullScreenButtonText={fullScreenButtonText}
        hideFullScreen={hideFullScreen}
        resetToken={resetToken}
        hasRootVhHeight={hasRootVhHeight}
        mode={mode}
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
    mode,
  ]);

  return (
    <div
      ref={containerRef}
      data-root-vh={hasRootVhHeight ? "true" : "false"}
      className={
        "w-full h-full overflow-auto relative flex flex-col content-render-iframe-sandbox"
      }
    >
      {!hideFullScreen && (
        <button
          type="button"
          onClick={toggleFullscreen}
          className={
            "absolute top-2 right-2 z-50 p-1.5 bg-black/75 text-white rounded-md cursor-pointer"
          }
        >
          {isFullscreen ? "退出全屏" : fullScreenButtonText || "全屏浏览"}
        </button>
      )}
      {mode === "blackboard" && type === "markdown" ? (
        <ContentRender content={content} />
      ) : (
        <iframe
          ref={iframeRef}
          sandbox="allow-scripts allow-same-origin"
          allow="fullscreen"
          allowFullScreen
          className={(className, "w-full")}
          style={{
            height: mode === "blackboard" ? "100%" : `${height}px`,
            // height: `${height}px`,
            // margin: "16px 0",
          }}
        />
      )}
    </div>
  );
};

export default IframeSandbox;
