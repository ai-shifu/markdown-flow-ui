import React, { useCallback, useEffect, useRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import { Loader2 } from "lucide-react";
import SandboxApp from "./SandboxApp";
import { splitContentSegments } from "./utils/split-content";
import ContentRender from "./ContentRender";
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

// Warm the sandbox vendor chunk as early as possible in the browser.
if (typeof window !== "undefined") {
  void loadBlackboardVendor();
}

const COMPLETE_IMAGE_TAG_PATTERN = /<img\b[^>]*>/i;
const POST_IMAGE_STREAM_DEBOUNCE_MS = 180;
const SANDBOX_INTERACTION_THROTTLE_MS = 240;
const COMPLETE_IMAGE_SOURCE_PATTERN =
  /<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
const SANDBOX_IMAGE_PRELOAD_CACHE = new Map<string, Promise<void>>();
const SANDBOX_IMAGE_READY_CACHE = new Set<string>();

const extractCompleteImageSources = (html: string) => {
  const matches = Array.from(html.matchAll(COMPLETE_IMAGE_SOURCE_PATTERN));
  return Array.from(
    new Set(
      matches
        .map((match) => match[1]?.trim())
        .filter((src): src is string => Boolean(src))
    )
  );
};

const preloadSandboxImage = (src: string) => {
  if (!src) {
    return Promise.resolve();
  }

  const cached = SANDBOX_IMAGE_PRELOAD_CACHE.get(src);
  if (cached) {
    return cached;
  }

  const nextPromise = new Promise<void>((resolve) => {
    if (typeof window === "undefined") {
      SANDBOX_IMAGE_READY_CACHE.add(src);
      resolve();
      return;
    }

    const image = new window.Image();
    image.decoding = "sync";
    image.loading = "eager";
    image.fetchPriority = "high";

    const settleWhenRenderable = () => {
      const decodePromise =
        typeof image.decode === "function"
          ? image.decode().catch(() => undefined)
          : Promise.resolve();

      void decodePromise.finally(() => {
        SANDBOX_IMAGE_READY_CACHE.add(src);
        resolve();
      });
    };

    image.onload = () => {
      settleWhenRenderable();
    };
    image.onerror = () => {
      SANDBOX_IMAGE_READY_CACHE.add(src);
      resolve();
    };
    image.src = src;

    if (image.complete && image.naturalWidth > 0) {
      settleWhenRenderable();
    }
  });

  SANDBOX_IMAGE_PRELOAD_CACHE.set(src, nextPromise);
  return nextPromise;
};

const preloadSandboxImages = (sources: string[] = []) =>
  Promise.allSettled(sources.map((source) => preloadSandboxImage(source)));

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

const extractRootClassName = (html: string) => {
  const normalized = html.trim();
  if (!normalized) return null;
  const rootMatch = normalized.match(/^<([a-zA-Z][\w:-]*)(\s[^>]*?)?>/);
  if (!rootMatch) return null;
  return rootMatch[2]?.match(/\bclass\s*=\s*["']([^"']*)["']/i)?.[1] ?? null;
};

const hasRootScreenHeightClass = (html: string) => {
  const rootClassName = extractRootClassName(html);
  if (!rootClassName) return false;
  return normalizeTailwindHeightTokens(rootClassName).includes("h-screen");
};

const replaceRootScreenHeightToken = (className: string) =>
  className
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      const segments = token.split(":");
      if (segments[segments.length - 1] !== "h-screen") {
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
  loadingText,
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
  const docRef = useRef<Document | null>(null);
  const updateHeightRef = useRef<() => void>(() => {});
  const [height, setHeight] = useState(480);
  const lastSandboxInteractionTimeRef = useRef(0);
  const [resetToken, setResetToken] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [, setIsSandboxVendorReady] = useState(true);
  const shouldInjectSandboxVendor = type === "sandbox";

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
  const normalizedHtmlContent = React.useMemo(
    () =>
      replaceRootScreenHeightWithFullClass(
        htmlContent,
        replaceRootScreenHeightWithFull
      ),
    [htmlContent, replaceRootScreenHeightWithFull]
  );
  const completeImageSources = React.useMemo(
    () => extractCompleteImageSources(normalizedHtmlContent),
    [normalizedHtmlContent]
  );
  const shouldStretchRootHeight = React.useMemo(
    () =>
      replaceRootScreenHeightWithFull && hasRootScreenHeightClass(htmlContent),
    [htmlContent, replaceRootScreenHeightWithFull]
  );
  const [renderHtmlContent, setRenderHtmlContent] = useState(
    normalizedHtmlContent
  );
  const prevIncomingHtmlRef = useRef(normalizedHtmlContent);
  const pendingHtmlRef = useRef(normalizedHtmlContent);
  const deferRenderTimerRef = useRef<number | null>(null);
  const initialPaintFrameRef = useRef<number | null>(null);
  const initialPaintCommitFrameRef = useRef<number | null>(null);
  const imagePreloadRequestIdRef = useRef(0);

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
    if (initialPaintCommitFrameRef.current !== null) {
      window.cancelAnimationFrame(initialPaintCommitFrameRef.current);
      initialPaintCommitFrameRef.current = null;
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
    void preloadSandboxImages(completeImageSources);
  }, [completeImageSources]);

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
    const hasPendingImagePreload =
      isAppendOnlyStream &&
      containsCompleteImage &&
      completeImageSources.some(
        (source) => !SANDBOX_IMAGE_READY_CACHE.has(source)
      );
    const shouldDeferRender = isAppendOnlyStream && containsCompleteImage;

    pendingHtmlRef.current = normalizedHtmlContent;
    clearDeferredRenderTimer();

    if (hasPendingImagePreload) {
      const requestId = imagePreloadRequestIdRef.current + 1;
      imagePreloadRequestIdRef.current = requestId;

      void preloadSandboxImages(completeImageSources).then(() => {
        if (imagePreloadRequestIdRef.current !== requestId) {
          return;
        }

        setRenderHtmlContent(pendingHtmlRef.current);
      });
      return;
    }

    if (!shouldDeferRender) {
      setRenderHtmlContent(normalizedHtmlContent);
      return;
    }

    deferRenderTimerRef.current = window.setTimeout(() => {
      setRenderHtmlContent(pendingHtmlRef.current);
      deferRenderTimerRef.current = null;
    }, POST_IMAGE_STREAM_DEBOUNCE_MS);
  }, [completeImageSources, normalizedHtmlContent]);

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
  const sandboxViewportHeight =
    isBlackboardMode && type === "sandbox"
      ? shouldStretchRootHeight
        ? "100%"
        : (rootViewportHeightCss ?? `${height}px`)
      : undefined;
  const shouldShowHtmlFallbackWhilePreparingSandbox = false;
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
    if (!root) return;

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
        stretchRootHeight={shouldStretchRootHeight}
      />
    );

    initialPaintFrameRef.current = window.requestAnimationFrame(() => {
      updateHeightRef.current?.();
      initialPaintFrameRef.current = null;
    });
  }, [
    renderHtmlContent,
    loadingText,
    styleLoadingText,
    scriptLoadingText,
    fullScreenButtonText,
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

  const shouldShowSandboxLoading = false;

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
          {shouldShowHtmlFallbackWhilePreparingSandbox ? (
            <div
              aria-hidden
              className="absolute inset-0 z-10 overflow-hidden"
              style={{
                height: sandboxViewportHeight ?? "100%",
                minHeight: sandboxViewportHeight,
              }}
            >
              <div
                className="h-full w-full"
                dangerouslySetInnerHTML={{ __html: renderHtmlContent }}
              />
            </div>
          ) : null}
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
