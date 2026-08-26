import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

export type ScrollBehavior = "smooth" | "auto";
export type PageScrollFallback = "auto" | "always" | "never";
export type ScrollTarget = HTMLElement | Document | Window;
export type ScrollTargetRef = RefObject<ScrollTarget | null>;
export type ScrollTargetResolver = () => ScrollTarget | null;
export type ScrollTargetInput =
  | ScrollTarget
  | ScrollTargetRef
  | ScrollTargetResolver
  | null;

export interface ScrollMetrics {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

export interface ScrollPresentation {
  distanceFromBottom: number;
  isAtBottom: boolean;
  isScrollable: boolean;
  showScrollToBottom: boolean;
}

export interface UseScrollToBottomOptions {
  /** Actual content box whose growth should be observed. Defaults to the viewport's first element child. */
  contentRef?: RefObject<HTMLElement | null>;
  /** Optional bottom anchor used to preserve nested-container scrollIntoView behavior. */
  endRef?: RefObject<HTMLElement | null>;
  /** Explicit scroll target or resolver. Unresolved targets stay inactive; omit to infer viewport, parent and page roots. */
  scrollTarget?: ScrollTargetInput;
  /** Whether page scrolling joins the viewport and parent targets. */
  pageScrollFallback?: PageScrollFallback;
  /** Near-bottom distance in pixels. Defaults to the strict 150px threshold. */
  scrollThreshold?: number;
  /** Optional refresh signal; DOM growth is observed without this prop. */
  contentVersion?: unknown;
  /** Follow growth while at the bottom, and pause after scrolling away. Defaults to true. */
  followNewContent?: boolean;
  /** Scroll to the end on the first mount. Defaults to false. */
  autoScrollOnInit?: boolean;
  /** User-triggered behavior. Auto and reduced-motion scrolling are immediate, regardless of host CSS. */
  behavior?: ScrollBehavior;
}

export interface UseScrollToBottomReturn {
  showScrollToBottom: boolean;
  isAtBottom: boolean;
  followNewContent: boolean;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  /** Backward-compatible click handler that ignores React event arguments. */
  handleUserScrollToBottom: () => void;
  refresh: () => void;
}

export interface LegacyUseScrollToBottomOptions
  extends UseScrollToBottomOptions {
  /** Retained for source compatibility; scrolling now follows browser frames and observers. */
  scrollDelay?: number;
}

const isWindow = (target: ScrollTarget): target is Window =>
  "window" in target && target.window === target;

const isDocument = (target: ScrollTarget): target is Document =>
  "nodeType" in target && target.nodeType === 9;

const getDocumentScroller = (target: Document | Window): HTMLElement | null => {
  const document = isWindow(target) ? target.document : target;
  return (document.scrollingElement || document.documentElement) as HTMLElement;
};

const getTargetWindow = (target: ScrollTarget): Window | null => {
  if (isWindow(target)) return target;
  if (isDocument(target)) return target.defaultView;
  return target.ownerDocument.defaultView;
};

export const getScrollMetrics = (target: ScrollTarget): ScrollMetrics => {
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

export const getScrollPresentation = (
  metrics: ScrollMetrics,
  threshold = 150
): ScrollPresentation => {
  const normalizedThreshold = Math.max(0, threshold);
  const isScrollable = metrics.scrollHeight > metrics.clientHeight;
  const distanceFromBottom = Math.max(
    0,
    metrics.scrollHeight - metrics.scrollTop - metrics.clientHeight
  );
  const isAtBottom =
    !isScrollable ||
    distanceFromBottom === 0 ||
    distanceFromBottom < normalizedThreshold;
  return {
    distanceFromBottom,
    isAtBottom,
    isScrollable,
    showScrollToBottom: isScrollable && !isAtBottom,
  };
};

export const getCombinedScrollPresentation = (
  metrics: ScrollMetrics[],
  threshold = 150
): ScrollPresentation => {
  const presentations = metrics.map((item) =>
    getScrollPresentation(item, threshold)
  );
  return {
    distanceFromBottom: Math.max(
      0,
      ...presentations.map((item) => item.distanceFromBottom)
    ),
    isAtBottom: presentations.every((item) => item.isAtBottom),
    isScrollable: presentations.some((item) => item.isScrollable),
    showScrollToBottom: presentations.some((item) => item.showScrollToBottom),
  };
};

export const resolveScrollBehavior = (
  requestedBehavior: ScrollBehavior,
  prefersReducedMotion: boolean
): ScrollBehavior =>
  requestedBehavior === "smooth" && prefersReducedMotion
    ? "auto"
    : requestedBehavior;

const scrollTargetValue = (
  target: ScrollTargetInput | undefined
): ScrollTarget | null => {
  if (!target) return null;
  if (typeof target === "function") return target();
  return "current" in target ? target.current : target;
};

const hasScrollableContent = (target: ScrollTarget) => {
  const { scrollHeight, clientHeight } = getScrollMetrics(target);
  return scrollHeight > clientHeight + 1;
};

const permitsElementScrolling = (target: HTMLElement) => {
  const overflowY =
    target.ownerDocument.defaultView?.getComputedStyle(target).overflowY;
  return ["auto", "scroll", "hidden", "overlay"].includes(overflowY ?? "");
};

export const resolveScrollTargets = (
  viewportRef: RefObject<HTMLElement | null> | undefined,
  explicitTarget: ScrollTargetInput | undefined,
  pageScrollFallback: PageScrollFallback = "auto"
): ScrollTarget[] => {
  const explicit = scrollTargetValue(explicitTarget);
  if (explicitTarget !== undefined) return explicit ? [explicit] : [];

  const viewport = viewportRef?.current;
  if (!viewport) {
    return pageScrollFallback !== "never" && typeof document !== "undefined"
      ? [document]
      : [];
  }

  const localTargets: ScrollTarget[] = [
    viewport,
    viewport.parentElement,
  ].filter(
    (target): target is HTMLElement =>
      target !== null && permitsElementScrolling(target)
  );

  const shouldUsePageScroll =
    pageScrollFallback === "always" ||
    (pageScrollFallback === "auto" && !localTargets.some(hasScrollableContent));
  if (shouldUsePageScroll) localTargets.push(viewport.ownerDocument);

  return localTargets;
};

export const resolveScrollTarget = (
  viewportRef: RefObject<HTMLElement | null> | undefined,
  explicitTarget: ScrollTargetInput | undefined
): ScrollTarget | null =>
  resolveScrollTargets(viewportRef, explicitTarget, "auto")[0] ?? null;

const resolveObservedContent = (
  viewportRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null> | undefined
) => {
  if (contentRef?.current) return contentRef.current;
  const viewport = viewportRef.current;
  return (viewport?.firstElementChild as HTMLElement | null) || viewport;
};

const sameTargets = (left: ScrollTarget[], right: ScrollTarget[]) =>
  left.length === right.length &&
  left.every((target, index) => target === right[index]);

const getScrollEventTarget = (target: ScrollTarget): EventTarget =>
  isDocument(target) ? target.defaultView || target : target;

const scrollTargetTo = (target: ScrollTarget, options: ScrollToOptions) => {
  if (isDocument(target)) getDocumentScroller(target)?.scrollTo(options);
  else target.scrollTo(options);
};

const isScrollInput = (event: Event) => {
  if (event.defaultPrevented) return false;
  if (event.type === "wheel") return (event as WheelEvent).deltaY !== 0;
  if (event.type === "pointerdown")
    return !((event as PointerEvent).button > 0);
  if (event.type !== "keydown") return true;
  const key = event as KeyboardEvent;
  if (key.ctrlKey || key.metaKey || key.altKey) return false;
  if (
    ![
      "ArrowUp",
      "ArrowDown",
      "PageUp",
      "PageDown",
      "Home",
      "End",
      " ",
    ].includes(key.key)
  )
    return false;
  const element = event.target as Element | null;
  if (
    element?.closest?.(
      'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]'
    )
  )
    return false;
  return (
    key.key !== " " || !element?.closest?.('button, a[href], [role="button"]')
  );
};

export function useScrollToBottom(
  viewportRef: RefObject<HTMLElement | null>,
  options?: UseScrollToBottomOptions
): UseScrollToBottomReturn;
export function useScrollToBottom(
  viewportRef: RefObject<HTMLElement | null>,
  dependencies?: readonly unknown[],
  options?: LegacyUseScrollToBottomOptions
): UseScrollToBottomReturn;
export function useScrollToBottom(
  viewportRef: RefObject<HTMLElement | null>,
  optionsOrDependencies?: UseScrollToBottomOptions | readonly unknown[],
  legacyOptions?: LegacyUseScrollToBottomOptions
): UseScrollToBottomReturn {
  const committedDependencies = useRef<readonly unknown[] | undefined>(
    undefined
  );
  const dependencies = Array.isArray(optionsOrDependencies)
    ? optionsOrDependencies
    : undefined;
  const previousDependencies = committedDependencies.current;
  const stableDependencies = dependencies
    ? previousDependencies?.length === dependencies.length &&
      dependencies.every((value, index) =>
        Object.is(value, previousDependencies[index])
      )
      ? previousDependencies
      : [...dependencies]
    : undefined;
  // Commit a snapshot so unrelated renders preserve legacy dependency values,
  // including NaN and object identity, without leaking an abandoned render.
  useEffect(() => {
    committedDependencies.current = stableDependencies;
  }, [stableDependencies]);
  const isLegacyCall =
    Array.isArray(optionsOrDependencies) ||
    (optionsOrDependencies === undefined && legacyOptions !== undefined);
  const options: UseScrollToBottomOptions = isLegacyCall
    ? {
        autoScrollOnInit: true,
        scrollThreshold: 10,
        ...legacyOptions,
        contentVersion: stableDependencies ?? legacyOptions?.contentVersion,
      }
    : ((optionsOrDependencies as UseScrollToBottomOptions | undefined) ?? {});
  const {
    contentRef,
    endRef,
    scrollTarget,
    pageScrollFallback = "auto",
    scrollThreshold = 150,
    contentVersion,
    followNewContent: followNewContentOption = true,
    autoScrollOnInit = false,
    behavior = "smooth",
  } = options;
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isFollowing, setIsFollowing] = useState(followNewContentOption);
  const [bindingRevision, setBindingRevision] = useState(0);
  const followingRef = useRef(followNewContentOption);
  const followEnabledRef = useRef(followNewContentOption);
  const initializedRef = useRef(false);
  const boundTargetsRef = useRef<ScrollTarget[]>([]);
  const boundViewportRef = useRef<HTMLElement | null>(null);
  const boundContentRef = useRef<HTMLElement | null>(null);
  const programmaticScrollRef = useRef(false);
  const interruptedPositionsRef = useRef<Map<ScrollTarget, number> | null>(
    null
  );
  const eventFrameRef = useRef<number | null>(null);
  const contentFrameRef = useRef<number | null>(null);
  const programmaticFrameRef = useRef<{
    view: Window;
    id: number;
  } | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setFollowing = useCallback((next: boolean) => {
    followingRef.current = next;
    setIsFollowing((current) => (current === next ? current : next));
  }, []);

  const clearSettleTimer = useCallback(() => {
    if (settleTimerRef.current !== null) {
      clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
  }, []);

  const clearProgrammaticFrame = useCallback(() => {
    if (programmaticFrameRef.current) {
      programmaticFrameRef.current.view.cancelAnimationFrame(
        programmaticFrameRef.current.id
      );
      programmaticFrameRef.current = null;
    }
  }, []);

  const finishProgrammaticScroll = useCallback(() => {
    programmaticScrollRef.current = false;
    clearSettleTimer();
  }, [clearSettleTimer]);

  const getResolvedTargets = useCallback(
    () => resolveScrollTargets(viewportRef, scrollTarget, pageScrollFallback),
    [pageScrollFallback, scrollTarget, viewportRef]
  );

  const applyPresentation = useCallback(
    (targets: ScrollTarget[]) => {
      if (
        interruptedPositionsRef.current &&
        !sameTargets(targets, [...interruptedPositionsRef.current.keys()])
      ) {
        interruptedPositionsRef.current = null;
      }
      const presentation = getCombinedScrollPresentation(
        targets.map(getScrollMetrics),
        scrollThreshold
      );
      setIsAtBottom(presentation.isAtBottom);

      if (programmaticScrollRef.current) {
        setShowScrollToBottom(
          presentation.isAtBottom ? presentation.showScrollToBottom : false
        );
        // The visibility threshold is not the native animation's destination.
        if (presentation.distanceFromBottom <= 1) {
          finishProgrammaticScroll();
          setFollowing(followEnabledRef.current);
        }
        return presentation;
      }

      setShowScrollToBottom(presentation.showScrollToBottom);
      setFollowing(
        !interruptedPositionsRef.current &&
          presentation.isAtBottom &&
          followEnabledRef.current
      );
      return presentation;
    },
    [finishProgrammaticScroll, scrollThreshold, setFollowing]
  );

  const refresh = useCallback(() => {
    applyPresentation(getResolvedTargets());
  }, [applyPresentation, getResolvedTargets]);

  const scrollToBottom = useCallback(
    (requestedBehavior: ScrollBehavior = behavior) => {
      const targets = getResolvedTargets();
      if (targets.length === 0) return;

      const view = getTargetWindow(targets[0]);
      const prefersReducedMotion =
        view?.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      const actualBehavior = resolveScrollBehavior(
        requestedBehavior,
        prefersReducedMotion
      );
      // Native "auto" can inherit CSS smooth scrolling; our auto path must finish immediately.
      const nativeBehavior =
        actualBehavior === "auto" ? "instant" : actualBehavior;

      interruptedPositionsRef.current = null;
      programmaticScrollRef.current = true;
      setFollowing(followEnabledRef.current);
      setShowScrollToBottom(false);
      clearProgrammaticFrame();
      clearSettleTimer();

      if (endRef?.current) {
        endRef.current.scrollIntoView({
          behavior: nativeBehavior,
          block: "end",
        });
      } else {
        targets.forEach((target) => {
          const top = getScrollMetrics(target).scrollHeight;
          scrollTargetTo(target, { top, behavior: nativeBehavior });
        });
      }

      if (actualBehavior === "auto") {
        if (view) {
          const id = view.requestAnimationFrame(() => {
            programmaticFrameRef.current = null;
            finishProgrammaticScroll();
            refresh();
          });
          programmaticFrameRef.current = { view, id };
        } else {
          finishProgrammaticScroll();
          refresh();
        }
        return;
      }

      settleTimerRef.current = setTimeout(() => {
        finishProgrammaticScroll();
        refresh();
      }, 1200);
    },
    [
      behavior,
      clearProgrammaticFrame,
      clearSettleTimer,
      endRef,
      finishProgrammaticScroll,
      getResolvedTargets,
      refresh,
      setFollowing,
    ]
  );

  const ensureTargetBinding = useCallback(() => {
    const nextTargets = getResolvedTargets();
    const nextViewport = viewportRef.current;
    const nextContent = resolveObservedContent(viewportRef, contentRef);
    if (
      sameTargets(nextTargets, boundTargetsRef.current) &&
      nextViewport === boundViewportRef.current &&
      nextContent === boundContentRef.current
    )
      return false;
    boundTargetsRef.current = nextTargets;
    boundViewportRef.current = nextViewport;
    boundContentRef.current = nextContent;
    setBindingRevision((current) => current + 1);
    return true;
  }, [contentRef, getResolvedTargets, viewportRef]);

  useEffect(() => {
    const targets = getResolvedTargets();
    const targetWindow = targets[0]
      ? getTargetWindow(targets[0])
      : (viewportRef.current?.ownerDocument.defaultView ?? null);
    if (targets.length === 0 && !targetWindow) return;

    boundTargetsRef.current = targets;
    boundViewportRef.current = viewportRef.current;
    boundContentRef.current = resolveObservedContent(viewportRef, contentRef);
    const eventTargets = new Set(targets.map(getScrollEventTarget));
    const targetWindows = new Set(
      [...targets.map(getTargetWindow), targetWindow].filter(
        (view): view is Window => view !== null
      )
    );
    const visualViewports = new Set(
      Array.from(targetWindows)
        .map((view) => view.visualViewport)
        .filter((viewport): viewport is VisualViewport => Boolean(viewport))
    );

    const scheduleEvent = (callback: () => void) => {
      if (eventFrameRef.current !== null && targetWindow) {
        targetWindow.cancelAnimationFrame(eventFrameRef.current);
      }
      if (!targetWindow) {
        callback();
        return;
      }
      eventFrameRef.current = targetWindow.requestAnimationFrame(() => {
        eventFrameRef.current = null;
        callback();
      });
    };

    const lastPositions = new Map(
      targets.map((target) => [target, getScrollMetrics(target).scrollTop])
    );
    const interruptProgrammaticScroll = () => {
      if (!programmaticScrollRef.current) return;
      interruptedPositionsRef.current = new Map(
        targets.map((target) => [target, getScrollMetrics(target).scrollTop])
      );
      clearProgrammaticFrame();
      finishProgrammaticScroll();
      setFollowing(false);
      targets.forEach((target) => {
        // Stop the native animation as well as the library's completion work.
        scrollTargetTo(target, {
          top: getScrollMetrics(target).scrollTop,
          behavior: "instant",
        });
      });
      refresh();
    };
    const handleInput = (event: Event) => {
      if (isScrollInput(event)) interruptProgrammaticScroll();
    };
    const handleScroll = () => {
      const interruptedPositions = interruptedPositionsRef.current;
      // Cancellation itself can queue an unchanged scroll event. Only new
      // positions can release the input pause; layout refreshes cannot.
      if (
        interruptedPositions &&
        targets.some(
          (target) =>
            getScrollMetrics(target).scrollTop !==
            interruptedPositions.get(target)
        )
      ) {
        interruptedPositionsRef.current = null;
      }
      let movedAway = false;
      targets.forEach((target) => {
        const top = getScrollMetrics(target).scrollTop;
        if (top < (lastPositions.get(target) ?? top) - 1) movedAway = true;
        lastPositions.set(target, top);
      });
      // Scrollbar dragging may not emit a content pointer event in every browser.
      if (movedAway) interruptProgrammaticScroll();
      // Record user intent before an observer or content frame can follow growth.
      refresh();
    };

    const handleLayoutChange = () => {
      scheduleEvent(() => {
        ensureTargetBinding();
        if (initializedRef.current && followingRef.current) {
          scrollToBottom("auto");
        } else {
          refresh();
        }
      });
    };

    const inputEvents = ["wheel", "touchstart", "pointerdown", "keydown"];
    eventTargets.forEach((eventTarget) => {
      eventTarget.addEventListener("scroll", handleScroll, { passive: true });
      inputEvents.forEach((type) =>
        eventTarget.addEventListener(type, handleInput, {
          passive: true,
          capture: true,
        })
      );
    });
    targetWindows.forEach((view) =>
      view.addEventListener("resize", handleLayoutChange)
    );
    visualViewports.forEach((viewport) =>
      viewport.addEventListener("resize", handleLayoutChange)
    );

    const observerWindow = targetWindow as (Window & typeof globalThis) | null;
    const ResizeObserverConstructor = observerWindow?.ResizeObserver;
    const resizeObserver = ResizeObserverConstructor
      ? new ResizeObserverConstructor(handleLayoutChange)
      : null;
    const observeResizeTargets = () => {
      resizeObserver?.disconnect();
      const elements = new Set<HTMLElement>();
      if (viewportRef.current) elements.add(viewportRef.current);
      const observedContent = resolveObservedContent(viewportRef, contentRef);
      if (observedContent) elements.add(observedContent);
      targets.forEach((target) => {
        if (!isWindow(target) && !isDocument(target)) elements.add(target);
      });
      elements.forEach((element) => resizeObserver?.observe(element));
    };
    observeResizeTargets();

    const MutationObserverConstructor = observerWindow?.MutationObserver;
    const mutationObserver = MutationObserverConstructor
      ? new MutationObserverConstructor(() => {
          observeResizeTargets();
          handleLayoutChange();
        })
      : null;
    if (viewportRef.current) {
      mutationObserver?.observe(viewportRef.current, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }

    refresh();
    return () => {
      eventTargets.forEach((eventTarget) => {
        eventTarget.removeEventListener("scroll", handleScroll);
        inputEvents.forEach((type) =>
          eventTarget.removeEventListener(type, handleInput, true)
        );
      });
      targetWindows.forEach((view) =>
        view.removeEventListener("resize", handleLayoutChange)
      );
      visualViewports.forEach((viewport) =>
        viewport.removeEventListener("resize", handleLayoutChange)
      );
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      if (eventFrameRef.current !== null && targetWindow) {
        targetWindow.cancelAnimationFrame(eventFrameRef.current);
        eventFrameRef.current = null;
      }
      if (sameTargets(boundTargetsRef.current, targets)) {
        boundTargetsRef.current = [];
      }
    };
  }, [
    applyPresentation,
    bindingRevision,
    clearProgrammaticFrame,
    contentRef,
    ensureTargetBinding,
    finishProgrammaticScroll,
    getResolvedTargets,
    refresh,
    scrollToBottom,
    setFollowing,
    viewportRef,
  ]);

  // Ref objects are stable even when a host replaces their nodes during commit.
  useEffect(() => {
    ensureTargetBinding();
  });

  useEffect(() => {
    const targets = getResolvedTargets();
    const targetWindow = targets[0] ? getTargetWindow(targets[0]) : null;
    ensureTargetBinding();
    // An explicit ref may mount later; defer initialization until it resolves.
    if (targets.length === 0) return;
    const shouldAutoScrollOnInit = !initializedRef.current && autoScrollOnInit;

    if (!initializedRef.current) {
      initializedRef.current = true;
      if (!autoScrollOnInit) {
        refresh();
        return;
      }
    }

    if (contentFrameRef.current !== null && targetWindow) {
      targetWindow.cancelAnimationFrame(contentFrameRef.current);
    }
    if (!targetWindow) {
      if (followingRef.current) scrollToBottom("auto");
      else refresh();
      return;
    }

    contentFrameRef.current = targetWindow.requestAnimationFrame(() => {
      contentFrameRef.current = null;
      if (followingRef.current || shouldAutoScrollOnInit) {
        scrollToBottom("auto");
      } else refresh();
    });

    return () => {
      if (contentFrameRef.current !== null) {
        targetWindow.cancelAnimationFrame(contentFrameRef.current);
        contentFrameRef.current = null;
      }
    };
  }, [
    autoScrollOnInit,
    bindingRevision,
    contentVersion,
    ensureTargetBinding,
    getResolvedTargets,
    refresh,
    scrollToBottom,
  ]);

  useEffect(() => {
    followEnabledRef.current = followNewContentOption;
    if (!followNewContentOption) {
      setFollowing(false);
      return;
    }
    refresh();
  }, [followNewContentOption, refresh, setFollowing]);

  useEffect(
    () => () => {
      clearProgrammaticFrame();
      finishProgrammaticScroll();
      const targets = getResolvedTargets();
      const targetWindow = targets[0] ? getTargetWindow(targets[0]) : null;
      if (eventFrameRef.current !== null && targetWindow) {
        targetWindow.cancelAnimationFrame(eventFrameRef.current);
      }
      if (contentFrameRef.current !== null && targetWindow) {
        targetWindow.cancelAnimationFrame(contentFrameRef.current);
      }
    },
    [clearProgrammaticFrame, finishProgrammaticScroll, getResolvedTargets]
  );

  const handleUserScrollToBottom = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return {
    showScrollToBottom,
    isAtBottom,
    followNewContent: isFollowing,
    scrollToBottom,
    handleUserScrollToBottom,
    refresh,
  };
}

export default useScrollToBottom;
