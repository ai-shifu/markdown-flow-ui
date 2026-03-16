import React, { useCallback, useEffect, useRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import { Loader2 } from "lucide-react";
import SandboxApp from "./SandboxApp";
import { splitContentSegments } from "./utils/split-content";
import ContentRender from "./ContentRender";

type InjectBlackboardLibraries =
  typeof import("./blackboard-vendor").injectBlackboardLibraries;

// Cache the sandbox vendor loader so every iframe reuses the same preload request.
let blackboardVendorPromise: Promise<InjectBlackboardLibraries> | null = null;

const loadBlackboardVendor = () => {
  if (!blackboardVendorPromise) {
    blackboardVendorPromise = import("./blackboard-vendor").then(
      (m) => m.injectBlackboardLibraries
    );
  }

  return blackboardVendorPromise;
};

// Warm the sandbox vendor chunk as early as possible in the browser.
if (typeof window !== "undefined") {
  void loadBlackboardVendor();
}

const COMPLETE_IMAGE_TAG_PATTERN = /<img\b[^>]*>/i;
const POST_IMAGE_STREAM_DEBOUNCE_MS = 180;
const SANDBOX_INTERACTION_MESSAGE_SOURCE = "markdown-flow-ui:sandbox";
const SANDBOX_INTERACTION_MESSAGE_TYPE = "interaction";
const SANDBOX_INTERACTION_THROTTLE_MS = 240;
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
  const lastSandboxInteractionTimeRef = useRef(0);
  const [resetToken, setResetToken] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSandboxVendorReady, setIsSandboxVendorReady] = useState(
    type !== "sandbox"
  );
  const isBlackboardMode = mode === "blackboard";
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
  const [renderHtmlContent, setRenderHtmlContent] = useState(htmlContent);
  const prevIncomingHtmlRef = useRef(htmlContent);
  const pendingHtmlRef = useRef(htmlContent);
  const deferRenderTimerRef = useRef<number | null>(null);

  const emitSandboxInteraction = useCallback((eventType: string) => {
    if (typeof window === "undefined") {
      return;
    }
    const now = Date.now();
    if (
      now - lastSandboxInteractionTimeRef.current <
      SANDBOX_INTERACTION_THROTTLE_MS
    ) {
      return;
    }
    lastSandboxInteractionTimeRef.current = now;
    window.postMessage(
      {
        source: SANDBOX_INTERACTION_MESSAGE_SOURCE,
        type: SANDBOX_INTERACTION_MESSAGE_TYPE,
        eventType,
      },
      window.location.origin
    );
  }, []);

  const clearDeferredRenderTimer = () => {
    if (deferRenderTimerRef.current === null) return;
    window.clearTimeout(deferRenderTimerRef.current);
    deferRenderTimerRef.current = null;
  };

  useEffect(
    () => () => {
      clearDeferredRenderTimer();
    },
    []
  );

  useEffect(() => {
    const prevIncomingHtml = prevIncomingHtmlRef.current;
    prevIncomingHtmlRef.current = htmlContent;

    const isAppendOnlyStream =
      !!prevIncomingHtml &&
      htmlContent.length > prevIncomingHtml.length &&
      htmlContent.startsWith(prevIncomingHtml);
    const containsCompleteImage = COMPLETE_IMAGE_TAG_PATTERN.test(htmlContent);
    const shouldDeferRender = isAppendOnlyStream && containsCompleteImage;

    if (!shouldDeferRender) {
      clearDeferredRenderTimer();
      pendingHtmlRef.current = htmlContent;
      setRenderHtmlContent(htmlContent);
      return;
    }

    pendingHtmlRef.current = htmlContent;
    clearDeferredRenderTimer();
    deferRenderTimerRef.current = window.setTimeout(() => {
      setRenderHtmlContent(pendingHtmlRef.current);
      deferRenderTimerRef.current = null;
    }, POST_IMAGE_STREAM_DEBOUNCE_MS);
  }, [htmlContent]);

  const rootViewportHeightCss = React.useMemo(() => {
    const normalized = renderHtmlContent.trim();
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
  }, [renderHtmlContent]);
  const hasRootVhHeight = Boolean(rootViewportHeightCss);
  const shouldInjectSandboxVendor = type === "sandbox";
  const sandboxViewportHeight =
    isBlackboardMode && type === "sandbox"
      ? (rootViewportHeightCss ?? `${height}px`)
      : undefined;
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
      html, body, #root { width: 100%; height: 100%; }
      html, body { margin: 0; padding: 0; overflow: auto; }
      *, *::before, *::after { box-sizing: border-box; }
    </style>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`);
    doc.close();

    docRef.current = doc;

    const shouldBridgeSandboxInteraction =
      isBlackboardMode && type === "sandbox";
    const handleSandboxPointerDown = () =>
      emitSandboxInteraction("pointerdown");
    const handleSandboxMouseDown = () => emitSandboxInteraction("mousedown");
    const handleSandboxTouchStart = () => emitSandboxInteraction("touchstart");

    if (shouldBridgeSandboxInteraction) {
      doc.addEventListener("pointerdown", handleSandboxPointerDown, true);
      doc.addEventListener("mousedown", handleSandboxMouseDown, true);
      doc.addEventListener("touchstart", handleSandboxTouchStart, true);
    }

    const rootEl = doc.getElementById("root");
    if (!rootEl) return undefined;

    const root = createRoot(rootEl);
    rootRef.current = root;
    let isDestroyed = false;

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
    const scheduleHeightUpdate = () => {
      requestAnimationFrame(() => {
        if (isDestroyed) return;
        updateHeight();
      });
    };
    updateHeightRef.current = scheduleHeightUpdate;

    updateHeight();
    scheduleHeightUpdate();

    if (!shouldInjectSandboxVendor) {
      setIsSandboxVendorReady(true);
    } else {
      // Inject Tailwind/DaisyUI/GSAP before rendering sandbox content to avoid FOUC.
      loadBlackboardVendor()
        .then((inject) => {
          if (isDestroyed) return;
          inject(doc);
          requestAnimationFrame(() => {
            if (isDestroyed) return;
            setIsSandboxVendorReady(true);
            scheduleHeightUpdate();
          });
        })
        .catch(() => {
          if (isDestroyed) return;
          setIsSandboxVendorReady(true);
          scheduleHeightUpdate();
        });
    }

    const resizeObserver = new ResizeObserver(() => updateHeight());
    resizeObserver.observe(doc.body);
    if (rootEl) {
      resizeObserver.observe(rootEl);
    }

    return () => {
      isDestroyed = true;
      resizeObserver.disconnect();
      if (shouldBridgeSandboxInteraction) {
        doc.removeEventListener("pointerdown", handleSandboxPointerDown, true);
        doc.removeEventListener("mousedown", handleSandboxMouseDown, true);
        doc.removeEventListener("touchstart", handleSandboxTouchStart, true);
      }
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
    if (!root || !isSandboxVendorReady) return;

    root.render(
      <SandboxApp
        html={renderHtmlContent}
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
    renderHtmlContent,
    loadingText,
    styleLoadingText,
    scriptLoadingText,
    fullScreenButtonText,
    resetToken,
    mode,
    isSandboxVendorReady,
  ]);
  const containerClassName = [
    "w-full relative content-render-iframe-sandbox",
    isBlackboardMode
      ? "h-full overflow-auto flex flex-col"
      : "aspect-[16/9] overflow-hidden flex items-center justify-center",
  ]
    .filter(Boolean)
    .join(" ");

  const shouldShowSandboxLoading =
    shouldInjectSandboxVendor && !isSandboxVendorReady;

  return (
    <div
      ref={containerRef}
      data-root-vh={hasRootVhHeight ? "true" : "false"}
      className={containerClassName}
      style={
        sandboxViewportHeight
          ? {
              height: sandboxViewportHeight,
              minHeight: sandboxViewportHeight,
            }
          : undefined
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
        <div
          onMouseDown={() => emitSandboxInteraction("mousedown")}
          onPointerDown={() => emitSandboxInteraction("pointerdown")}
          onTouchStart={() => emitSandboxInteraction("touchstart")}
        >
          <ContentRender content={content} />
        </div>
      ) : (
        <>
          <iframe
            ref={iframeRef}
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            allow="fullscreen"
            allowFullScreen
            className={[className, "w-full h-full mx-auto my-auto block"]
              .filter(Boolean)
              .join(" ")}
            style={{
              height: sandboxViewportHeight ?? "100%",
              minHeight: sandboxViewportHeight,
              margin: "auto",
              visibility: shouldShowSandboxLoading ? "hidden" : "visible",
            }}
          />
          {shouldShowSandboxLoading ? (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
              <Loader2
                aria-label={loadingText || "Preparing sandbox styles"}
                className="text-primary h-7 w-7 animate-spin"
              />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default IframeSandbox;
