import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { LoaderCircle } from "lucide-react";

import { hasBrowserUserActivation } from "../../lib/browserUserActivation";
import { isSandboxInteractionMessage } from "../../lib/sandboxInteraction";
import { cn } from "../../lib/utils";
import ContentRender from "../ContentRender";
import type { ContentRenderProps } from "../ContentRender/ContentRender";
import IframeSandbox from "../ContentRender/IframeSandbox";
import type { OnSendContentParams } from "../types";
import {
  getInteractionDefaultSelectedValues,
  getInteractionDefaultValues,
  type InteractionDefaultValueOptions,
} from "../../lib/interaction-defaults";
import Player from "./Player";
import type { Element } from "./types";
import useSlide from "./useSlide";
import useWakePlayerFromIframe from "./useWakePlayerFromIframe";
import "./slide.css";
export type { Element, ElementAudioSegment } from "./types";

const CHECKPOINT_AUTO_ADVANCE_DELAY_MS = 1000;

type RenderSlideElementOptions = {
  replaceRootScreenHeightWithFull?: boolean;
};

interface InteractionOverlayCardProps {
  content: string;
  title: string;
  defaultButtonText?: string;
  defaultInputText?: string;
  defaultSelectedValues?: string[];
  confirmButtonText?: string;
  copyButtonText?: string;
  copiedButtonText?: string;
  onSend?: (content: OnSendContentParams) => void;
  readonly?: boolean;
}

export interface SlideInteractionTexts
  extends Pick<
    ContentRenderProps,
    "confirmButtonText" | "copyButtonText" | "copiedButtonText"
  > {
  title?: string;
}

const InteractionOverlayCard = memo(
  ({
    content,
    title,
    defaultButtonText,
    defaultInputText,
    defaultSelectedValues,
    confirmButtonText,
    copyButtonText,
    copiedButtonText,
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
          confirmButtonText={confirmButtonText}
          copyButtonText={copyButtonText}
          copiedButtonText={copiedButtonText}
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

const areStepElementListsEqual = (
  prevElementList: Element[],
  nextElementList: Element[]
) =>
  prevElementList.length === nextElementList.length &&
  prevElementList.every((element, index) => {
    const nextElement = nextElementList[index];

    return (
      element.sequence_number === nextElement?.sequence_number &&
      element.type === nextElement?.type &&
      element.content === nextElement?.content
    );
  });

export interface SlideProps extends React.ComponentProps<"section"> {
  elementList?: Element[];
  showPlayer?: boolean;
  playerAlwaysVisible?: boolean;
  playerClassName?: string;
  bufferingText?: string;
  interactionTitle?: string;
  interactionTexts?: SlideInteractionTexts;
  playerAutoHideDelay?: number;
  interactionDefaultValueOptions?: InteractionDefaultValueOptions;
  onSend?: (content: OnSendContentParams, element?: Element) => void;
  onPlayerVisibilityChange?: (visible: boolean) => void;
  onStepChange?: (element: Element | undefined, index: number) => void;
}

const Slide: React.FC<SlideProps> = ({
  elementList = [],
  showPlayer = true,
  playerAlwaysVisible = false,
  playerClassName,
  bufferingText = "Buffering...",
  interactionTitle,
  interactionTexts,
  playerAutoHideDelay = 3000,
  interactionDefaultValueOptions,
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
    stepElementLists,
    slideElementList,
    currentIndex,
    audioList,
    currentAudioSequenceIndexes,
    currentStepHasSpeakableElement,
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
  const visibleMarkerCount = slideElementList.filter(
    (element) => element.is_renderable !== false
  ).length;
  const isSingleSlide = visibleMarkerCount === 1;
  const shouldRenderPlayer =
    showPlayer &&
    (slideElementList.length > 0 ||
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
  const [isAudioLoadingVisible, setIsAudioLoadingVisible] = useState(false);
  const [hasCompletedCurrentStepAudio, setHasCompletedCurrentStepAudio] =
    useState(false);
  const [activeInteractionElement, setActiveInteractionElement] = useState<
    Element | undefined
  >();
  const [isInteractionOverlayOpen, setIsInteractionOverlayOpen] =
    useState(false);
  const playerVisible =
    shouldRenderPlayer &&
    (playerAlwaysVisible || isPlayerVisible || isAudioLoadingVisible);
  const { mountedStepStates, currentMountedStateIndex } = useMemo(() => {
    const nextMountedStepStates: Array<{
      elementList: Element[];
      sourceStepIndexes: number[];
    }> = [];
    const mountedStateIndexByStep = new Map<number, number>();

    stepElementLists.forEach((stepElementList, stepIndex) => {
      const existingMountedStateIndex = nextMountedStepStates.findIndex(
        (mountedStepState) =>
          areStepElementListsEqual(
            mountedStepState.elementList,
            stepElementList
          )
      );

      if (existingMountedStateIndex >= 0) {
        nextMountedStepStates[
          existingMountedStateIndex
        ]?.sourceStepIndexes.push(stepIndex);
        mountedStateIndexByStep.set(stepIndex, existingMountedStateIndex);
        return;
      }

      nextMountedStepStates.push({
        elementList: stepElementList,
        sourceStepIndexes: [stepIndex],
      });
      mountedStateIndexByStep.set(stepIndex, nextMountedStepStates.length - 1);
    });

    return {
      mountedStepStates: nextMountedStepStates,
      currentMountedStateIndex:
        currentIndex >= 0
          ? (mountedStateIndexByStep.get(currentIndex) ?? -1)
          : -1,
    };
  }, [currentIndex, stepElementLists]);
  const currentAudioSequenceKey = useMemo(
    () => currentAudioSequenceIndexes.join(","),
    [currentAudioSequenceIndexes]
  );
  const currentInteractionResetKey = useMemo(() => {
    if (!currentInteractionElement) {
      return "none";
    }

    return `${currentInteractionElement.sequence_number ?? "none"}:${String(
      currentInteractionElement.content ?? ""
    )}`;
  }, [currentInteractionElement]);
  const currentPlaybackResetKey = useMemo(
    () =>
      [
        currentMountedStateIndex,
        currentInteractionResetKey,
        currentAudioSequenceKey,
      ].join("|"),
    [
      currentAudioSequenceKey,
      currentInteractionResetKey,
      currentMountedStateIndex,
    ]
  );

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
    setIsAudioLoadingVisible(false);
    setHasCompletedCurrentStepAudio(false);
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

      if (!isSandboxInteractionMessage(event.data)) {
        return;
      }

      if (!shouldRenderPlayer) {
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

  useWakePlayerFromIframe({
    sectionRef,
    enabled: shouldRenderPlayer,
    onWake: () => {
      setHasPlayerInteracted(true);
      showPlayerControls(true);
    },
  });

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

    if (currentStepHasSpeakableElement) {
      setIsAudioLoadingVisible(true);
      return;
    }

    if (!canGoNext) {
      return;
    }

    // Auto-advance silent marker-only steps so playback flow does not stall.
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
    currentElementList.length,
    currentInteractionElement,
    currentPlaybackResetKey,
    currentStepHasSpeakableElement,
    goNext,
    resetAudioSequence,
    startCurrentAudioSequence,
  ]);

  useEffect(() => {
    if (!currentStepHasSpeakableElement || currentInteractionElement) {
      setIsAudioLoadingVisible(false);
      return;
    }

    if (hasCompletedCurrentStepAudio) {
      setIsAudioLoadingVisible(false);
      return;
    }

    if (currentAudioSequenceIndexes.length === 0) {
      setIsAudioLoadingVisible(true);
    }
  }, [
    currentAudioSequenceIndexes.length,
    currentInteractionElement,
    currentStepHasSpeakableElement,
    hasCompletedCurrentStepAudio,
  ]);

  const interactionDefaults = useMemo(() => {
    if (!activeInteractionElement) {
      return {};
    }

    return getInteractionDefaultValues(
      typeof activeInteractionElement.content === "string"
        ? activeInteractionElement.content
        : undefined,
      activeInteractionElement.user_input,
      interactionDefaultValueOptions
    );
  }, [activeInteractionElement, interactionDefaultValueOptions]);

  const interactionDefaultSelectedValues = useMemo(() => {
    if (!activeInteractionElement) {
      return undefined;
    }

    return getInteractionDefaultSelectedValues(
      typeof activeInteractionElement.content === "string"
        ? activeInteractionElement.content
        : undefined,
      activeInteractionElement.user_input,
      interactionDefaultValueOptions
    );
  }, [activeInteractionElement, interactionDefaultValueOptions]);

  const hasResolvedInteractionInput = Boolean(
    activeInteractionElement?.user_input?.trim()
  );
  const isInteractionReadonly =
    Boolean(activeInteractionElement?.readonly) || hasResolvedInteractionInput;
  const shouldAutoContinueInteraction =
    isInteractionReadonly || hasResolvedInteractionInput;

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

    if (!isInteractionOverlayOpen || !shouldAutoContinueInteraction) {
      return;
    }

    // Auto-close passive interaction checkpoints to keep playback moving.
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
    isInteractionOverlayOpen,
    shouldAutoContinueInteraction,
  ]);

  const renderSlideElement = (
    element?: Element,
    options: RenderSlideElementOptions = {}
  ) => {
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
          replaceRootScreenHeightWithFull={
            options.replaceRootScreenHeightWithFull
          }
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

  const renderSlideElementList = (
    elementList: Element[] = [],
    isActiveStep = false
  ) => {
    if (elementList.length === 0) {
      return null;
    }

    const visibleElementCount = elementList.filter(
      (element) => element.is_renderable !== false
    ).length;
    const lastVisibleElementIndex = elementList.reduce(
      (lastVisibleIndex, element, index) =>
        element.is_renderable !== false ? index : lastVisibleIndex,
      -1
    );

    return (
      <div className="slide-stage__content flex w-full flex-col gap-4">
        {elementList.map((element, index) => {
          const isPreRenderedHtml =
            element.type === "html" && element.is_renderable === false;

          return (
            <div
              key={element.sequence_number ?? `${element.type}-${index}`}
              ref={
                isActiveStep && index === lastVisibleElementIndex
                  ? lastElementRef
                  : null
              }
              aria-hidden={isPreRenderedHtml || undefined}
              className={cn(
                "w-full shrink-0",
                visibleElementCount === 1 &&
                  element.is_renderable !== false &&
                  "slide-element--single",
                isPreRenderedHtml
                  ? "pointer-events-none fixed left-[-200vw] top-0 -z-10 h-[100dvh] w-[100vw] overflow-hidden opacity-0"
                  : element.is_renderable === false && "hidden"
              )}
            >
              {renderSlideElement(element, {
                replaceRootScreenHeightWithFull:
                  visibleElementCount === 1 &&
                  element.type === "html" &&
                  element.is_renderable !== false,
              })}
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
    setHasPlayerInteracted(true);
    setHasPlaybackInteracted(true);
    setIsAudioLoadingVisible(false);
    showPlayerControls(true);
    resetAudioSequence();
    goPrev();
  }, [goPrev, resetAudioSequence, showPlayerControls]);

  const handleNext = useCallback(() => {
    shouldScrollToBottomRef.current = true;
    setHasPlayerInteracted(true);
    setHasPlaybackInteracted(true);
    setIsAudioLoadingVisible(false);
    showPlayerControls(true);
    resetAudioSequence();
    goNext();
  }, [goNext, resetAudioSequence, showPlayerControls]);

  const handlePlayerLoadingChange = useCallback(
    (loading: boolean) => {
      if (!currentStepHasSpeakableElement || hasCompletedCurrentStepAudio) {
        setIsAudioLoadingVisible(false);
        return;
      }

      setIsAudioLoadingVisible(loading);
    },
    [currentStepHasSpeakableElement, hasCompletedCurrentStepAudio]
  );

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
      setHasCompletedCurrentStepAudio(true);
      setIsAudioLoadingVisible(false);

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
          `${element.sequence_number ?? `${element.type}-${index}`}:${String(element.is_new ?? "")}`
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
      (element) => element.is_new === false
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
              {mountedStepStates.map(
                (mountedStepState, mountedStepStateIndex) => {
                  const isActiveStep =
                    mountedStepStateIndex === currentMountedStateIndex;

                  return (
                    <div
                      key={
                        mountedStepState.sourceStepIndexes[0] ??
                        mountedStepStateIndex
                      }
                      aria-hidden={!isActiveStep || undefined}
                      className="w-full h-full"
                      style={{ display: isActiveStep ? undefined : "none" }}
                    >
                      {renderSlideElementList(
                        mountedStepState.elementList,
                        isActiveStep
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        ) : null}
      </div>

      {isAudioLoadingVisible ? (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[3] flex size-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-2 rounded-2xl bg-foreground/65 px-3 py-4 text-center text-xs leading-4 font-medium text-background shadow-lg backdrop-blur-sm">
          <LoaderCircle className="size-5 animate-spin text-background" />
          <span>{bufferingText}</span>
        </div>
      ) : null}

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
            confirmButtonText={interactionTexts?.confirmButtonText}
            copyButtonText={interactionTexts?.copyButtonText}
            copiedButtonText={interactionTexts?.copiedButtonText}
            onSend={handleInteractionSend}
            readonly={isInteractionReadonly}
            title={
              interactionTexts?.title ??
              interactionTitle ??
              "Submit the content below to continue."
            }
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
          onLoadingChange={handlePlayerLoadingChange}
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
