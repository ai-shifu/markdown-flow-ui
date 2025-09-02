import { useRef, useEffect, useCallback, RefObject, useState } from "react";

interface UseScrollToBottomOptions {
  behavior?: "smooth" | "auto";
  autoScrollOnInit?: boolean;
  scrollDelay?: number;
  scrollThreshold?: number;
}

interface UseScrollToBottomReturn {
  showScrollToBottom: boolean;
  scrollToBottom: () => void;
  handleUserScrollToBottom: () => void;
  isAtBottom: boolean;
  followNewContent: boolean;
}

const useScrollToBottom = (
  containerRef: RefObject<HTMLDivElement | null>,
  dependencies: any[] = [],
  options: UseScrollToBottomOptions = {},
): UseScrollToBottomReturn => {
  const {
    behavior = "smooth",
    autoScrollOnInit = true,
    scrollDelay = 100,
    scrollThreshold = 10,
  } = options;

  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const followNewContent = useRef(true);
  const isFirstLoad = useRef(true);
  const timers = useRef({
    scroll: null as NodeJS.Timeout | null,
    init: null as NodeJS.Timeout | null,
    content: null as NodeJS.Timeout | null,
  });

  // Clear all timers
  const clearAllTimers = useCallback(() => {
    Object.values(timers.current).forEach((timer) => {
      if (timer) clearTimeout(timer);
    });
  }, []);

  // Check if scrolled to bottom
  const checkIfAtBottom = useCallback((): boolean => {
    const container = containerRef.current;
    if (!container) return true;

    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollTop + clientHeight >= scrollHeight - scrollThreshold;
  }, [containerRef, scrollThreshold]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior,
      });
    }
  }, [containerRef, behavior]);

  // Update scroll state
  const updateScrollState = useCallback(() => {
    const atBottom = checkIfAtBottom();
    setIsAtBottom(atBottom);
    setShowScrollToBottom(!atBottom);
    return atBottom;
  }, [checkIfAtBottom]);

  // Handle user manually scrolling to bottom
  const handleUserScrollToBottom = useCallback(() => {
    scrollToBottom();
    followNewContent.current = true;
    setShowScrollToBottom(false);
    setIsAtBottom(true);
  }, [scrollToBottom]);

  // Scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Debounce handling
      if (timers.current.scroll) {
        clearTimeout(timers.current.scroll);
      }

      timers.current.scroll = setTimeout(() => {
        const atBottom = updateScrollState();

        // Key logic: disable auto-follow when user manually scrolls
        if (!atBottom) {
          followNewContent.current = false;
        } else {
          followNewContent.current = true;
        }
      }, 150);
    };

    container.addEventListener("scroll", handleScroll);
    // Initialize state
    updateScrollState();

    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (timers.current.scroll) {
        clearTimeout(timers.current.scroll);
      }
    };
  }, [containerRef, updateScrollState]);

  // Auto-scroll on first load
  useEffect(() => {
    if (autoScrollOnInit && isFirstLoad.current) {
      timers.current.init = setTimeout(() => {
        scrollToBottom();
        setIsAtBottom(true);
        setShowScrollToBottom(false);
        followNewContent.current = true;
        isFirstLoad.current = false;
      }, scrollDelay);
    }

    return () => {
      if (timers.current.init) {
        clearTimeout(timers.current.init);
      }
    };
  }, [autoScrollOnInit, scrollToBottom, scrollDelay]);

  // Handle content changes
  useEffect(() => {
    if (isFirstLoad.current) return;

    timers.current.content = setTimeout(() => {
      if (followNewContent.current) {
        // Auto-scroll when user hasn't manually scrolled
        scrollToBottom();
        setIsAtBottom(true);
        setShowScrollToBottom(false);
      } else {
        // Only update button state after user manual scroll
        updateScrollState();
      }
    }, 50);

    return () => {
      if (timers.current.content) {
        clearTimeout(timers.current.content);
      }
    };
  }, [...dependencies, scrollToBottom, updateScrollState]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  return {
    showScrollToBottom,
    scrollToBottom: handleUserScrollToBottom,
    handleUserScrollToBottom,
    isAtBottom,
    followNewContent: followNewContent.current,
  };
};

export default useScrollToBottom;
