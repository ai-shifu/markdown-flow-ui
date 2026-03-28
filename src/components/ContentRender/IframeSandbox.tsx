import React, { useCallback, useEffect, useRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import SandboxApp from "./SandboxApp";
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

const loadBlackboardVendorOnDemandWithMetrics = () => {
  const loadStart = performance.now();
  const startedAt = new Date().toISOString();
  console.log("[IframeSandbox][SandboxLoad] start", { startedAt });

  return loadBlackboardVendor()
    .then((inject) => {
      console.log("[IframeSandbox][SandboxLoad] done", {
        startedAt,
        endedAt: new Date().toISOString(),
        durationMs: Number((performance.now() - loadStart).toFixed(2)),
      });
      return inject;
    })
    .catch((error) => {
      console.error("[IframeSandbox][SandboxLoad] failed", {
        startedAt,
        endedAt: new Date().toISOString(),
        durationMs: Number((performance.now() - loadStart).toFixed(2)),
        error,
      });
      throw error;
    });
};

const COMPLETE_IMAGE_TAG_PATTERN = /<img\b[^>]*>/i;
const POST_IMAGE_STREAM_DEBOUNCE_MS = 180;
const SANDBOX_INTERACTION_THROTTLE_MS = 240;

interface SandboxHeightMeta {
  viewportHeightCss: string | null;
  hasFullViewportHeight: boolean;
}

interface SandboxRenderState {
  html: string;
  heightMeta: SandboxHeightMeta;
}

const EMPTY_SANDBOX_HEIGHT_META: SandboxHeightMeta = {
  viewportHeightCss: null,
  hasFullViewportHeight: false,
};

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
    normalizedTokens.includes("h-dvh") ||
    normalizedTokens.includes("min-h-screen") ||
    normalizedTokens.includes("min-h-dvh")
  ) {
    return "100dvh";
  }
  if (
    normalizedTokens.includes("h-svh") ||
    normalizedTokens.includes("min-h-svh")
  ) {
    return "100svh";
  }
  if (
    normalizedTokens.includes("h-lvh") ||
    normalizedTokens.includes("min-h-lvh")
  ) {
    return "100lvh";
  }
  const arbitraryToken = normalizedTokens.find((token) =>
    /^(h|min-h)-\[[0-9.]+(vh|dvh|svh|lvh)\]$/i.test(token)
  );
  if (!arbitraryToken) return null;
  const matched = arbitraryToken.match(
    /^(h|min-h)-\[([0-9.]+)(vh|dvh|svh|lvh)\]$/i
  );
  if (!matched) return null;
  return `${matched[2]}${matched[3].toLowerCase()}`;
};

const SANDBOX_IGNORED_TAG_NAMES = new Set([
  "base",
  "link",
  "meta",
  "script",
  "style",
  "template",
  "title",
]);

const isSandboxRenderableElement = (element: Element) =>
  !SANDBOX_IGNORED_TAG_NAMES.has(element.tagName.toLowerCase());

const getFirstRenderableElementChild = (root: ParentNode) =>
  Array.from(root.childNodes).find(
    (node): node is HTMLElement =>
      node.nodeType === Node.ELEMENT_NODE &&
      isSandboxRenderableElement(node as HTMLElement)
  ) || null;

const getInspectableSandboxElementChain = (root: ParentNode) => {
  const chain: HTMLElement[] = [];
  let current = getFirstRenderableElementChild(root);

  while (current) {
    chain.push(current);

    const childElements = Array.from(current.children).filter(
      (element): element is HTMLElement => isSandboxRenderableElement(element)
    );

    if (childElements.length !== 1) {
      break;
    }

    current = childElements[0];
  }

  return chain;
};

const extractViewportHeightFromElement = (element: HTMLElement) => {
  const heightAttrValue = element.getAttribute("height");
  const attrViewportHeight = heightAttrValue
    ? parseViewportHeightCss(heightAttrValue)
    : null;

  if (attrViewportHeight) {
    return attrViewportHeight;
  }

  const styleHeightValue =
    element.getAttribute("style")?.match(/\bheight\s*:\s*([^;]+)/i)?.[1] ||
    null;
  const styleViewportHeight = styleHeightValue
    ? parseViewportHeightCss(styleHeightValue)
    : null;

  if (styleViewportHeight) {
    return styleViewportHeight;
  }

  return extractViewportHeightFromTailwindClass(
    element.getAttribute("class") || ""
  );
};

const isFullViewportHeightCss = (value: string | null) =>
  value === "100vh" ||
  value === "100dvh" ||
  value === "100svh" ||
  value === "100lvh";

const inspectSandboxPrimaryHeight = (root: ParentNode): SandboxHeightMeta => {
  const inspectableElements = getInspectableSandboxElementChain(root);
  let viewportHeightCss: string | null = null;
  let hasFullViewportHeight = false;

  inspectableElements.forEach((element) => {
    const elementViewportHeight = extractViewportHeightFromElement(element);

    if (!viewportHeightCss && elementViewportHeight) {
      viewportHeightCss = elementViewportHeight;
    }

    if (isFullViewportHeightCss(elementViewportHeight)) {
      hasFullViewportHeight = true;
    }
  });

  return {
    viewportHeightCss,
    hasFullViewportHeight,
  };
};

const inspectRootHeightFromHtmlString = (html: string) => {
  const normalized = html.trim();

  if (!normalized) {
    return {
      viewportHeightCss: null,
      hasFullViewportHeight: false,
    };
  }

  const rootMatch = normalized.match(/^<([a-zA-Z][\w:-]*)(\s[^>]*?)?>/);
  const attrs = rootMatch?.[2] || "";
  const heightAttrValue = attrs.match(/\bheight\s*=\s*["']([^"']+)["']/i)?.[1];
  const styleAttrValue = attrs.match(/\bstyle\s*=\s*["']([^"']+)["']/i)?.[1];
  const styleHeightValue = styleAttrValue?.match(
    /\bheight\s*:\s*([^;]+)/i
  )?.[1];
  const classAttrValue = attrs.match(/\bclass\s*=\s*["']([^"']+)["']/i)?.[1];
  const viewportHeightCss =
    (heightAttrValue ? parseViewportHeightCss(heightAttrValue) : null) ||
    (styleHeightValue ? parseViewportHeightCss(styleHeightValue) : null) ||
    (classAttrValue
      ? extractViewportHeightFromTailwindClass(classAttrValue)
      : null);

  return {
    viewportHeightCss,
    hasFullViewportHeight: isFullViewportHeightCss(viewportHeightCss),
  };
};

const inspectSandboxPrimaryHeightFromHtml = (html: string) => {
  const normalized = html.trim();

  if (!normalized) {
    return EMPTY_SANDBOX_HEIGHT_META;
  }

  if (typeof document === "undefined") {
    return inspectRootHeightFromHtmlString(normalized);
  }

  const template = document.createElement("template");
  template.innerHTML = normalized;

  return inspectSandboxPrimaryHeight(template.content);
};

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
  const prevHtmlRef = useRef<string>("");
  const htmlContent = React.useMemo(
    () => (type === "sandbox" ? content : ""),
    [content, type]
  );
  const normalizedHtmlContent = React.useMemo(
    () =>
      replaceRootScreenHeightWithFullClass(
        htmlContent,
        replaceRootScreenHeightWithFull
      ),
    [htmlContent, replaceRootScreenHeightWithFull]
  );
  const originalHtmlHeightMeta = React.useMemo(
    () => inspectSandboxPrimaryHeightFromHtml(htmlContent),
    [htmlContent]
  );
  const normalizedHtmlHeightMeta = React.useMemo(
    () => inspectSandboxPrimaryHeightFromHtml(normalizedHtmlContent),
    [normalizedHtmlContent]
  );
  const shouldStretchRootHeight = React.useMemo(
    () =>
      replaceRootScreenHeightWithFull &&
      originalHtmlHeightMeta.hasFullViewportHeight,
    [
      originalHtmlHeightMeta.hasFullViewportHeight,
      replaceRootScreenHeightWithFull,
    ]
  );
  const [renderState, setRenderState] = useState<SandboxRenderState>(() => ({
    html: normalizedHtmlContent,
    heightMeta: normalizedHtmlHeightMeta,
  }));
  const prevIncomingHtmlRef = useRef(normalizedHtmlContent);
  const pendingRenderStateRef = useRef<SandboxRenderState>({
    html: normalizedHtmlContent,
    heightMeta: normalizedHtmlHeightMeta,
  });
  const deferRenderTimerRef = useRef<number | null>(null);
  const initialPaintFrameRef = useRef<number | null>(null);
  const renderViewportHeightCssRef = useRef<string | null>(
    normalizedHtmlHeightMeta.viewportHeightCss
  );

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
    renderViewportHeightCssRef.current =
      renderState.heightMeta.viewportHeightCss;
  }, [renderState.heightMeta.viewportHeightCss]);

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

    const nextRenderState = {
      html: normalizedHtmlContent,
      heightMeta: normalizedHtmlHeightMeta,
    };
    pendingRenderStateRef.current = nextRenderState;
    clearDeferredRenderTimer();

    if (!shouldDeferRender) {
      setRenderState(nextRenderState);
      return;
    }

    deferRenderTimerRef.current = window.setTimeout(() => {
      setRenderState(pendingRenderStateRef.current);
      deferRenderTimerRef.current = null;
    }, POST_IMAGE_STREAM_DEBOUNCE_MS);
  }, [normalizedHtmlContent, normalizedHtmlHeightMeta]);

  const renderHtmlContent = renderState.html;
  const rootViewportHeightCss = renderState.heightMeta.viewportHeightCss;
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

      const { viewportHeightCss } = inspectSandboxPrimaryHeight(doc.body);
      const runtimeParsed = viewportHeightCss
        ? parseExplicitHeight(viewportHeightCss, parentViewportHeight)
        : null;

      if (runtimeParsed !== null) {
        return Math.ceil(runtimeParsed);
      }

      const wrapper = doc.body.querySelector(
        ".sandbox-wrapper"
      ) as HTMLElement | null;
      const target = wrapper?.querySelector(
        ".sandbox-container > *"
      ) as HTMLElement | null;

      if (!target) return null;

      const heightValue = target.style.height || target.getAttribute("height");
      const explicitPixelHeight = heightValue
        ? parseExplicitHeight(heightValue, parentViewportHeight)
        : null;

      if (explicitPixelHeight !== null) {
        return Math.ceil(explicitPixelHeight);
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

    if (shouldInjectSandboxVendor) {
      // Inject Tailwind/DaisyUI/GSAP before rendering sandbox content to avoid FOUC.
      loadBlackboardVendorOnDemandWithMetrics()
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
