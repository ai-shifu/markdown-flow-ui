import React, { useEffect, useRef, useState } from "react";
import LoadingOverlayCard from "../ui/loading-overlay-card";
import type { ScalingWindow } from "./utils/iframe-scaling";

export interface SandboxAppProps {
  html: string;
  styleLoadingText?: string;
  scriptLoadingText?: string;
  resetToken?: number;
  mode?: "content" | "blackboard";
  hasRootVhHeight?: boolean;
  stretchRootHeight?: boolean;
  enableScaling?: boolean;
  disableLoadingOverlay?: boolean;
}

const IMAGE_REUSE_ATTRIBUTES = [
  "src",
  "srcset",
  "sizes",
  "alt",
  "class",
  "width",
  "height",
  "style",
  "loading",
  "decoding",
  "crossorigin",
  "referrerpolicy",
  "fetchpriority",
];

const getImageReuseKey = (image: HTMLImageElement) =>
  IMAGE_REUSE_ATTRIBUTES.map(
    (attribute) => `${attribute}:${image.getAttribute(attribute) || ""}`
  ).join("|");

const collectReusableImages = (root: ParentNode) => {
  const imageMap = new Map<string, HTMLImageElement[]>();
  root.querySelectorAll("img").forEach((node) => {
    const image = node as HTMLImageElement;
    const key = getImageReuseKey(image);
    const bucket = imageMap.get(key) || [];
    bucket.push(image);
    imageMap.set(key, bucket);
  });
  return imageMap;
};

const syncImageAttributes = (
  sourceImage: HTMLImageElement,
  targetImage: HTMLImageElement
) => {
  const sourceAttributes = Array.from(sourceImage.attributes);
  const sourceAttributeNames = new Set(
    sourceAttributes.map((attribute) => attribute.name)
  );

  Array.from(targetImage.attributes).forEach((attribute) => {
    if (!sourceAttributeNames.has(attribute.name)) {
      targetImage.removeAttribute(attribute.name);
    }
  });

  sourceAttributes.forEach((attribute) => {
    targetImage.setAttribute(attribute.name, attribute.value);
  });
};

const reuseRenderedImages = (
  root: ParentNode,
  imageMap: Map<string, HTMLImageElement[]>
) => {
  if (!imageMap.size) return;

  root.querySelectorAll("img").forEach((node) => {
    const nextImage = node as HTMLImageElement;
    const key = getImageReuseKey(nextImage);
    const bucket = imageMap.get(key);
    const preservedImage = bucket?.shift();
    if (!preservedImage) return;

    syncImageAttributes(nextImage, preservedImage);
    nextImage.replaceWith(preservedImage);

    if (bucket && bucket.length === 0) {
      imageMap.delete(key);
    }
  });
};

const SandboxApp: React.FC<SandboxAppProps> = ({
  html,
  styleLoadingText,
  scriptLoadingText,
  resetToken = 0,
  mode = "content",
  hasRootVhHeight = false,
  stretchRootHeight = false,
  enableScaling = false,
  disableLoadingOverlay = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isGeneratingStyles, setIsGeneratingStyles] = useState(false);
  const [isGeneratingScripts, setIsGeneratingScripts] = useState(false);
  const appendedStylesRef = useRef<HTMLStyleElement[]>([]);
  const appendedScriptsRef = useRef<HTMLScriptElement[]>([]);
  const styleStartRef = useRef(0);
  const scriptStartRef = useRef(0);
  const styleTimerRef = useRef<number | null>(null);
  const scriptTimerRef = useRef<number | null>(null);
  const hasStylesRef = useRef(false);
  const hasScriptsRef = useRef(false);
  const hasRenderedContentRef = useRef(false);
  const prevResetTokenRef = useRef(resetToken);
  const MIN_LOADING_MS = 200;

  const clearTimer = (timerRef: React.MutableRefObject<number | null>) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const settleStateWithMinimumDelay = (
    setter: React.Dispatch<React.SetStateAction<boolean>>,
    timerRef: React.MutableRefObject<number | null>,
    startRef: React.MutableRefObject<number>,
    onDone?: () => void
  ) => {
    const elapsed = performance.now() - startRef.current;
    const delay = Math.max(0, MIN_LOADING_MS - elapsed);
    clearTimer(timerRef);
    timerRef.current = window.setTimeout(() => {
      setter(false);
      onDone?.();
      timerRef.current = null;
    }, delay);
  };

  useEffect(() => {
    const doc = containerRef.current?.ownerDocument;
    if (!doc) return;
    const styleId = "sandbox-spinner-style";
    let styleEl = doc.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = doc.createElement("style");
      styleEl.id = styleId;
      doc.head?.appendChild(styleEl);
    }
    styleEl.textContent = `
      .sandbox-wrapper { align-items: center; }
      .sandbox-container { position: relative; width: 100%; }
      .sandbox-container svg,
      .sandbox-container img { display: block; margin-left: auto; margin-right: auto; }
      /* Sub-pixel rounding (clamp() font-size + fractional flex children) can push
         scrollHeight 1px past clientHeight, producing a phantom scrollbar on a root
         that visually fits. The user content root inside .sandbox-container should
         never render its own scrollbar; the iframe boundary handles overflow. */
      .sandbox-container > * { overflow: clip !important; }
      .justify-\\[safe_center\\]{
        justify-content: safe center;
      }
      .overflow-y-auto { overflow-y: visible !important; }
    `;
  }, []);

  useEffect(() => {
    if (resetToken !== prevResetTokenRef.current) {
      hasRenderedContentRef.current = false;
      prevResetTokenRef.current = resetToken;
    }
    clearTimer(styleTimerRef);
    clearTimer(scriptTimerRef);
    hasStylesRef.current = false;
    hasScriptsRef.current = false;

    const container = containerRef.current;
    if (!container) return;
    const doc = container.ownerDocument;
    const body = doc?.body;
    if (!body) return;
    const reusableImages = collectReusableImages(container);

    appendedStylesRef.current.forEach((node) => node.remove());
    appendedStylesRef.current = [];
    appendedScriptsRef.current.forEach((node) => node.remove());
    appendedScriptsRef.current = [];

    // const hasRenderedBefore = hasRenderedContentRef.current;
    setIsGeneratingStyles(false);
    setIsGeneratingScripts(false);
    const wrapper = doc.createElement("div");
    wrapper.innerHTML = html;

    const openScriptCount = (html.match(/<script[\s>]/gi) || []).length;
    const closeScriptCount = (html.match(/<\/script>/gi) || []).length;
    const shouldExecuteScripts =
      openScriptCount > 0 && openScriptCount === closeScriptCount;

    const resourceQueue: HTMLElement[] = [];

    Array.from(wrapper.querySelectorAll("style, script")).forEach((node) => {
      if (node.tagName.toLowerCase() === "style") {
        const cloned = doc.createElement("style");
        cloned.textContent = node.textContent || "";
        Array.from(node.attributes).forEach((attr) => {
          cloned.setAttribute(attr.name, attr.value);
        });
        resourceQueue.push(cloned);
      } else {
        const replacement = doc.createElement("script");
        Array.from(node.attributes).forEach((attr) => {
          replacement.setAttribute(attr.name, attr.value);
        });
        replacement.textContent = node.textContent || "";
        resourceQueue.push(replacement);
      }
      node.remove();
    });
    reuseRenderedImages(wrapper, reusableImages);

    const hasStyles = resourceQueue.some(
      (node) => node.tagName.toLowerCase() === "style"
    );
    const hasScripts = resourceQueue.some(
      (node) => node.tagName.toLowerCase() === "script"
    );
    if (hasStyles) {
      hasStylesRef.current = true;
      styleStartRef.current = performance.now();
      clearTimer(styleTimerRef);
      setIsGeneratingStyles(true);
    }
    if (hasScripts) {
      hasScriptsRef.current = true;
      scriptStartRef.current = performance.now();
      clearTimer(scriptTimerRef);
      setIsGeneratingScripts(true);
    }

    const hasFirstElement = !!wrapper.firstElementChild;
    if (hasFirstElement) {
      hasRenderedContentRef.current = true;
    }

    const contentNodes = Array.from(wrapper.childNodes);
    container.replaceChildren(...contentNodes);

    resourceQueue.forEach((node) => {
      if (node.tagName.toLowerCase() === "style") {
        doc.head?.appendChild(node);
        appendedStylesRef.current.push(node as HTMLStyleElement);
        return;
      }

      if (shouldExecuteScripts) {
        const scriptNode = node as HTMLScriptElement;
        const scriptText = scriptNode.textContent || "";
        const shouldValidate = !scriptNode.src;

        if (shouldValidate) {
          try {
            // Validate script is syntactically complete before executing

            new Function(scriptText);
          } catch {
            scriptNode.remove();
            return;
          }
        }

        try {
          body.appendChild(scriptNode);
          appendedScriptsRef.current.push(scriptNode);
        } catch {
          scriptNode.remove();
        }
      } else {
        // Defer execution until all script tags are fully received
        node.remove();
      }
    });
    if (enableScaling) {
      const win = container.ownerDocument?.defaultView as ScalingWindow | null;
      win?.__mdf_triggerFitContent?.();
    }

    requestAnimationFrame(() => {
      if (hasStyles) {
        settleStateWithMinimumDelay(
          setIsGeneratingStyles,
          styleTimerRef,
          styleStartRef,
          () => {
            hasStylesRef.current = false;
          }
        );
      }
      if (hasScripts) {
        settleStateWithMinimumDelay(
          setIsGeneratingScripts,
          scriptTimerRef,
          scriptStartRef,
          () => {
            hasScriptsRef.current = false;
          }
        );
      }
    });
  }, [html, resetToken, enableScaling]);

  useEffect(
    () => () => {
      clearTimer(styleTimerRef);
      clearTimer(scriptTimerRef);
    },
    []
  );

  useEffect(() => {
    if (!disableLoadingOverlay) {
      return;
    }

    clearTimer(styleTimerRef);
    clearTimer(scriptTimerRef);
    hasStylesRef.current = false;
    hasScriptsRef.current = false;
    setIsGeneratingStyles(false);
    setIsGeneratingScripts(false);
  }, [disableLoadingOverlay]);

  const overlayMessage = (() => {
    if (disableLoadingOverlay) {
      return null;
    }

    if (isGeneratingScripts || hasScriptsRef.current)
      return scriptLoadingText || "Building scripts cache...";
    if (isGeneratingStyles || hasStylesRef.current)
      return styleLoadingText || "Building styles...";
    return null;
  })();

  const isBlackboard = mode === "blackboard";
  const shouldStretchRootHeight = isBlackboard && stretchRootHeight;
  const sandboxWrapperStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    // Keep blackboard scroll behavior while centering content in non-blackboard mode
    justifyContent: shouldStretchRootHeight
      ? "flex-start"
      : isBlackboard
        ? "space-around"
        : "flex-start",
  };
  const sandboxContainerStyle: React.CSSProperties = {
    pointerEvents: overlayMessage ? "none" : undefined,
    margin: isBlackboard ? undefined : "auto 0",
    width: "100%",
    height: shouldStretchRootHeight ? "100%" : undefined,
    minHeight: shouldStretchRootHeight ? 0 : undefined,
    flex: shouldStretchRootHeight ? "1 1 auto" : undefined,
  };

  return (
    <div
      data-root-vh={hasRootVhHeight ? "true" : "false"}
      className="sandbox-wrapper"
      style={sandboxWrapperStyle}
      aria-busy={!!overlayMessage}
    >
      <div
        ref={containerRef}
        className="sandbox-container"
        style={sandboxContainerStyle}
      />
      {overlayMessage && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <LoadingOverlayCard message={overlayMessage} />
        </div>
      )}
    </div>
  );
};

export default SandboxApp;
