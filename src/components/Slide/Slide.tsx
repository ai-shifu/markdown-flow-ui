import React, { useCallback, useEffect, useRef, useState } from "react";

import { hasBrowserUserActivation } from "../../lib/browserUserActivation";
import { cn } from "../../lib/utils";
import IframeSandbox from "../ContentRender/IframeSandbox";
import Player from "./Player";
import type { Element } from "./types";
import useSlide from "./useSlide";
import "./slide.css";
export type { Element } from "./types";

const SLIDE_STAGE_TRANSITION_MS = 260;

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
  const audioSequenceTokenRef = useRef(0);
  const checkpointElementList = elementList.filter(
    (element) => element.is_checkpoint
  );
  const interactionElement = checkpointElementList.find(
    (element) => element.type === "interaction"
  );
  const visibleInteractionContent =
    interactionElement?.is_show !== false &&
    typeof interactionElement?.content === "string"
      ? interactionElement.content
      : undefined;
  const {
    currentElement,
    currentIndex,
    slideElementList,
    audioList,
    currentAudioSequenceIndexes,
    canGoPrev,
    canGoNext,
    handlePrev: goPrev,
    handleNext: goNext,
  } = useSlide(elementList);
  const visibleCheckpointCount = slideElementList.filter(
    (element) => element.is_show !== false
  ).length;
  const hasVisibleInteraction = interactionElement?.is_show !== false;
  const isSingleSlide = visibleCheckpointCount === 1;
  const shouldRenderPlayer =
    showPlayer && (isSingleSlide || hasVisibleInteraction);
  const currentElementRenderKey =
    currentElement?.serial_number ?? `${currentIndex}-${currentElement?.type}`;
  const [activeRenderKey, setActiveRenderKey] = useState(
    currentElementRenderKey
  );
  const [activeRenderElement, setActiveRenderElement] =
    useState(currentElement);
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

  const resetAudioSequence = useCallback(() => {
    audioSequenceTokenRef.current += 1;
    clearAudioStartTimer();
    setCurrentAudioIndex(-1);
    setCurrentAudioSequencePosition(-1);
  }, [clearAudioStartTimer]);

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
    if (!currentElement || currentElementRenderKey == null) {
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
    setActiveRenderElement(currentElement);
  }, [activeRenderElement, currentElement, currentElementRenderKey]);

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
    };
  }, [clearAudioStartTimer, clearPlayerHideTimer]);

  useEffect(() => {
    if (!shouldRenderPlayer) {
      clearPlayerHideTimer();
      setIsPlayerVisible(false);
      return;
    }

    if (!hasPlayerInteracted) {
      clearPlayerHideTimer();
      setIsPlayerVisible(true);
      return;
    }

    showPlayerControls();
  }, [
    clearPlayerHideTimer,
    currentElementRenderKey,
    hasPlayerInteracted,
    showPlayerControls,
    shouldRenderPlayer,
    visibleInteractionContent,
  ]);

  useEffect(() => {
    resetAudioSequence();

    if (!currentElement || currentAudioSequenceIndexes.length === 0) {
      return;
    }

    const sequenceToken = audioSequenceTokenRef.current;

    // Start transition audio after the current slide has finished entering.
    audioStartTimerRef.current = window.setTimeout(() => {
      if (audioSequenceTokenRef.current !== sequenceToken) {
        return;
      }

      setCurrentAudioSequencePosition(0);
      setCurrentAudioIndex(currentAudioSequenceIndexes[0] ?? -1);
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
    resetAudioSequence,
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

  const handleSurfacePointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      onPointerDown?.(event);
      setHasPlayerInteracted(true);
      showPlayerControls(true);
    },
    [onPointerDown, showPlayerControls]
  );

  console.log(
    "currentElement",
    currentElement,
    shouldRenderPlayer,
    isPlayerVisible
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
          interactionContent={visibleInteractionContent}
          interactionTitle={interactionTitle}
          nextDisabled={!canGoNext}
          onEnded={handlePlayerEnded}
          onFullscreen={handleFullscreen}
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
