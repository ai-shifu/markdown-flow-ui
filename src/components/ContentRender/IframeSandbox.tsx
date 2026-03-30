import React, { useCallback, useEffect, useRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import SandboxApp from "./SandboxApp";
import ContentRender from "./ContentRender";
import {
  EMPTY_ROOT_HEIGHT_META,
  inspectViewportHeightFromHtmlRootString,
  inspectViewportHeightFromNodeChain,
  parseExplicitHeight,
  resolveExplicitHeightFromNodeChain,
} from "./utils/iframe-viewport-height";
import {
  SANDBOX_INTERACTION_MESSAGE_SOURCE,
  SANDBOX_INTERACTION_MESSAGE_TYPE,
} from "../../lib/sandboxInteraction";

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

const COMPLETE_IMAGE_TAG_PATTERN = /<img\b[^>]*>/i;
const POST_IMAGE_STREAM_DEBOUNCE_MS = 180;
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
  replaceRootScreenHeightWithFull?: boolean;
}

const replaceRootScreenHeightToken = (className: string) =>
  className
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      const segments = token.split(":");
      if (
        segments[segments.length - 1] !== "h-screen" &&
        segments[segments.length - 1] !== "min-h-screen"
      ) {
        return token;
      }
      segments[segments.length - 1] = "h-full";
      return segments.join(":");
    })
    .join(" ");

const replaceRootScreenHeightWithFullClass = (
  html: string,
  enabled: boolean
) => {
  if (!enabled || !html.trim()) {
    return html;
  }

  return html.replace(
    /^(\s*<[a-zA-Z][\w:-]*)(\s[^>]*?)?>/,
    (match, tagStart: string, attrs = "") => {
      const classMatch = attrs.match(/\bclass\s*=\s*(["'])([^"']*)\1/i);

      if (!classMatch) {
        return match;
      }

      const nextClassName = replaceRootScreenHeightToken(classMatch[2]);

      if (nextClassName === classMatch[2]) {
        return match;
      }

      return `${tagStart}${attrs.replace(
        classMatch[0],
        `class=${classMatch[1]}${nextClassName}${classMatch[1]}`
      )}>`;
    }
  );
};

const IframeSandbox: React.FC<IframeSandboxProps> = ({
  content,
  type,
  className,
  styleLoadingText,
  scriptLoadingText,
  fullScreenButtonText,
  hideFullScreen = false,
  mode = "content",
  replaceRootScreenHeightWithFull = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const rootRef = useRef<Root | null>(null);
  const updateHeightRef = useRef<() => void>(() => {});
  const [height, setHeight] = useState(480);
  const lastSandboxInteractionTimeRef = useRef(0);
  const [resetToken, setResetToken] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const shouldInjectSandboxVendor = type === "sandbox";

  const isBlackboardMode = mode === "blackboard";
  const shouldMeasureDynamicHeight = isBlackboardMode && type === "sandbox";
  const shouldProcessRootScreenHeight =
    shouldMeasureDynamicHeight && replaceRootScreenHeightWithFull;
  const prevHtmlRef = useRef<string>("");
  const htmlContent = React.useMemo(
    () => (type === "sandbox" ? content : ""),
    [content, type]
  );
  const normalizedHtmlContent = React.useMemo(
    () =>
      replaceRootScreenHeightWithFullClass(
        htmlContent,
        shouldProcessRootScreenHeight
      ),
    [htmlContent, shouldProcessRootScreenHeight]
  );
  const originalRootHeightMeta = React.useMemo(
    () =>
      shouldProcessRootScreenHeight
        ? inspectViewportHeightFromHtmlRootString(htmlContent)
        : EMPTY_ROOT_HEIGHT_META,
    [htmlContent, shouldProcessRootScreenHeight]
  );
  const shouldStretchRootHeight = React.useMemo(
    () =>
      shouldProcessRootScreenHeight &&
      originalRootHeightMeta.hasFullViewportHeight,
    [
      originalRootHeightMeta.hasFullViewportHeight,
      shouldProcessRootScreenHeight,
    ]
  );
  const [renderHtmlContent, setRenderHtmlContent] = useState(
    normalizedHtmlContent
  );
  const prevIncomingHtmlRef = useRef(normalizedHtmlContent);
  const pendingHtmlRef = useRef(normalizedHtmlContent);
  const deferRenderTimerRef = useRef<number | null>(null);
  const initialPaintFrameRef = useRef<number | null>(null);
  const renderViewportHeightCssRef = useRef<string | null>(null);

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

  const clearInitialPaintFrames = () => {
    if (initialPaintFrameRef.current !== null) {
      window.cancelAnimationFrame(initialPaintFrameRef.current);
      initialPaintFrameRef.current = null;
    }
  };

  useEffect(
    () => () => {
      clearDeferredRenderTimer();
      clearInitialPaintFrames();
    },
    []
  );

  useEffect(() => {
    const prevIncomingHtml = prevIncomingHtmlRef.current;
    prevIncomingHtmlRef.current = normalizedHtmlContent;

    const isAppendOnlyStream =
      !!prevIncomingHtml &&
      normalizedHtmlContent.length > prevIncomingHtml.length &&
      normalizedHtmlContent.startsWith(prevIncomingHtml);
    const containsCompleteImage = COMPLETE_IMAGE_TAG_PATTERN.test(
      normalizedHtmlContent
    );
    const shouldDeferRender = isAppendOnlyStream && containsCompleteImage;

    if (!shouldDeferRender) {
      clearDeferredRenderTimer();
      pendingHtmlRef.current = normalizedHtmlContent;
      setRenderHtmlContent(normalizedHtmlContent);
      return;
    }

    pendingHtmlRef.current = normalizedHtmlContent;
    clearDeferredRenderTimer();
    deferRenderTimerRef.current = window.setTimeout(() => {
      setRenderHtmlContent(pendingHtmlRef.current);
      deferRenderTimerRef.current = null;
    }, POST_IMAGE_STREAM_DEBOUNCE_MS);
  }, [normalizedHtmlContent]);

  const rootViewportHeightCss = React.useMemo(() => {
    if (!shouldMeasureDynamicHeight) {
      return null;
    }

    return inspectViewportHeightFromHtmlRootString(renderHtmlContent)
      .viewportHeightCss;
  }, [renderHtmlContent, shouldMeasureDynamicHeight]);

  useEffect(() => {
    renderViewportHeightCssRef.current = rootViewportHeightCss;
  }, [rootViewportHeightCss]);

  const hasRootVhHeight = Boolean(rootViewportHeightCss);
  const sandboxViewportHeight =
    isBlackboardMode && type === "sandbox"
      ? shouldStretchRootHeight
        ? "100%"
        : (rootViewportHeightCss ?? `${height}px`)
      : undefined;
  useEffect(() => {
    if (mode !== "blackboard") {
      prevHtmlRef.current = normalizedHtmlContent;
      return;
    }
    const prev = prevHtmlRef.current;
    const isContinuation = prev && normalizedHtmlContent.startsWith(prev);
    if (!isContinuation && prev) {
      setResetToken((token) => token + 1);
    }
    prevHtmlRef.current = normalizedHtmlContent;
  }, [mode, normalizedHtmlContent]);

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
      :root { color-scheme: light; }
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

    // Force iframe theme to stay in light mode regardless of host OS preference.
    doc.documentElement.setAttribute("data-theme", "light");
    doc.documentElement.style.colorScheme = "light";
    doc.body?.style.setProperty("color-scheme", "light");

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
    const getHeightInspectionNode = (node: HTMLElement) => ({
      heightAttrValue: node.getAttribute("height"),
      styleAttrValue: node.getAttribute("style"),
      classAttrValue: node.getAttribute("class"),
    });
    const getSingleChildElement = (node: HTMLElement) => {
      const childElements = Array.from(node.children) as HTMLElement[];

      return childElements.length === 1 ? childElements[0] : null;
    };

    const resolveExplicitHeight = () => {
      if (!shouldMeasureDynamicHeight) return null;
      if (!iframeRef.current || !doc.body) return null;
      const parentViewportHeight =
        iframeRef.current.ownerDocument?.documentElement?.clientHeight ||
        window.innerHeight;
      // Reuse parsed height metadata from the current html snapshot first to
      // avoid re-inspecting the same DOM chain on every height tick.
      const precomputedViewportHeightCss = renderViewportHeightCssRef.current;
      const parsed = precomputedViewportHeightCss
        ? parseExplicitHeight(
            precomputedViewportHeightCss,
            parentViewportHeight
          )
        : null;

      if (parsed !== null) {
        return Math.ceil(parsed);
      }

      const wrapper = doc.body.querySelector(
        ".sandbox-wrapper"
      ) as HTMLElement | null;
      const container = wrapper?.firstElementChild as HTMLElement | null;
      if (!container) return null;
      const containerChildren = Array.from(container.children) as HTMLElement[];
      const rootContentElement =
        containerChildren.length === 1 ? containerChildren[0] : null;
      const runtimeHeightMeta = inspectViewportHeightFromNodeChain(
        rootContentElement,
        {
          getNode: getHeightInspectionNode,
          getSingleChild: getSingleChildElement,
        }
      );
      const runtimeViewportHeightCss = runtimeHeightMeta.viewportHeightCss;

      if (runtimeViewportHeightCss) {
        const runtimeViewportHeight = parseExplicitHeight(
          runtimeViewportHeightCss,
          parentViewportHeight
        );

        if (runtimeViewportHeight !== null) {
          return Math.ceil(runtimeViewportHeight);
        }
      }

      const explicitPixelHeight = resolveExplicitHeightFromNodeChain(
        rootContentElement,
        parentViewportHeight,
        {
          getNode: getHeightInspectionNode,
          getSingleChild: getSingleChildElement,
        }
      );

      return explicitPixelHeight !== null
        ? Math.ceil(explicitPixelHeight)
        : null;
    };

    const updateHeight = () => {
      if (!shouldMeasureDynamicHeight) return;
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
      setHeight((prevHeight) =>
        prevHeight === nextHeight ? prevHeight : nextHeight
      );
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

    if (shouldInjectSandboxVendor) {
      // Inject Tailwind/DaisyUI/GSAP before rendering sandbox content to avoid FOUC.
      loadBlackboardVendor()
        .then((inject) => {
          if (isDestroyed) return;
          inject(doc);
          requestAnimationFrame(() => {
            if (isDestroyed) return;
            scheduleHeightUpdate();
          });
        })
        .catch(() => {
          if (isDestroyed) return;
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
        html={renderHtmlContent}
        styleLoadingText={styleLoadingText}
        scriptLoadingText={scriptLoadingText}
        resetToken={resetToken}
        hasRootVhHeight={hasRootVhHeight}
        mode={mode}
        stretchRootHeight={shouldStretchRootHeight}
      />
    );

    initialPaintFrameRef.current = window.requestAnimationFrame(() => {
      updateHeightRef.current?.();
      initialPaintFrameRef.current = null;
    });
  }, [
    renderHtmlContent,
    styleLoadingText,
    scriptLoadingText,
    resetToken,
    mode,
  ]);
  const containerClassName = [
    "w-full relative content-render-iframe-sandbox",
    isBlackboardMode
      ? "h-full overflow-auto flex flex-col"
      : "aspect-[16/9] overflow-hidden flex items-center justify-center",
  ]
    .filter(Boolean)
    .join(" ");

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
            visibility: "visible",
          }}
        />
      )}
    </div>
  );
};

export default IframeSandbox;
