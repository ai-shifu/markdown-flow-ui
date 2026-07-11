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

interface MarkdownFitSnapshot {
  contentHeight: number;
  contentWidth: number;
  mode: MarkdownScalingMode;
  viewportHeight: number;
  viewportWidth: number;
}

const areFitSnapshotsEqual = (
  left: MarkdownFitSnapshot,
  right: MarkdownFitSnapshot
) =>
  left.contentHeight === right.contentHeight &&
  left.contentWidth === right.contentWidth &&
  left.mode === right.mode &&
  left.viewportHeight === right.viewportHeight &&
  left.viewportWidth === right.viewportWidth;

export interface MarkdownSlideScalingProps
  extends React.ComponentPropsWithoutRef<"div"> {
  /** Controls whether Markdown content is fitted, base-scaled, or unscaled. */
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
  const lastFitSnapshotRef = useRef<MarkdownFitSnapshot | null>(null);

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

    const currentSnapshot: MarkdownFitSnapshot = {
      contentHeight: content.scrollHeight,
      contentWidth: content.scrollWidth,
      mode,
      viewportHeight: viewportSize.height,
      viewportWidth: viewportSize.width,
    };
    const lastSnapshot = lastFitSnapshotRef.current;

    if (lastSnapshot && areFitSnapshotsEqual(lastSnapshot, currentSnapshot)) {
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
      lastFitSnapshotRef.current = {
        contentHeight: content.scrollHeight,
        contentWidth: content.scrollWidth,
        mode,
        viewportHeight: viewportSize.height,
        viewportWidth: viewportSize.width,
      };
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
    if (fitFrameRef.current !== null) {
      window.cancelAnimationFrame(fitFrameRef.current);
      fitFrameRef.current = null;
    }

    const content = contentRef.current;

    if (!content) {
      return;
    }

    if (mode === "disabled") {
      content.style.removeProperty(SLIDE_FONT_SIZE_PROPERTY);
      delete content.dataset.markdownSlideFontSize;
      lastFitSnapshotRef.current = null;
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

    const handleContentChange = () => {
      lastFitSnapshotRef.current = null;
      scheduleFit();
    };
    const mutationObserver =
      mode === "fit" && typeof MutationObserver !== "undefined"
        ? new MutationObserver(handleContentChange)
        : null;

    if (mode === "fit") {
      resizeObserver?.observe(content);
      mutationObserver?.observe(content, {
        childList: true,
        characterData: true,
        subtree: true,
      });
      content.addEventListener("load", handleContentChange, true);
    }

    window.addEventListener("resize", scheduleFit);
    scheduleFit();

    return () => {
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();

      if (mode === "fit") {
        content.removeEventListener("load", handleContentChange, true);
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
