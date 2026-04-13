import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import {
  injectScalingSystem,
  type ScalingWindow,
} from "./utils/iframe-scaling";

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
  enableScaling?: boolean;
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
  enableScaling = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const rootRef = useRef<Root | null>(null);
  const updateHeightRef = useRef<() => void>(() => {});
  const [height, setHeight] = useState(480);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const isMeasuringContentRef = useRef(false);
  const pendingHeightUpdateRef = useRef(false);
  const lastSandboxInteractionTimeRef = useRef(0);
  const [resetToken, setResetToken] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const shouldInjectSandboxVendor = type === "sandbox";

  const isBlackboardMode = mode === "blackboard";
  const shouldEnableScaling =
    enableScaling && isBlackboardMode && type === "sandbox";
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
      ? shouldEnableScaling
        ? "100%"
        : shouldStretchRootHeight
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
      html, body, #root { width: 100%; }
      ${mode === "blackboard" ? "html, body, #root { height: 100%; }" : ""}
      html, body { margin: 0; padding: 0; overflow: ${shouldEnableScaling ? "hidden auto" : mode === "blackboard" ? "auto" : "hidden"}; }
      *, *::before, *::after { box-sizing: border-box; }
      ${
        mode !== "blackboard"
          ? `
        .h-screen { height: auto !important; }
        .min-h-screen { min-height: auto !important; }
        .h-dvh, .h-svh, .h-lvh { height: auto !important; }
        .min-h-dvh, .min-h-svh, .min-h-lvh { min-height: auto !important; }
      `
          : ""
      }
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
    const handleSandboxClick = () => emitSandboxInteraction("click");

    if (shouldBridgeSandboxInteraction) {
      doc.addEventListener("click", handleSandboxClick, true);
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
      if (!iframeRef.current || !doc.body) return;

      if (!isBlackboardMode) {
        // Guard: prevent re-entrant measurement from ResizeObserver /
        // MutationObserver callbacks triggered by our own height changes.
        if (isMeasuringContentRef.current) {
          // Mark that an update was requested while the guard was active.
          // We will retry once the guard releases (see setTimeout below).
          pendingHeightUpdateRef.current = true;
          return;
        }
        isMeasuringContentRef.current = true;

        // Content mode height measurement strategy:
        // Temporarily set iframe height to the 16:9 minimum so that:
        // 1. vmin units are stable: vmin = min(cw, minH)/100 = minH/100,
        //    consistent with the final rendered 16:9 iframe.
        // 2. Viewport-filling content (e.g. inline style="height:100vh")
        //    fills the 16:9 space → scrollHeight = minH, which is then
        //    correctly bounded by the 16:9 minimum in contentModeStyle.
        //    (Previously using cw caused such content to report 1:1 height,
        //    overriding the 16:9 minimum.)
        const iframe = iframeRef.current;
        const cw = containerRef.current?.clientWidth || 0;
        const prevH = iframe.style.height;

        if (cw > 0) {
          const minH = Math.round((cw * 9) / 16);
          iframe.style.height = minH + "px";
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          doc.body.offsetHeight; // force layout

          let measuredH = doc.body.scrollHeight;

          // Detect inner elements that clip overflowing content behind a
          // scrollbar (e.g. <div style="height:100vh; overflow-y:auto"> whose
          // content is taller than the iframe). body.scrollHeight won't see
          // that overflow, so we walk the tree and factor in each scrollable
          // element's full scroll height based on its position in the iframe.
          const iframeWin = doc.defaultView;
          if (iframeWin) {
            // Returns the max natural bottom of inner elements that clip
            // content via overflow:auto/scroll (i.e. internal scrollbars).
            const getInnerScrollableHeight = (root: Element): number => {
              let maxH = 0;
              const walk = (el: Element) => {
                if (el !== root && el.scrollHeight > el.clientHeight + 1) {
                  const oy = iframeWin.getComputedStyle(el).overflowY;
                  if (oy === "auto" || oy === "scroll") {
                    const rect = el.getBoundingClientRect();
                    if (rect.top >= 0) {
                      maxH = Math.max(
                        maxH,
                        Math.ceil(rect.top + el.scrollHeight)
                      );
                    }
                  }
                }
                for (const child of el.children) walk(child);
              };
              walk(root);
              return maxH;
            };

            measuredH = Math.max(measuredH, getInnerScrollableHeight(doc.body));

            // Content that uses vh-relative sizing grows as the viewport
            // expands. Measure up to 8 more times at the expanded height so
            // we capture the full content height in a single updateHeight()
            // call rather than waiting for external re-triggers.
            for (let i = 0; i < 8 && measuredH > minH; i++) {
              iframe.style.height = measuredH + "px";
              // eslint-disable-next-line @typescript-eslint/no-unused-expressions
              doc.body.offsetHeight; // force layout at expanded size
              const nextH = Math.max(
                doc.body.scrollHeight,
                getInnerScrollableHeight(doc.body)
              );
              if (nextH <= measuredH + 1) break; // stable — stop iterating
              measuredH = nextH;
            }
          }

          // Restore iframe to let React control it via contentModeStyle
          iframe.style.height = prevH;

          setContentHeight((prev) => {
            const next = Math.max(200, Math.ceil(measuredH));
            return prev === next ? prev : next;
          });
        }

        setTimeout(() => {
          isMeasuringContentRef.current = false;
          // Retry any update that was blocked while the guard was active
          // (e.g. dynamic content injected by scripts or images loading).
          if (pendingHeightUpdateRef.current) {
            pendingHeightUpdateRef.current = false;
            scheduleHeightUpdate();
          }
        }, 50);
        return;
      }

      // Scaling mode: viewport is fixed, content scales via font-size.
      if (shouldEnableScaling) return;

      // Blackboard mode: use existing measurement logic
      const bodyScrollH = doc.body.scrollHeight;
      const htmlScrollH = doc.documentElement?.scrollHeight || 0;
      const rootScrollH = rootEl?.scrollHeight || 0;
      const measuredHeight = Math.max(bodyScrollH, htmlScrollH, rootScrollH);

      if (shouldMeasureDynamicHeight) {
        const explicitHeight = resolveExplicitHeight();
        const nextHeight = Math.max(
          200,
          explicitHeight ?? Math.ceil(measuredHeight)
        );
        setHeight((prevHeight) =>
          prevHeight === nextHeight ? prevHeight : nextHeight
        );
      }
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
          if (shouldEnableScaling) {
            injectScalingSystem(doc);
          }
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

    // MutationObserver: detect DOM changes that ResizeObserver might miss
    // (e.g. content injected by scripts, images loading, dynamic rendering)
    const mutationObserver = new MutationObserver(() => {
      scheduleHeightUpdate();
    });
    mutationObserver.observe(doc.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    return () => {
      isDestroyed = true;
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      if (shouldEnableScaling) {
        const iframeWin = iframe.contentWindow as ScalingWindow | null;
        iframeWin?.__mdf_cleanupScaling?.();
      }
      if (shouldBridgeSandboxInteraction) {
        doc.removeEventListener("click", handleSandboxClick, true);
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

  // Track container width for computing min-height in content mode
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setContainerWidth(entries[0]?.contentRect.width ?? el.clientWidth);
    });
    ro.observe(el);
    setContainerWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // Content mode: min 16:9 aspect ratio, grow to fit content (no scrollbar)
  const contentModeStyle = useMemo<React.CSSProperties | undefined>(() => {
    if (isBlackboardMode || containerWidth === 0 || isFullscreen)
      return undefined;
    const minH = Math.round((containerWidth * 9) / 16);
    const h = Math.max(minH, contentHeight);
    return { height: h };
  }, [isBlackboardMode, containerWidth, contentHeight, isFullscreen]);

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
        enableScaling={shouldEnableScaling}
      />
    );

    // Schedule multiple measurements to catch async content (scripts, images, styles).
    initialPaintFrameRef.current = window.requestAnimationFrame(() => {
      updateHeightRef.current?.();
      if (shouldEnableScaling) {
        const iframeWin = iframeRef.current
          ?.contentWindow as ScalingWindow | null;
        iframeWin?.__mdf_triggerFitContent?.();
      }
      initialPaintFrameRef.current = null;
    });
    const t1 = setTimeout(() => updateHeightRef.current?.(), 100);
    const t2 = setTimeout(() => updateHeightRef.current?.(), 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
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
      : contentModeStyle
        ? "overflow-hidden flex items-center justify-center"
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
          : contentModeStyle
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
        <div onClick={() => emitSandboxInteraction("click")}>
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
          }}
        />
      )}
    </div>
  );
};

export default IframeSandbox;
