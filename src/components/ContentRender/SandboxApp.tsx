import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

export interface SandboxAppProps {
  html: string;
  loadingText?: string;
  styleLoadingText?: string;
  scriptLoadingText?: string;
  fullScreenButtonText?: string;
}

const SandboxApp: React.FC<SandboxAppProps> = ({
  html,
  loadingText,
  styleLoadingText,
  scriptLoadingText,
  fullScreenButtonText,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isWaitingFirstDiv, setIsWaitingFirstDiv] = useState(true);
  const [isGeneratingStyles, setIsGeneratingStyles] = useState(false);
  const [isGeneratingScripts, setIsGeneratingScripts] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const appendedStylesRef = useRef<HTMLStyleElement[]>([]);
  const appendedScriptsRef = useRef<HTMLScriptElement[]>([]);
  const styleStartRef = useRef(0);
  const scriptStartRef = useRef(0);
  const styleTimerRef = useRef<number | null>(null);
  const scriptTimerRef = useRef<number | null>(null);
  const hasStylesRef = useRef(false);
  const hasScriptsRef = useRef(false);
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
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  useEffect(() => {
    clearTimer(styleTimerRef);
    clearTimer(scriptTimerRef);
    hasStylesRef.current = false;
    hasScriptsRef.current = false;
  }, [html]);

  useEffect(() => {
    const doc = containerRef.current?.ownerDocument;
    if (!doc) return;
    const styleId = "sandbox-spinner-style";
    let styleEl = doc.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = doc.createElement("style");
      styleEl.id = styleId;
      styleEl.textContent =
        "@keyframes sandbox-spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }";
      doc.head?.appendChild(styleEl);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const doc = container.ownerDocument;
    const body = doc?.body;
    if (!body) return;

    appendedStylesRef.current.forEach((node) => node.remove());
    appendedStylesRef.current = [];
    appendedScriptsRef.current.forEach((node) => node.remove());
    appendedScriptsRef.current = [];

    setIsWaitingFirstDiv(true);
    setIsGeneratingStyles(false);
    setIsGeneratingScripts(false);
    container.innerHTML = "";
    const wrapper = document.createElement("div");
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
    setIsWaitingFirstDiv(!hasFirstElement);

    const contentNodes = Array.from(wrapper.childNodes);
    container.append(...contentNodes);

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
  }, [html]);

  useEffect(
    () => () => {
      clearTimer(styleTimerRef);
      clearTimer(scriptTimerRef);
    },
    []
  );

  const overlayMessage = (() => {
    if (isGeneratingScripts || hasScriptsRef.current)
      return scriptLoadingText || "Building scripts cache...";
    if (isGeneratingStyles || hasStylesRef.current)
      return styleLoadingText || "Building styles...";
    if (isWaitingFirstDiv) return loadingText || "Loading...";
    return null;
  })();

  const handleToggleFullscreen = () => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    if (!document.fullscreenElement) {
      wrapper.requestFullscreen?.().catch(() => {});
      return;
    }
    document.exitFullscreen?.();
  };

  return (
    <div
      ref={wrapperRef}
      style={{ position: "relative", minHeight: 120 }}
      aria-busy={!!overlayMessage}
    >
      <div
        ref={containerRef}
        style={{
          pointerEvents: overlayMessage ? "none" : undefined,
        }}
      />
      <button
        type="button"
        onClick={handleToggleFullscreen}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 30,
          padding: "6px 10px",
          borderRadius: 6,
          border: "1px solid #cbd5e1",
          background: "#ffffffcc",
          color: "#0f172a",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 4px 10px rgba(15, 23, 42, 0.08)",
        }}
      >
        {isFullscreen
          ? fullScreenButtonText || "Exit Fullscreen"
          : fullScreenButtonText || "Fullscreen"}
      </button>
      {overlayMessage && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(51, 51, 51, 0.80)",
            color: "#ffffff",
            fontSize: 16,
            fontWeight: 700,
            gap: 10,
            pointerEvents: "auto",
            zIndex: 20,
          }}
        >
          <Loader2
            aria-hidden
            size={20}
            style={{ animation: "sandbox-spin 1s linear infinite" }}
          />
          {overlayMessage}
        </div>
      )}
    </div>
  );
};

export default SandboxApp;
