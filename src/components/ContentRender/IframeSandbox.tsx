import React, { useEffect, useRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import SandboxApp from "./SandboxApp";
import { splitContentSegments } from "./utils/split-content";
import ContentRender from "./ContentRender";
// Lazy-load iframe vendor libraries and inject them into the sandbox document.
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

const normalizeTailwindHeightTokens = (className: string) =>
  className
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => token.split(":").pop() || token);

const parseViewportHeightCss = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  const matched = normalized.match(/^([0-9.]+)(vh|dvh|svh|lvh)$/i);
  if (!matched) return null;
  return `${matched[1]}${matched[2].toLowerCase()}`;
};

const extractViewportHeightFromTailwindClass = (className: string) => {
  if (!className.trim()) return null;
  const normalizedTokens = normalizeTailwindHeightTokens(className);
  if (
    normalizedTokens.includes("h-screen") ||
    normalizedTokens.includes("h-dvh")
  ) {
    return "100dvh";
  }
  if (normalizedTokens.includes("h-svh")) {
    return "100svh";
  }
  if (normalizedTokens.includes("h-lvh")) {
    return "100lvh";
  }
  const arbitraryToken = normalizedTokens.find((token) =>
    /^h-\[[0-9.]+(vh|dvh|svh|lvh)\]$/i.test(token)
  );
  if (!arbitraryToken) return null;
  const matched = arbitraryToken.match(/^h-\[([0-9.]+)(vh|dvh|svh|lvh)\]$/i);
  if (!matched) return null;
  return `${matched[1]}${matched[2].toLowerCase()}`;
};

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
  const rootViewportHeightCss = React.useMemo(() => {
    const normalized = htmlContent.trim();
    if (!normalized) return null;
    const rootMatch = normalized.match(/^<([a-zA-Z][\w:-]*)(\s[^>]*?)?>/);
    if (!rootMatch) return null;
    const attrs = rootMatch[2] || "";
    const heightAttrMatch = attrs.match(/\bheight\s*=\s*["']([^"']+)["']/i);
    if (heightAttrMatch) {
      const explicitHeightCss = parseViewportHeightCss(heightAttrMatch[1]);
      if (explicitHeightCss) return explicitHeightCss;
    }
    const styleAttrMatch = attrs.match(/\bstyle\s*=\s*["']([^"']+)["']/i)?.[1];
    const styleHeightMatch = styleAttrMatch?.match(
      /\bheight\s*:\s*([^;]+)/i
    )?.[1];
    if (styleHeightMatch) {
      const styleHeightCss = parseViewportHeightCss(styleHeightMatch);
      if (styleHeightCss) return styleHeightCss;
    }
    const classAttrMatch = attrs.match(/\bclass\s*=\s*["']([^"']+)["']/i)?.[1];
    if (!classAttrMatch) return null;
    return extractViewportHeightFromTailwindClass(classAttrMatch);
  }, [htmlContent]);
  const hasRootVhHeight = Boolean(rootViewportHeightCss);
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

    docRef.current = doc;

    const rootEl = doc.getElementById("root");
    if (!rootEl) return undefined;

    const root = createRoot(rootEl);
    rootRef.current = root;
    let isDestroyed = false;
    const pendingHeightTimerIds = new Set<number>();

    const parseExplicitHeight = (
      value: string,
      parentViewportHeight: number
    ) => {
      const normalized = value.trim().toLowerCase();
      if (!normalized) return null;
      const numeric = Number.parseFloat(normalized);
      if (Number.isNaN(numeric)) return null;
      if (/(dvh|svh|lvh|vh)$/i.test(normalized)) {
        return (numeric / 100) * parentViewportHeight;
      }
      if (normalized.endsWith("px") || /^[0-9.]+$/.test(normalized)) {
        return numeric;
      }
      return null;
    };
    const parseTailwindHeightClass = (
      className: string,
      parentViewportHeight: number
    ) => {
      if (!className.trim()) return null;
      const viewportHeightCss =
        extractViewportHeightFromTailwindClass(className);
      if (viewportHeightCss) {
        return parseExplicitHeight(viewportHeightCss, parentViewportHeight);
      }
      const normalizedTokens = normalizeTailwindHeightTokens(className);
      const arbitraryToken = normalizedTokens.find((token) =>
        /^h-\[[0-9.]+px\]$/i.test(token)
      );
      if (!arbitraryToken) return null;
      const matched = arbitraryToken.match(/^h-\[([0-9.]+)px\]$/i);
      if (!matched) return null;
      const numeric = Number.parseFloat(matched[1]);
      if (Number.isNaN(numeric)) return null;
      return numeric;
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
      const parentViewportHeight =
        iframeRef.current.ownerDocument?.documentElement?.clientHeight ||
        window.innerHeight;
      const parsed = heightValue
        ? parseExplicitHeight(heightValue, parentViewportHeight)
        : null;
      if (parsed !== null) {
        return Math.ceil(parsed);
      }
      const classHeight = parseTailwindHeightClass(
        target.getAttribute("class") || "",
        parentViewportHeight
      );
      return classHeight !== null ? Math.ceil(classHeight) : null;
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
    const queueHeightUpdate = (delayMs: number) => {
      const timerId = window.setTimeout(() => {
        pendingHeightTimerIds.delete(timerId);
        if (isDestroyed) return;
        updateHeight();
      }, delayMs);
      pendingHeightTimerIds.add(timerId);
    };
    const scheduleHeightUpdate = () => {
      requestAnimationFrame(() => {
        if (isDestroyed) return;
        updateHeight();
      });
      // Keep measuring until runtime styles are fully injected and applied.
      [80, 220, 420].forEach(queueHeightUpdate);
    };
    updateHeightRef.current = scheduleHeightUpdate;

    updateHeight();
    scheduleHeightUpdate();

    // Inject Tailwind/DaisyUI/GSAP into iframe for all sandbox modes.
    // Dynamic import keeps ~3.3 MB of vendor libs out of the main bundle.
    // Tailwind's MutationObserver ensures styles apply even if content renders first.
    loadBlackboardVendor()
      .then((inject) => {
        if (isDestroyed) return;
        inject(doc);
        scheduleHeightUpdate();
      })
      .catch(() => {
        if (isDestroyed) return;
        scheduleHeightUpdate();
      });

    const resizeObserver = new ResizeObserver(() => updateHeight());
    resizeObserver.observe(doc.body);
    if (rootEl) {
      resizeObserver.observe(rootEl);
    }

    return () => {
      isDestroyed = true;
      pendingHeightTimerIds.forEach((timerId) => clearTimeout(timerId));
      pendingHeightTimerIds.clear();
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
            height:
              mode === "blackboard"
                ? "100%"
                : rootViewportHeightCss || `${height}px`,
            // height: `${height}px`,
            // margin: "16px 0",
          }}
        />
      )}
    </div>
  );
};

export default IframeSandbox;
