import React, { useCallback, useEffect, useLayoutEffect, useRef } from "react";

import { cn } from "../../lib/utils";
import {
  fitPresentationFontSize,
  resolvePresentationBaseFontSize,
} from "../ContentRender/utils/presentation-scaling";
import type { MarkdownScalingMode } from "./utils/markdownScaling";

const SLIDE_FONT_SIZE_PROPERTY = "--mdf-slide-font-size";
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export interface MarkdownSlideScalingProps
  extends React.ComponentPropsWithoutRef<"div"> {
  mode: MarkdownScalingMode;
}

/**
 * Fits all Markdown elements in one logical slide with a shared font-size.
 * Keeping this boundary outside ContentRender lets accumulated title, text,
 * table, and code elements participate in the same presentation layout.
 */
const MarkdownSlideScaling: React.FC<MarkdownSlideScalingProps> = ({
  children,
  className,
  mode,
  ...props
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const fitFrameRef = useRef<number | null>(null);
  const isFittingRef = useRef(false);

  const fitContent = useCallback(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;

    if (mode === "disabled" || !viewport || !content || isFittingRef.current) {
      return;
    }

    const viewportSize = {
      height: viewport.clientHeight,
      width: viewport.clientWidth,
    };

    if (viewportSize.height <= 0 || viewportSize.width <= 0) {
      return;
    }

    isFittingRef.current = true;

    try {
      const fontSize =
        mode === "fit"
          ? fitPresentationFontSize({
              viewport: viewportSize,
              measure: (candidateFontSize) => {
                content.style.setProperty(
                  SLIDE_FONT_SIZE_PROPERTY,
                  `${candidateFontSize}px`
                );

                // Read after the CSS variable update so wrapping and em-based
                // styles are included in the next compression step.
                return {
                  height: content.scrollHeight,
                  width: content.scrollWidth,
                };
              },
            })
          : resolvePresentationBaseFontSize(viewportSize);

      content.style.setProperty(SLIDE_FONT_SIZE_PROPERTY, `${fontSize}px`);
      content.dataset.markdownSlideFontSize = String(fontSize);
    } finally {
      isFittingRef.current = false;
    }
  }, [mode]);

  const scheduleFit = useCallback(() => {
    if (mode === "disabled" || fitFrameRef.current !== null) {
      return;
    }

    fitFrameRef.current = window.requestAnimationFrame(() => {
      fitFrameRef.current = null;
      fitContent();
    });
  }, [fitContent, mode]);

  useIsomorphicLayoutEffect(() => {
    const content = contentRef.current;

    if (!content) {
      return;
    }

    if (mode === "disabled") {
      content.style.removeProperty(SLIDE_FONT_SIZE_PROPERTY);
      delete content.dataset.markdownSlideFontSize;
      return;
    }

    fitContent();
  }, [fitContent, mode]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;

    if (mode === "disabled" || !viewport || !content) {
      return;
    }

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(scheduleFit);
    resizeObserver?.observe(viewport);

    const mutationObserver =
      mode === "fit" && typeof MutationObserver !== "undefined"
        ? new MutationObserver(scheduleFit)
        : null;

    if (mode === "fit") {
      resizeObserver?.observe(content);
      mutationObserver?.observe(content, {
        childList: true,
        characterData: true,
        subtree: true,
      });
      content.addEventListener("load", scheduleFit, true);
    }

    window.addEventListener("resize", scheduleFit);
    scheduleFit();

    return () => {
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();

      if (mode === "fit") {
        content.removeEventListener("load", scheduleFit, true);
      }

      window.removeEventListener("resize", scheduleFit);

      if (fitFrameRef.current !== null) {
        window.cancelAnimationFrame(fitFrameRef.current);
        fitFrameRef.current = null;
      }
    };
  }, [mode, scheduleFit]);

  const isScaling = mode !== "disabled";

  return (
    <div
      ref={viewportRef}
      className={cn(className, isScaling && "slide-markdown-scaling")}
      data-markdown-slide-scaling={isScaling ? mode : undefined}
      {...props}
    >
      <div
        ref={contentRef}
        className={cn(
          "slide-markdown-scaling__content flex w-full flex-col gap-4",
          mode !== "fit" && "slide-markdown-scaling__content--contents"
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default MarkdownSlideScaling;
