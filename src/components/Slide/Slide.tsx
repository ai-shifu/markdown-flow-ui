import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { hasBrowserUserActivation } from "../../lib/browserUserActivation";
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
export type { Element } from "./types";

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
  playerClassName?: string;
  interactionTitle?: string;
  playerAutoHideDelay?: number;
}

const Slide: React.FC<SlideProps> = ({
  elementList = [],
  showPlayer = true,
  playerClassName,
  interactionTitle,
  playerAutoHideDelay = 3000,
  className,
  onPointerDown,
  ...props
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageLayerRef = useRef<HTMLDivElement | null>(null);
  const lastElementRef = useRef<HTMLDivElement | null>(null);
  const playerHideTimerRef = useRef<number | null>(null);
  const interactionAutoCloseTimerRef = useRef<number | null>(null);
  const prevRenderElementKeysRef = useRef<string[]>([]);
  const {
    currentElementList,
    slideElementList,
    audioList,
    currentAudioSequenceIndexes,
    currentInteractionElement,
    canGoPrev,
    canGoNext,
    handlePrev: goPrev,
    handleNext: goNext,
  } = useSlide(elementList);
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
  const [shouldAutoPlay] = useState(() => hasBrowserUserActivation());
  const canAutoPlayAudio = shouldAutoPlay || hasPlayerInteracted;
  const [currentAudioIndex, setCurrentAudioIndex] = useState(-1);
  const [currentAudioSequencePosition, setCurrentAudioSequencePosition] =
    useState(-1);
  const [activeInteractionElement, setActiveInteractionElement] = useState<
    Element | undefined
  >();
  const [isInteractionOverlayOpen, setIsInteractionOverlayOpen] =
    useState(false);

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

  const resetAudioSequence = useCallback(() => {
    clearInteractionAutoCloseTimer();
    setCurrentAudioIndex(-1);
    setCurrentAudioSequencePosition(-1);
    setActiveInteractionElement(undefined);
    setIsInteractionOverlayOpen(false);
  }, [clearInteractionAutoCloseTimer]);

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

      if (!enableAutoHide || playerAutoHideDelay <= 0) {
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
      playerAutoHideDelay,
      shouldRenderPlayer,
    ]
  );

  useEffect(() => {
    return () => {
      clearPlayerHideTimer();
      clearInteractionAutoCloseTimer();
    };
  }, [clearInteractionAutoCloseTimer, clearPlayerHideTimer]);

  useEffect(() => {
    if (!shouldRenderPlayer) {
      clearPlayerHideTimer();
      setIsPlayerVisible(false);
      return;
    }

    if (!hasPlayerInteracted) {
      clearPlayerHideTimer();
      setIsPlayerVisible(true);
    }
  }, [clearPlayerHideTimer, hasPlayerInteracted, shouldRenderPlayer]);

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

    startCurrentAudioSequence();
  }, [
    currentElementList,
    currentInteractionElement,
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

      continueAfterInteraction();
    },
    [continueAfterInteraction]
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

    return (
      <div className="slide-stage__content flex w-full flex-col gap-4">
        {elementList.map((element, index) => (
          <div
            key={element.serial_number ?? `${element.type}-${index}`}
            ref={index === elementList.length - 1 ? lastElementRef : null}
            className={cn(
              "w-full shrink-0",
              visibleElementCount === 1 &&
                element.is_show !== false &&
                "slide-element--single",
              element.is_show === false && "hidden"
            )}
          >
            {renderSlideElement(element)}
          </div>
        ))}
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

  const handlePrev = useCallback(() => {
    resetAudioSequence();
    goPrev();
  }, [goPrev, resetAudioSequence]);

  const handleNext = useCallback(() => {
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
      if (isPlayerVisible) {
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
        {shouldRenderPlayer && !isPlayerVisible ? (
          <button
            aria-label="Show player controls"
            className="slide-player-hit-area"
            onPointerDown={handleSurfacePointerDown}
            type="button"
          />
        ) : null}
        {currentElementList.length > 0 ? (
          <div className="slide-stage">
            <div ref={stageLayerRef} className="slide-stage__layer w-full">
              {renderSlideElementList(currentElementList)}
            </div>
          </div>
        ) : null}
      </div>

      {shouldShowInteractionOverlay ? (
        <div
          className={cn(
            "slide-interaction-overlay",
            isPlayerVisible && shouldRenderPlayer
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
            readonly={hasResolvedInteractionInput}
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
            !isPlayerVisible && "pointer-events-none opacity-0"
          )}
          currentAudioIndex={currentAudioIndex}
          defaultPlaying={canAutoPlayAudio}
          hasInteraction={Boolean(activeInteractionElement)}
          isInteractionOpen={isInteractionOverlayOpen}
          nextDisabled={!canGoNext}
          onEnded={handlePlayerEnded}
          onFullscreen={handleFullscreen}
          onInteractionToggle={handleInteractionToggle}
          onNext={handleNext}
          onPrev={handlePrev}
          prevDisabled={!canGoPrev}
          showControls={isPlayerVisible}
        />
      ) : null}
    </section>
  );
};

export default Slide;
