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
import {
  getInteractionDefaultSelectedValues,
  getInteractionDefaultValues,
} from "./interaction-defaults";
import Player from "./Player";
import type { Element } from "./types";
import useSlide from "./useSlide";
import "./slide.css";
export type { Element } from "./types";

const SLIDE_STAGE_TRANSITION_MS = 260;

interface InteractionOverlayCardProps {
  content: string;
  title: string;
  defaultButtonText?: string;
  defaultInputText?: string;
  defaultSelectedValues?: string[];
  readonly?: boolean;
}

const InteractionOverlayCard = memo(
  ({
    content,
    title,
    defaultButtonText,
    defaultInputText,
    defaultSelectedValues,
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
  const playerHideTimerRef = useRef<number | null>(null);
  const audioStartTimerRef = useRef<number | null>(null);
  const interactionAutoCloseTimerRef = useRef<number | null>(null);
  const audioSequenceTokenRef = useRef(0);
  const {
    currentElement,
    currentIndex,
    slideElementList,
    audioList,
    currentAudioSequenceIndexes,
    currentInteractionElement,
    canGoPrev,
    canGoNext,
    handlePrev: goPrev,
    handleNext: goNext,
  } = useSlide(elementList);
  const currentDisplayElement = useMemo(() => {
    if (currentElement?.type !== "interaction") {
      return currentElement;
    }

    for (let index = currentIndex - 1; index >= 0; index -= 1) {
      const element = slideElementList[index];

      if (!element || element.type === "interaction") {
        continue;
      }

      return {
        ...element,
        is_show: true,
      };
    }

    return undefined;
  }, [currentElement, currentIndex, slideElementList]);
  const visibleCheckpointCount = slideElementList.filter(
    (element) => element.is_show !== false
  ).length;
  const isSingleSlide = visibleCheckpointCount === 1;
  const shouldRenderPlayer =
    showPlayer &&
    (isSingleSlide ||
      audioList.length > 0 ||
      Boolean(currentInteractionElement));
  const currentElementRenderKey =
    currentDisplayElement?.serial_number ??
    `${currentIndex}-${currentDisplayElement?.type}`;
  const [activeRenderKey, setActiveRenderKey] = useState(
    currentElementRenderKey
  );
  const [activeRenderElement, setActiveRenderElement] = useState(
    currentDisplayElement
  );
  const [exitingRenderKey, setExitingRenderKey] = useState<
    string | number | undefined
  >();
  const [exitingRenderElement, setExitingRenderElement] = useState<Element>();
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

  const clearAudioStartTimer = useCallback(() => {
    if (audioStartTimerRef.current === null) {
      return;
    }

    window.clearTimeout(audioStartTimerRef.current);
    audioStartTimerRef.current = null;
  }, []);

  const clearInteractionAutoCloseTimer = useCallback(() => {
    if (interactionAutoCloseTimerRef.current === null) {
      return;
    }

    window.clearTimeout(interactionAutoCloseTimerRef.current);
    interactionAutoCloseTimerRef.current = null;
  }, []);

  const resetAudioSequence = useCallback(() => {
    audioSequenceTokenRef.current += 1;
    clearAudioStartTimer();
    clearInteractionAutoCloseTimer();
    setCurrentAudioIndex(-1);
    setCurrentAudioSequencePosition(-1);
    setActiveInteractionElement(undefined);
    setIsInteractionOverlayOpen(false);
  }, [clearAudioStartTimer, clearInteractionAutoCloseTimer]);

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
    if (!currentDisplayElement || currentElementRenderKey == null) {
      setActiveRenderKey(undefined);
      setActiveRenderElement(undefined);
      setExitingRenderKey(undefined);
      setExitingRenderElement(undefined);
      return;
    }

    setActiveRenderKey((prevKey) => {
      if (prevKey == null || prevKey === currentElementRenderKey) {
        return currentElementRenderKey;
      }

      setExitingRenderKey(prevKey);
      setExitingRenderElement(activeRenderElement);
      return currentElementRenderKey;
    });
    setActiveRenderElement(currentDisplayElement);
  }, [activeRenderElement, currentDisplayElement, currentElementRenderKey]);

  useEffect(() => {
    if (exitingRenderKey == null) {
      return;
    }

    const timer = window.setTimeout(() => {
      setExitingRenderKey(undefined);
      setExitingRenderElement(undefined);
    }, SLIDE_STAGE_TRANSITION_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [exitingRenderKey]);

  useEffect(() => {
    return () => {
      clearPlayerHideTimer();
      clearAudioStartTimer();
      clearInteractionAutoCloseTimer();
    };
  }, [
    clearAudioStartTimer,
    clearInteractionAutoCloseTimer,
    clearPlayerHideTimer,
  ]);

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

    if (!currentElement) {
      return;
    }

    const sequenceToken = audioSequenceTokenRef.current;

    audioStartTimerRef.current = window.setTimeout(() => {
      if (audioSequenceTokenRef.current !== sequenceToken) {
        return;
      }

      if (currentAudioSequenceIndexes.length > 0) {
        setCurrentAudioSequencePosition(0);
        setCurrentAudioIndex(currentAudioSequenceIndexes[0] ?? -1);
        audioStartTimerRef.current = null;
        return;
      }

      if (currentInteractionElement) {
        setActiveInteractionElement(currentInteractionElement);
        setIsInteractionOverlayOpen(true);
      }

      audioStartTimerRef.current = null;
    }, SLIDE_STAGE_TRANSITION_MS);

    return () => {
      clearAudioStartTimer();
    };
  }, [
    clearAudioStartTimer,
    currentAudioSequenceIndexes,
    currentElement,
    currentElementRenderKey,
    currentInteractionElement,
    resetAudioSequence,
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

  useEffect(() => {
    clearInteractionAutoCloseTimer();

    if (!isInteractionOverlayOpen || !hasResolvedInteractionInput) {
      return;
    }

    interactionAutoCloseTimerRef.current = window.setTimeout(() => {
      setIsInteractionOverlayOpen(false);
      interactionAutoCloseTimerRef.current = null;

      if (canGoNext) {
        goNext();
      }
    }, 2000);

    return () => {
      clearInteractionAutoCloseTimer();
    };
  }, [
    canGoNext,
    clearInteractionAutoCloseTimer,
    goNext,
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

      if (currentInteractionElement) {
        setActiveInteractionElement(currentInteractionElement);
        setIsInteractionOverlayOpen(true);
        return;
      }

      if (canGoNext) {
        goNext();
      }
    },
    [
      canGoNext,
      currentAudioSequenceIndexes,
      currentAudioSequencePosition,
      currentInteractionElement,
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

  console.log(
    "currentElement",
    currentElement,
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
          "w-full",
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
        {activeRenderElement ? (
          <div className="slide-stage">
            {exitingRenderElement ? (
              <div
                key={exitingRenderKey}
                className={cn(
                  "slide-stage__layer slide-stage__layer--exit w-full",
                  isSingleSlide &&
                    exitingRenderElement.is_show !== false &&
                    "slide-element--single",
                  exitingRenderElement.is_show === false && "hidden"
                )}
              >
                {renderSlideElement(exitingRenderElement)}
              </div>
            ) : null}

            <div
              key={activeRenderKey}
              className={cn(
                "slide-stage__layer slide-stage__layer--enter w-full",
                isSingleSlide &&
                  activeRenderElement.is_show !== false &&
                  "slide-element--single",
                activeRenderElement.is_show === false && "hidden"
              )}
            >
              {renderSlideElement(activeRenderElement)}
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
