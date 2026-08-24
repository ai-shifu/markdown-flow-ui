import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

export type ScrollBehavior = "smooth" | "auto";
export type ScrollTarget = HTMLElement | Document | Window;
export type ScrollTargetRef = RefObject<ScrollTarget | null>;

export interface UseScrollToBottomOptions {
  contentRef?: RefObject<HTMLElement | null>;
  scrollTarget?: ScrollTarget | ScrollTargetRef | null;
  scrollThreshold?: number;
  contentVersion?: unknown;
  followNewContent?: boolean;
  autoScrollOnInit?: boolean;
  behavior?: ScrollBehavior;
}

export interface UseScrollToBottomReturn {
  showScrollToBottom: boolean;
  isAtBottom: boolean;
  followNewContent: boolean;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  refresh: () => void;
}

const isWindow = (target: ScrollTarget): target is Window =>
  typeof Window !== "undefined" && target instanceof Window;

const isDocument = (target: ScrollTarget): target is Document =>
  typeof Document !== "undefined" && target instanceof Document;

const getDocumentScroller = (target: Document | Window): HTMLElement | null => {
  const document = isWindow(target) ? target.document : target;
  return (document.scrollingElement || document.documentElement) as HTMLElement;
};

export const getScrollMetrics = (target: ScrollTarget) => {
  if (isWindow(target) || isDocument(target)) {
    const scroller = getDocumentScroller(target);
    const viewportHeight = isWindow(target)
      ? target.innerHeight
      : scroller?.clientHeight || 0;
    return {
      scrollTop: scroller?.scrollTop || 0,
      scrollHeight: scroller?.scrollHeight || 0,
      clientHeight: viewportHeight,
    };
  }
  return {
    scrollTop: target.scrollTop,
    scrollHeight: target.scrollHeight,
    clientHeight: target.clientHeight,
  };
};

const scrollTargetValue = (
  target: ScrollTarget | ScrollTargetRef | null | undefined
): ScrollTarget | null => {
  if (!target) return null;
  return "current" in target ? target.current : target;
};

const isScrollable = (element: HTMLElement) => {
  const style =
    typeof window !== "undefined" ? window.getComputedStyle(element) : null;
  const overflow = style?.overflowY || style?.overflow;
  return element.scrollHeight > element.clientHeight && overflow !== "visible";
};

export const resolveScrollTarget = (
  contentRef: RefObject<HTMLElement | null> | undefined,
  explicitTarget: ScrollTarget | ScrollTargetRef | null | undefined
): ScrollTarget | null => {
  const explicit = scrollTargetValue(explicitTarget);
  if (explicit) return explicit;
  const content = contentRef?.current;
  if (!content) return null;
  if (isScrollable(content)) return content;
  let parent = content.parentElement;
  while (parent) {
    if (isScrollable(parent)) return parent;
    parent = parent.parentElement;
  }
  return typeof window !== "undefined" ? window : null;
};

export const useScrollToBottom = (
  containerRef: RefObject<HTMLElement | null>,
  options: UseScrollToBottomOptions = {}
): UseScrollToBottomReturn => {
  const {
    contentRef = containerRef,
    scrollTarget,
    scrollThreshold = 150,
    contentVersion,
    followNewContent: followNewContentOption = true,
    autoScrollOnInit = false,
    behavior = "smooth",
  } = options;
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const followingRef = useRef(followNewContentOption);
  const mountedRef = useRef(false);
  const frameRef = useRef<number | null>(null);

  const refresh = useCallback(() => {
    const target = resolveScrollTarget(contentRef, scrollTarget);
    if (!target) return;
    const { scrollTop, scrollHeight, clientHeight } = getScrollMetrics(target);
    const atBottom = scrollTop + clientHeight >= scrollHeight - scrollThreshold;
    setIsAtBottom(atBottom);
    setShowScrollToBottom(!atBottom && scrollHeight > clientHeight);
    if (atBottom) followingRef.current = true;
  }, [contentRef, scrollTarget, scrollThreshold]);

  const scrollToBottom = useCallback(
    (requestedBehavior: ScrollBehavior = behavior) => {
      const target = resolveScrollTarget(contentRef, scrollTarget);
      if (!target) return;
      const reducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const actualBehavior =
        requestedBehavior === "smooth" && reducedMotion
          ? "auto"
          : requestedBehavior;
      const top = getScrollMetrics(target).scrollHeight;
      if (isWindow(target)) {
        target.scrollTo({ top, behavior: actualBehavior });
      } else if (isDocument(target)) {
        getDocumentScroller(target)?.scrollTo({
          top,
          behavior: actualBehavior,
        });
      } else {
        target.scrollTo({ top, behavior: actualBehavior });
      }
      followingRef.current = true;
      setIsAtBottom(true);
      setShowScrollToBottom(false);
    },
    [behavior, contentRef, scrollTarget]
  );

  useEffect(() => {
    const target = resolveScrollTarget(contentRef, scrollTarget);
    if (!target) return;
    const handleScroll = () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        const metrics = getScrollMetrics(target);
        if (
          metrics.scrollTop + metrics.clientHeight <
          metrics.scrollHeight - scrollThreshold
        ) {
          followingRef.current = false;
        }
        refresh();
      });
    };
    const handleResize = () => handleScroll();
    target.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(handleResize)
        : null;
    if (contentRef.current) observer?.observe(contentRef.current);
    if (
      typeof Element !== "undefined" &&
      target instanceof Element &&
      target !== contentRef.current
    ) {
      observer?.observe(target);
    }
    refresh();
    return () => {
      target.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      observer?.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [contentRef, refresh, scrollTarget, scrollThreshold]);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      if (autoScrollOnInit) scrollToBottom("auto");
      return;
    }
    if (followingRef.current) {
      const frame = requestAnimationFrame(() => scrollToBottom("auto"));
      return () => cancelAnimationFrame(frame);
    }
    refresh();
  }, [autoScrollOnInit, contentVersion, refresh, scrollToBottom]);

  useEffect(() => {
    followingRef.current = followNewContentOption;
  }, [followNewContentOption]);

  return {
    showScrollToBottom,
    isAtBottom,
    followNewContent: followingRef.current,
    scrollToBottom,
    refresh,
  };
};

export default useScrollToBottom;
