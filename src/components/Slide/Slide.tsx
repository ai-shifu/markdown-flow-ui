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

const areSameRenderElements = (
  prevElementList: Element[],
  nextElementList: Element[]
) => {
  if (prevElementList.length !== nextElementList.length) {
    return false;
  }

  return prevElementList.every((prevElement, index) => {
    const nextElement = nextElementList[index];

    if (!nextElement) {
      return false;
    }

    return (
      prevElement.serial_number === nextElement.serial_number &&
      prevElement.type === nextElement.type &&
      prevElement.operation === nextElement.operation &&
      prevElement.is_show === nextElement.is_show &&
      prevElement.is_read === nextElement.is_read &&
      prevElement.audio_url === nextElement.audio_url &&
      prevElement.user_input === nextElement.user_input &&
      prevElement.content === nextElement.content
    );
  });
};

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
  const currentElementRenderKey = useMemo(
    () =>
      currentElementList
        .map(
          (element, index) =>
            element.serial_number ?? `${element.type}-${index}`
        )
        .join(":"),
    [currentElementList]
  );
  const [activeRenderKey, setActiveRenderKey] = useState(
    currentElementRenderKey
  );
  const [activeRenderElementList, setActiveRenderElementList] =
    useState(currentElementList);
  const [exitingRenderKey, setExitingRenderKey] = useState<
    string | number | undefined
  >();
  const [exitingRenderElementList, setExitingRenderElementList] = useState<
    Element[]
  >([]);
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
    if (currentElementList.length === 0 || !currentElementRenderKey) {
      setActiveRenderKey((prevKey) => (prevKey == null ? prevKey : undefined));
      setActiveRenderElementList((prevElementList) =>
        prevElementList.length === 0 ? prevElementList : []
      );
      setExitingRenderKey((prevKey) => (prevKey == null ? prevKey : undefined));
      setExitingRenderElementList((prevElementList) =>
        prevElementList.length === 0 ? prevElementList : []
      );
      return;
    }

    setActiveRenderKey((prevKey) => {
      if (prevKey == null) {
        return currentElementRenderKey;
      }

      if (prevKey === currentElementRenderKey) {
        return prevKey;
      }

      setExitingRenderKey(prevKey);
      setExitingRenderElementList(activeRenderElementList);
      return currentElementRenderKey;
    });
    setActiveRenderElementList((prevElementList) =>
      areSameRenderElements(prevElementList, currentElementList)
        ? prevElementList
        : currentElementList
    );
  }, [activeRenderElementList, currentElementList, currentElementRenderKey]);

  useEffect(() => {
    if (exitingRenderKey == null) {
      return;
    }

    const timer = window.setTimeout(() => {
      setExitingRenderKey(undefined);
      setExitingRenderElementList([]);
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

    if (currentElementList.length === 0 && !currentInteractionElement) {
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
    currentElementList,
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
        {activeRenderElementList.length > 0 ? (
          <div className="slide-stage">
            {exitingRenderElementList.length > 0 ? (
              <div
                key={exitingRenderKey}
                className="slide-stage__layer slide-stage__layer--exit w-full"
              >
                {renderSlideElementList(exitingRenderElementList)}
              </div>
            ) : null}

            <div
              key={activeRenderKey}
              className="slide-stage__layer slide-stage__layer--enter w-full"
            >
              {renderSlideElementList(activeRenderElementList)}
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
