import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { hasBrowserUserActivation } from "../../lib/browserUserActivation";
import { isSandboxInteractionMessage } from "../../lib/sandboxInteraction";
import { cn } from "../../lib/utils";
import ContentRender from "../ContentRender";
import IframeSandbox from "../ContentRender/IframeSandbox";
import type { OnSendContentParams } from "../types";
import {
  getInteractionDefaultSelectedValues,
  getInteractionDefaultValues,
} from "./interaction-defaults";
import Player from "./Player";
import type { Element } from "./types";
import useSlide from "./useSlide";
import "./slide.css";
export type { Element, ElementAudioSegment } from "./types";

const CHECKPOINT_AUTO_ADVANCE_DELAY_MS = 1000;

interface InteractionOverlayCardProps {
  content: string;
  title: string;
  defaultButtonText?: string;
  defaultInputText?: string;
  defaultSelectedValues?: string[];
  onSend?: (content: OnSendContentParams) => void;
  readonly?: boolean;
}

const InteractionOverlayCard = memo(
  ({
    content,
    title,
    defaultButtonText,
    defaultInputText,
    defaultSelectedValues,
    onSend,
    readonly = false,
  }: InteractionOverlayCardProps) => (
    <div className="slide-player__interaction-card">
      <div className="slide-player__interaction-header">
        <p className="slide-player__interaction-title">{title}</p>
      </div>
      <div className="slide-player__interaction-body">
        <ContentRender
          content={content}
          defaultButtonText={defaultButtonText}
          defaultInputText={defaultInputText}
          defaultSelectedValues={defaultSelectedValues}
          onSend={onSend}
          readonly={readonly}
          enableTypewriter={false}
          sandboxMode="content"
        />
      </div>
      <div className="slide-player__interaction-arrow" />
    </div>
  )
);

InteractionOverlayCard.displayName = "InteractionOverlayCard";

export interface SlideProps extends React.ComponentProps<"section"> {
  elementList?: Element[];
  showPlayer?: boolean;
  playerAlwaysVisible?: boolean;
  playerClassName?: string;
  interactionTitle?: string;
  playerAutoHideDelay?: number;
  onSend?: (content: OnSendContentParams, element?: Element) => void;
  onPlayerVisibilityChange?: (visible: boolean) => void;
  onStepChange?: (element: Element | undefined, index: number) => void;
}

const Slide: React.FC<SlideProps> = ({
  elementList = [],
  showPlayer = true,
  playerAlwaysVisible = false,
  playerClassName,
  interactionTitle,
  playerAutoHideDelay = 3000,
  onSend,
  onPlayerVisibilityChange,
  onStepChange,
  className,
  onPointerDown,
  ...props
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageLayerRef = useRef<HTMLDivElement | null>(null);
  const lastElementRef = useRef<HTMLDivElement | null>(null);
  const playerHideTimerRef = useRef<number | null>(null);
  const autoAdvanceTimerRef = useRef<number | null>(null);
  const interactionAutoCloseTimerRef = useRef<number | null>(null);
  const prevRenderElementKeysRef = useRef<string[]>([]);
  const shouldScrollToBottomRef = useRef(false);
  const {
    currentElementList,
    slideElementList,
    currentIndex,
    audioList,
    currentAudioSequenceIndexes,
    currentInteractionElement,
    canGoPrev,
    canGoNext,
    handlePrev: goPrev,
    handleNext: goNext,
  } = useSlide(elementList);
  const currentStepElement = useMemo(() => {
    if (currentIndex < 0) {
      return undefined;
    }

    return slideElementList[currentIndex];
  }, [currentIndex, slideElementList]);
  const visibleCheckpointCount = slideElementList.filter(
    (element) => element.is_show !== false
  ).length;
  const isSingleSlide = visibleCheckpointCount === 1;
  const shouldRenderPlayer =
    showPlayer &&
    (isSingleSlide ||
      audioList.length > 0 ||
      Boolean(currentInteractionElement));
  const [isPlayerVisible, setIsPlayerVisible] = useState(true);
  const [hasPlayerInteracted, setHasPlayerInteracted] = useState(false);
  const [hasPlaybackInteracted, setHasPlaybackInteracted] = useState(false);
  const [shouldAutoPlay] = useState(() => hasBrowserUserActivation());
  const canAutoPlayAudio = shouldAutoPlay || hasPlaybackInteracted;
  const [currentAudioIndex, setCurrentAudioIndex] = useState(-1);
  const [currentAudioSequencePosition, setCurrentAudioSequencePosition] =
    useState(-1);
  const [activeInteractionElement, setActiveInteractionElement] = useState<
    Element | undefined
  >();
  const [isInteractionOverlayOpen, setIsInteractionOverlayOpen] =
    useState(false);
  const playerVisible =
    shouldRenderPlayer && (playerAlwaysVisible || isPlayerVisible);

  const clearPlayerHideTimer = useCallback(() => {
    if (playerHideTimerRef.current === null) {
      return;
    }

    window.clearTimeout(playerHideTimerRef.current);
    playerHideTimerRef.current = null;
  }, []);

  const clearInteractionAutoCloseTimer = useCallback(() => {
    if (interactionAutoCloseTimerRef.current === null) {
      return;
    }

    window.clearTimeout(interactionAutoCloseTimerRef.current);
    interactionAutoCloseTimerRef.current = null;
  }, []);

  const clearAutoAdvanceTimer = useCallback(() => {
    if (autoAdvanceTimerRef.current === null) {
      return;
    }

    window.clearTimeout(autoAdvanceTimerRef.current);
    autoAdvanceTimerRef.current = null;
  }, []);

  const resetAudioSequence = useCallback(() => {
    clearAutoAdvanceTimer();
    clearInteractionAutoCloseTimer();
    setCurrentAudioIndex(-1);
    setCurrentAudioSequencePosition(-1);
    setActiveInteractionElement(undefined);
    setIsInteractionOverlayOpen(false);
  }, [clearAutoAdvanceTimer, clearInteractionAutoCloseTimer]);

  const startCurrentAudioSequence = useCallback(() => {
    const nextAudioIndex = currentAudioSequenceIndexes[0];

    if (typeof nextAudioIndex !== "number") {
      return false;
    }

    // Start the first audio segment for the current step immediately.
    setCurrentAudioSequencePosition(0);
    setCurrentAudioIndex(nextAudioIndex);
    return true;
  }, [currentAudioSequenceIndexes]);

  const continueAfterInteraction = useCallback(() => {
    clearInteractionAutoCloseTimer();
    setIsInteractionOverlayOpen(false);

    if (startCurrentAudioSequence()) {
      return;
    }

    if (canGoNext) {
      goNext();
    }
  }, [
    canGoNext,
    clearInteractionAutoCloseTimer,
    goNext,
    startCurrentAudioSequence,
  ]);

  const showPlayerControls = useCallback(
    (enableAutoHide = hasPlayerInteracted) => {
      if (!shouldRenderPlayer) {
        return;
      }

      setIsPlayerVisible(true);
      clearPlayerHideTimer();

      if (playerAlwaysVisible || !enableAutoHide || playerAutoHideDelay <= 0) {
        return;
      }

      playerHideTimerRef.current = window.setTimeout(() => {
        setIsPlayerVisible(false);
        playerHideTimerRef.current = null;
      }, playerAutoHideDelay);
    },
    [
      clearPlayerHideTimer,
      hasPlayerInteracted,
      playerAlwaysVisible,
      playerAutoHideDelay,
      shouldRenderPlayer,
    ]
  );

  useEffect(() => {
    return () => {
      clearAutoAdvanceTimer();
      clearPlayerHideTimer();
      clearInteractionAutoCloseTimer();
    };
  }, [
    clearAutoAdvanceTimer,
    clearInteractionAutoCloseTimer,
    clearPlayerHideTimer,
  ]);

  useEffect(() => {
    onPlayerVisibilityChange?.(playerVisible);

    return () => {
      onPlayerVisibilityChange?.(false);
    };
  }, [onPlayerVisibilityChange, playerVisible]);

  useEffect(() => {
    onStepChange?.(currentStepElement, currentIndex);
  }, [currentIndex, currentStepElement, onStepChange]);

  useEffect(() => {
    if (!shouldRenderPlayer) {
      clearPlayerHideTimer();
      setIsPlayerVisible(false);
      return;
    }

    if (playerAlwaysVisible) {
      clearPlayerHideTimer();
      setIsPlayerVisible(true);
      return;
    }

    if (!hasPlayerInteracted) {
      // Keep the initial player visible briefly, then hide it automatically.
      showPlayerControls(true);
    }
  }, [
    clearPlayerHideTimer,
    hasPlayerInteracted,
    playerAlwaysVisible,
    shouldRenderPlayer,
    showPlayerControls,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleSandboxInteraction = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (!isSandboxInteractionMessage(event.data) || !shouldRenderPlayer) {
        return;
      }

      // Restore player controls without blocking native iframe scrolling.
      setHasPlayerInteracted(true);
      showPlayerControls(true);
    };

    window.addEventListener("message", handleSandboxInteraction);

    return () => {
      window.removeEventListener("message", handleSandboxInteraction);
    };
  }, [shouldRenderPlayer, showPlayerControls]);

  useEffect(() => {
    resetAudioSequence();

    if (currentElementList.length === 0 && !currentInteractionElement) {
      return;
    }

    if (currentInteractionElement) {
      // Show the interaction gate before playing any follow-up audio.
      setActiveInteractionElement(currentInteractionElement);
      setIsInteractionOverlayOpen(true);
      return;
    }

    if (startCurrentAudioSequence()) {
      return;
    }

    if (!canGoNext) {
      return;
    }

    // Auto-advance silent checkpoint-only steps so playback flow does not stall.
    autoAdvanceTimerRef.current = window.setTimeout(() => {
      autoAdvanceTimerRef.current = null;
      goNext();
    }, CHECKPOINT_AUTO_ADVANCE_DELAY_MS);

    return () => {
      clearAutoAdvanceTimer();
    };
  }, [
    canGoNext,
    clearAutoAdvanceTimer,
    currentElementList,
    currentInteractionElement,
    goNext,
    resetAudioSequence,
    startCurrentAudioSequence,
  ]);

  const interactionDefaults = useMemo(() => {
    if (!activeInteractionElement) {
      return {};
    }

    return getInteractionDefaultValues(
      typeof activeInteractionElement.content === "string"
        ? activeInteractionElement.content
        : undefined,
      activeInteractionElement.user_input
    );
  }, [activeInteractionElement]);

  const interactionDefaultSelectedValues = useMemo(() => {
    if (!activeInteractionElement) {
      return undefined;
    }

    return getInteractionDefaultSelectedValues(
      typeof activeInteractionElement.content === "string"
        ? activeInteractionElement.content
        : undefined,
      activeInteractionElement.user_input
    );
  }, [activeInteractionElement]);

  const hasResolvedInteractionInput = Boolean(
    activeInteractionElement?.user_input?.trim()
  );
  const isInteractionReadonly =
    Boolean(activeInteractionElement?.readonly) || hasResolvedInteractionInput;

  const handleInteractionSend = useCallback(
    (content: OnSendContentParams) => {
      const submittedValues = [
        ...(content.selectedValues ?? []),
        content.inputText?.trim() ?? "",
        content.buttonText?.trim() ?? "",
      ].filter(Boolean);
      const resolvedUserInput = submittedValues.join(", ");

      setActiveInteractionElement((prevElement) => {
        if (!prevElement || !resolvedUserInput) {
          return prevElement;
        }

        return {
          ...prevElement,
          user_input: resolvedUserInput,
        };
      });

      onSend?.(content, activeInteractionElement);
      continueAfterInteraction();
    },
    [activeInteractionElement, continueAfterInteraction, onSend]
  );

  useEffect(() => {
    clearInteractionAutoCloseTimer();

    if (!isInteractionOverlayOpen || !hasResolvedInteractionInput) {
      return;
    }

    interactionAutoCloseTimerRef.current = window.setTimeout(() => {
      interactionAutoCloseTimerRef.current = null;

      continueAfterInteraction();
    }, 2000);

    return () => {
      clearInteractionAutoCloseTimer();
    };
  }, [
    clearInteractionAutoCloseTimer,
    continueAfterInteraction,
    hasResolvedInteractionInput,
    isInteractionOverlayOpen,
  ]);

  const renderSlideElement = (element?: Element) => {
    if (!element) {
      return null;
    }

    if (element.type === "slot") {
      return <>{element.content}</>;
    }

    if (element.type === "html") {
      return (
        <IframeSandbox
          className="content-render-iframe"
          hideFullScreen
          mode="blackboard"
          type="sandbox"
          content={element.content as string}
        />
      );
    }

    return (
      <IframeSandbox
        className="content-render-iframe"
        hideFullScreen
        mode="blackboard"
        type="markdown"
        content={element.content as string}
      />
    );
  };

  const renderSlideElementList = (elementList: Element[] = []) => {
    if (elementList.length === 0) {
      return null;
    }

    const visibleElementCount = elementList.filter(
      (element) => element.is_show !== false
    ).length;
    const lastVisibleElementIndex = elementList.reduce(
      (lastVisibleIndex, element, index) =>
        element.is_show !== false ? index : lastVisibleIndex,
      -1
    );

    return (
      <div className="slide-stage__content flex w-full flex-col gap-4">
        {elementList.map((element, index) => {
          const isPreRenderedHtml =
            element.type === "html" && element.is_show === false;

          return (
            <div
              key={element.serial_number ?? `${element.type}-${index}`}
              ref={index === lastVisibleElementIndex ? lastElementRef : null}
              aria-hidden={isPreRenderedHtml || undefined}
              className={cn(
                "w-full shrink-0",
                visibleElementCount === 1 &&
                  element.is_show !== false &&
                  "slide-element--single",
                isPreRenderedHtml
                  ? "pointer-events-none fixed left-[-200vw] top-0 -z-10 h-[100dvh] w-[100vw] overflow-hidden opacity-0"
                  : element.is_show === false && "hidden"
              )}
            >
              {renderSlideElement(element)}
            </div>
          );
        })}
      </div>
    );
  };

  const handleFullscreen = () => {
    const target = sectionRef.current;
    if (!target) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      return;
    }

    target.requestFullscreen?.().catch(() => {});
  };

  const scrollStageToBottom = useCallback(() => {
    const stageLayerElement = stageLayerRef.current;

    if (!stageLayerElement) {
      return;
    }

    // Keep the latest content visible after manual player navigation.
    stageLayerElement.scrollTo({
      top: stageLayerElement.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  const handlePrev = useCallback(() => {
    shouldScrollToBottomRef.current = true;
    setHasPlaybackInteracted(true);
    resetAudioSequence();
    goPrev();
  }, [goPrev, resetAudioSequence]);

  const handleNext = useCallback(() => {
    shouldScrollToBottomRef.current = true;
    setHasPlaybackInteracted(true);
    resetAudioSequence();
    goNext();
  }, [goNext, resetAudioSequence]);

  const handlePlayerEnded = useCallback(
    (audioIndex: number) => {
      if (currentAudioSequencePosition < 0) {
        return;
      }

      if (
        currentAudioSequenceIndexes[currentAudioSequencePosition] !== audioIndex
      ) {
        return;
      }

      const nextSequencePosition = currentAudioSequencePosition + 1;
      const nextAudioIndex = currentAudioSequenceIndexes[nextSequencePosition];

      if (typeof nextAudioIndex === "number") {
        setCurrentAudioSequencePosition(nextSequencePosition);
        setCurrentAudioIndex(nextAudioIndex);
        return;
      }

      setCurrentAudioIndex(-1);
      setCurrentAudioSequencePosition(-1);

      if (canGoNext) {
        goNext();
      }
    },
    [
      canGoNext,
      currentAudioSequenceIndexes,
      currentAudioSequencePosition,
      goNext,
    ]
  );

  const handleInteractionToggle = useCallback(() => {
    if (!activeInteractionElement) {
      return;
    }

    setIsInteractionOverlayOpen((prevOpen) => !prevOpen);
  }, [activeInteractionElement]);

  const stopOverlayPropagation = useCallback(
    (
      event:
        | React.PointerEvent<HTMLDivElement>
        | React.MouseEvent<HTMLDivElement>
    ) => {
      event.stopPropagation();

      // Keep the player visible a bit longer when users interact with the overlay.
      if (playerVisible) {
        showPlayerControls(true);
      }
    },
    [isPlayerVisible, showPlayerControls]
  );

  const handleSurfacePointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      onPointerDown?.(event);
      setHasPlayerInteracted(true);
      showPlayerControls(true);
    },
    [onPointerDown, showPlayerControls]
  );

  const shouldShowInteractionOverlay =
    Boolean(activeInteractionElement) && isInteractionOverlayOpen;

  const currentRenderElementKeys = useMemo(
    () =>
      currentElementList.map(
        (element, index) =>
          `${element.serial_number ?? `${element.type}-${index}`}:${element.operation ?? ""}`
      ),
    [currentElementList]
  );

  const renderElementList = useMemo(() => {
    const nextHtmlElement = slideElementList
      .slice(currentIndex + 1)
      .find((element) => element.type === "html");

    if (!nextHtmlElement) {
      return currentElementList;
    }

    const hasMountedNextHtml = currentElementList.some(
      (element) => element.serial_number === nextHtmlElement.serial_number
    );

    if (hasMountedNextHtml) {
      return currentElementList;
    }

    // Keep the next html sandbox mounted offscreen so it is ready when revealed.
    return [...currentElementList, { ...nextHtmlElement, is_show: false }];
  }, [currentElementList, currentIndex, slideElementList]);

  useEffect(() => {
    const prevKeys = prevRenderElementKeysRef.current;
    const hasStablePrefix =
      prevKeys.length > 0 &&
      prevKeys.length < currentRenderElementKeys.length &&
      prevKeys.every((key, index) => key === currentRenderElementKeys[index]);
    const appendedElements = hasStablePrefix
      ? currentElementList.slice(prevKeys.length)
      : [];
    const shouldAutoScrollToAppend = appendedElements.some(
      (element) => element.operation === "append"
    );

    prevRenderElementKeysRef.current = currentRenderElementKeys;

    if (!shouldAutoScrollToAppend) {
      return;
    }

    const animationFrameId = window.requestAnimationFrame(() => {
      const stageLayerElement = stageLayerRef.current;
      const targetElement = lastElementRef.current;

      if (!stageLayerElement || !targetElement) {
        return;
      }

      const stageLayerRect = stageLayerElement.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      const nextScrollTop =
        stageLayerElement.scrollTop + (targetRect.top - stageLayerRect.top);

      // Keep newly appended content visible when the current slide grows downward.
      stageLayerElement.scrollTo({
        top: Math.max(nextScrollTop, 0),
        behavior: "smooth",
      });
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [currentElementList, currentRenderElementKeys]);

  useEffect(() => {
    if (!shouldScrollToBottomRef.current) {
      return;
    }

    shouldScrollToBottomRef.current = false;

    if (currentElementList.length === 0) {
      return;
    }

    const animationFrameId = window.requestAnimationFrame(() => {
      scrollStageToBottom();
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [currentElementList, scrollStageToBottom]);

  console.log(
    "currentElement",
    currentElementList.at(-1),
    currentElementList,
    shouldRenderPlayer,
    isPlayerVisible,
    currentAudioSequenceIndexes,
    currentInteractionElement,
    activeInteractionElement,
    isInteractionOverlayOpen
  );

  return (
    <section
      ref={sectionRef}
      className={cn("relative h-full w-full", className)}
      onPointerDown={handleSurfacePointerDown}
      {...props}
    >
      <div
        className={cn(
          "h-full min-h-0 w-full",
          isSingleSlide ? "slide-content--single" : "grid gap-4"
        )}
      >
        {currentElementList.length > 0 ? (
          <div className="slide-stage">
            <div ref={stageLayerRef} className="slide-stage__layer w-full">
              {renderSlideElementList(renderElementList)}
            </div>
          </div>
        ) : null}
      </div>

      {shouldShowInteractionOverlay ? (
        <div
          className={cn(
            "slide-interaction-overlay",
            playerVisible && shouldRenderPlayer
              ? "slide-interaction-overlay--with-player"
              : "slide-interaction-overlay--standalone"
          )}
          onClick={stopOverlayPropagation}
          onPointerDown={stopOverlayPropagation}
        >
          <InteractionOverlayCard
            content={String(activeInteractionElement?.content ?? "")}
            defaultButtonText={interactionDefaults.buttonText ?? ""}
            defaultInputText={interactionDefaults.inputText ?? ""}
            defaultSelectedValues={interactionDefaultSelectedValues}
            onSend={handleInteractionSend}
            readonly={isInteractionReadonly}
            title={interactionTitle ?? "Submit the content below to continue."}
          />
        </div>
      ) : null}

      {shouldRenderPlayer ? (
        <Player
          audioList={audioList}
          className={cn(
            "absolute left-1/2 bottom-6 z-[2] -translate-x-1/2",
            playerClassName,
            !playerVisible && "pointer-events-none opacity-0"
          )}
          currentAudioIndex={currentAudioIndex}
          defaultPlaying={canAutoPlayAudio}
          hasInteraction={Boolean(activeInteractionElement)}
          isInteractionOpen={isInteractionOverlayOpen}
          nextDisabled={!canGoNext}
          onEnded={handlePlayerEnded}
          onFullscreen={handleFullscreen}
          onInteractionToggle={handleInteractionToggle}
          onPlayRequest={() => setHasPlaybackInteracted(true)}
          onNext={handleNext}
          onPrev={handlePrev}
          prevDisabled={!canGoPrev}
          showControls={playerVisible}
        />
      ) : null}
    </section>
  );
};

export default Slide;
