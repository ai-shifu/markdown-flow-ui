import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronLeft } from "lucide-react";

import { isSandboxInteractionMessage } from "../../lib/sandboxInteraction";
import { cn } from "../../lib/utils";
import LoadingOverlayCard from "../ui/loading-overlay-card";
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
import type { PlayerProps, SlidePlayerTexts } from "./Player";
import type { Element } from "./types";
import useSlide from "./useSlide";
import useWakePlayerFromIframe from "./useWakePlayerFromIframe";
import {
  DEFAULT_MOBILE_SCREEN_MODE,
  isLandscapeMobileScreenMode,
  type MobileScreenMode,
} from "./utils/mobileScreenMode";
import { shouldPresentInteractionOverlay } from "./utils/interactionPlayback";
import { getPlaybackSequenceTransition } from "./utils/playbackSequence";
import {
  getPlayerCustomActionCount,
  resolvePlayerCustomActionElement,
} from "./utils/playerCustomActions";
import { shouldUseAutoAdvanceToggle } from "./utils/playerToggleMode";
import "./slide.css";
export type {
  Element,
  ElementAudioSegment,
  SlidePlayerCustomActionContext,
  SlidePlayerCustomActions,
} from "./types";

const DEFAULT_MARKER_AUTO_ADVANCE_DELAY_MS = 2000;

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

export type SlideLandscapeHeader = {
  content?: React.ReactNode;
  backAriaLabel?: string;
  onBack?: () => void;
};

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
  landscapeHeader?: SlideLandscapeHeader;
  playerCustomActions?: PlayerProps["customActions"];
  playerCustomActionPauseOnActive?: boolean;
  bufferingText?: string;
  interactionTitle?: string;
  interactionTexts?: SlideInteractionTexts;
  playerTexts?: SlidePlayerTexts;
  playerAutoHideDelay?: number;
  markerAutoAdvanceDelay?: number;
  interactionDefaultValueOptions?: InteractionDefaultValueOptions;
  onSend?: (content: OnSendContentParams, element?: Element) => void;
  onPlayerVisibilityChange?: (visible: boolean) => void;
  onMobileScreenModeChange?: (screenMode: MobileScreenMode) => void;
  onStepChange?: (element: Element | undefined, index: number) => void;
}

const Slide: React.FC<SlideProps> = ({
  elementList = [],
  showPlayer = true,
  playerAlwaysVisible = false,
  playerClassName,
  landscapeHeader,
  playerCustomActions,
  playerCustomActionPauseOnActive = true,
  bufferingText = "Buffering...",
  interactionTitle,
  interactionTexts,
  playerTexts,
  playerAutoHideDelay = 3000,
  markerAutoAdvanceDelay = DEFAULT_MARKER_AUTO_ADVANCE_DELAY_MS,
  interactionDefaultValueOptions,
  onSend,
  onPlayerVisibilityChange,
  onMobileScreenModeChange,
  onStepChange,
  className,
  onPointerDown,
  ...props
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const stageLayerRef = useRef<HTMLDivElement | null>(null);
  const lastElementRef = useRef<HTMLDivElement | null>(null);
  const playerHideTimerRef = useRef<number | null>(null);
  const autoAdvanceTimerRef = useRef<number | null>(null);
  const interactionAutoCloseTimerRef = useRef<number | null>(null);
  const prevRenderElementKeysRef = useRef<string[]>([]);
  const shouldScrollToBottomRef = useRef(false);
  const pendingInteractionOverlayStepIndexRef = useRef<number | null>(null);
  const playbackResetKeyRef = useRef<string | null>(null);
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
  const currentAudioSequenceKeys = useMemo(
    () =>
      currentAudioSequenceIndexes
        .map((audioIndex) => audioList[audioIndex]?.audioKey)
        .filter((audioKey): audioKey is string => Boolean(audioKey)),
    [audioList, currentAudioSequenceIndexes]
  );
  const [isPlayerVisible, setIsPlayerVisible] = useState(true);
  const [hasPlayerInteracted, setHasPlayerInteracted] = useState(false);
  const [isAutoAdvanceEnabled, setIsAutoAdvanceEnabled] = useState(true);
  const [currentAudioKey, setCurrentAudioKey] = useState<string | null>(null);
  const [isAudioLoadingVisible, setIsAudioLoadingVisible] = useState(false);
  const [hasCompletedCurrentStepAudio, setHasCompletedCurrentStepAudio] =
    useState(false);
  const [isPlayerCustomActionActive, setIsPlayerCustomActionActive] =
    useState(false);
  const [activeInteractionElement, setActiveInteractionElement] = useState<
    Element | undefined
  >();
  const [isInteractionOverlayOpen, setIsInteractionOverlayOpen] =
    useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileScreenMode, setMobileScreenMode] = useState<MobileScreenMode>(
    DEFAULT_MOBILE_SCREEN_MODE
  );
  const playerVisible =
    shouldRenderPlayer && (playerAlwaysVisible || isPlayerVisible);
  const isMobileLandscape = isLandscapeMobileScreenMode(mobileScreenMode);
  const shouldShowLandscapeHeader = isMobileLandscape && playerVisible;
  const shouldApplyLandscapeViewportPadding =
    isMobileLandscape && playerVisible;
  const handleLandscapeHeaderBack = useCallback(() => {
    setMobileScreenMode(DEFAULT_MOBILE_SCREEN_MODE);
    landscapeHeader?.onBack?.();
  }, [landscapeHeader]);
  const setPlayerCustomActionActive = useCallback((active: boolean) => {
    setIsPlayerCustomActionActive(active);
  }, []);
  const togglePlayerCustomActionActive = useCallback(() => {
    setIsPlayerCustomActionActive((previous) => !previous);
  }, []);
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
  const currentStepKey = useMemo(() => String(currentIndex), [currentIndex]);
  const currentAudioIndex = useMemo(() => {
    if (!currentAudioKey) {
      return -1;
    }

    return audioList.findIndex(
      (audioItem) => (audioItem.audioKey ?? "") === currentAudioKey
    );
  }, [audioList, currentAudioKey]);
  const currentAudioSequenceStartKey = useMemo(
    () => currentAudioSequenceKeys[0] ?? "none",
    [currentAudioSequenceKeys]
  );
  const playerCustomActionContext = useMemo(
    () => ({
      currentElement: resolvePlayerCustomActionElement({
        currentAudioIndex,
        currentAudioSequenceIndexes,
        audioList,
        currentInteractionElement: activeInteractionElement,
        currentStepElement,
      }),
      currentIndex,
      currentStepElement,
      isActive: isPlayerCustomActionActive,
      setActive: setPlayerCustomActionActive,
      toggleActive: togglePlayerCustomActionActive,
    }),
    [
      activeInteractionElement,
      audioList,
      currentAudioIndex,
      currentAudioSequenceIndexes,
      currentIndex,
      currentStepElement,
      isPlayerCustomActionActive,
      setPlayerCustomActionActive,
      togglePlayerCustomActionActive,
    ]
  );
  const playerCustomActionCount = useMemo(
    () =>
      getPlayerCustomActionCount(
        playerCustomActions,
        playerCustomActionContext
      ),
    [playerCustomActionContext, playerCustomActions]
  );
  const interactionOverlayStyle = useMemo(
    () =>
      ({
        "--slide-player-custom-action-count": String(playerCustomActionCount),
        "--slide-player-mobile-control-count": String(
          playerCustomActionCount + 4
        ),
      }) as React.CSSProperties,
    [playerCustomActionCount]
  );
  const hasAvailableStepAudio = currentAudioSequenceKeys.length > 0;
  const currentInteractionResetKey = useMemo(() => {
    if (!currentInteractionElement) {
      return "none";
    }

    return `${currentInteractionElement.sequence_number ?? "none"}:${String(
      currentInteractionElement.content ?? ""
    )}`;
  }, [currentInteractionElement]);
  const currentPlaybackResetKey = useMemo(
    () => [currentStepKey, currentInteractionResetKey].join("|"),
    [currentInteractionResetKey, currentStepKey]
  );
  const currentStepAudioUrl = useMemo(() => {
    if (
      !currentAudioSequenceStartKey ||
      currentAudioSequenceStartKey === "none"
    ) {
      return "";
    }

    const currentStepAudioItem = audioList.find(
      (audioItem) => audioItem.audioKey === currentAudioSequenceStartKey
    );

    return currentStepAudioItem?.audioUrl?.trim() ?? "";
  }, [audioList, currentAudioSequenceStartKey]);
  const hasCurrentStepAudioUrl = Boolean(currentStepAudioUrl);
  const shouldPausePlaybackForCustomAction =
    playerCustomActionPauseOnActive &&
    Boolean(playerCustomActions) &&
    isPlayerCustomActionActive;
  const shouldUseSilentStepAutoAdvanceToggle = useMemo(
    () =>
      shouldUseAutoAdvanceToggle({
        canGoNext,
        currentAudioIndex,
        currentStepHasSpeakableElement,
        hasInteraction: Boolean(currentInteractionElement),
      }),
    [
      canGoNext,
      currentAudioIndex,
      currentInteractionElement,
      currentStepHasSpeakableElement,
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
    setCurrentAudioKey(null);
    setIsAudioLoadingVisible(false);
    setHasCompletedCurrentStepAudio(false);
    setActiveInteractionElement(undefined);
    setIsInteractionOverlayOpen(false);
  }, [clearAutoAdvanceTimer, clearInteractionAutoCloseTimer]);

  const startCurrentAudioSequence = useCallback(() => {
    const nextAudioKey = currentAudioSequenceKeys[0];

    if (!nextAudioKey) {
      return false;
    }

    // Start the first audio segment for the current step immediately.
    setCurrentAudioKey(nextAudioKey);
    return true;
  }, [currentAudioSequenceKeys]);

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

  const hasResolvedCurrentInteraction = Boolean(
    currentInteractionElement?.readonly ||
      currentInteractionElement?.user_input?.trim()
  );

  const shouldBlockPlaybackForInteraction =
    Boolean(currentInteractionElement) && !hasResolvedCurrentInteraction;

  useEffect(() => {
    // Reset silent-step autoplay toggle whenever navigation lands on a new step.
    setIsAutoAdvanceEnabled(true);

    if (playerCustomActionPauseOnActive) {
      setIsPlayerCustomActionActive(false);
    }
  }, [currentIndex, playerCustomActionPauseOnActive]);

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
    onMobileScreenModeChange?.(mobileScreenMode);
  }, [mobileScreenMode, onMobileScreenModeChange]);

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
    const { hasPlaybackContextChanged, shouldInitializeAudioSequence } =
      getPlaybackSequenceTransition({
        previousResetKey: playbackResetKeyRef.current,
        nextResetKey: currentPlaybackResetKey,
        currentAudioKey,
        hasCompletedCurrentStepAudio,
      });

    playbackResetKeyRef.current = currentPlaybackResetKey;

    const shouldOpenInteractionOverlayAfterAudio =
      pendingInteractionOverlayStepIndexRef.current === currentIndex &&
      Boolean(currentInteractionElement);
    const shouldPresentOverlay = shouldPresentInteractionOverlay({
      hasInteraction: Boolean(currentInteractionElement),
      shouldBlockPlaybackForInteraction,
      shouldOpenInteractionOverlayAfterAudio,
      hasPlaybackContextChanged,
      hasResolvedCurrentInteraction,
      currentStepHasSpeakableElement,
    });

    if (hasPlaybackContextChanged) {
      resetAudioSequence();
    }

    if (currentElementList.length === 0 && !currentInteractionElement) {
      return;
    }

    if (shouldPausePlaybackForCustomAction) {
      return;
    }

    if (shouldPresentOverlay) {
      // Re-open history interaction markers so manual prev/next still reveals the overlay.
      setActiveInteractionElement(currentInteractionElement);
      setIsInteractionOverlayOpen(true);
      pendingInteractionOverlayStepIndexRef.current = null;
      return;
    }

    if (currentInteractionElement) {
      setActiveInteractionElement(currentInteractionElement);
      pendingInteractionOverlayStepIndexRef.current = null;
    }

    if (!shouldInitializeAudioSequence) {
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

    if (shouldUseSilentStepAutoAdvanceToggle && !isAutoAdvanceEnabled) {
      return;
    }

    // Auto-advance silent marker-only steps so playback flow does not stall.
    autoAdvanceTimerRef.current = window.setTimeout(() => {
      autoAdvanceTimerRef.current = null;
      goNext();
    }, markerAutoAdvanceDelay);

    return () => {
      clearAutoAdvanceTimer();
    };
  }, [
    canGoNext,
    clearAutoAdvanceTimer,
    currentElementList.length,
    currentInteractionElement,
    currentAudioKey,
    currentPlaybackResetKey,
    currentStepHasSpeakableElement,
    markerAutoAdvanceDelay,
    goNext,
    hasCompletedCurrentStepAudio,
    isAutoAdvanceEnabled,
    hasResolvedCurrentInteraction,
    shouldBlockPlaybackForInteraction,
    resetAudioSequence,
    startCurrentAudioSequence,
    shouldPausePlaybackForCustomAction,
    shouldUseSilentStepAutoAdvanceToggle,
  ]);

  useEffect(() => {
    if (
      shouldPausePlaybackForCustomAction ||
      !currentStepHasSpeakableElement ||
      shouldBlockPlaybackForInteraction
    ) {
      setIsAudioLoadingVisible(false);
      return;
    }

    if (hasCompletedCurrentStepAudio) {
      setIsAudioLoadingVisible(false);
      return;
    }

    if (hasAvailableStepAudio) {
      setIsAudioLoadingVisible(false);
      return;
    }

    setIsAudioLoadingVisible(true);
  }, [
    hasAvailableStepAudio,
    currentStepHasSpeakableElement,
    hasCompletedCurrentStepAudio,
    shouldPausePlaybackForCustomAction,
    shouldBlockPlaybackForInteraction,
  ]);

  useEffect(() => {
    if (currentAudioKey || currentAudioSequenceKeys.length === 0) {
      return;
    }

    if (
      shouldPausePlaybackForCustomAction ||
      !currentStepHasSpeakableElement ||
      shouldBlockPlaybackForInteraction
    ) {
      return;
    }

    if (hasCompletedCurrentStepAudio) {
      return;
    }

    startCurrentAudioSequence();
  }, [
    currentAudioKey,
    currentAudioSequenceKeys,
    currentStepHasSpeakableElement,
    hasCompletedCurrentStepAudio,
    shouldPausePlaybackForCustomAction,
    shouldBlockPlaybackForInteraction,
    startCurrentAudioSequence,
  ]);

  useEffect(() => {
    if (!currentAudioKey || currentAudioIndex >= 0) {
      return;
    }

    setCurrentAudioKey(null);
  }, [currentAudioIndex, currentAudioKey]);

  const interactionDefaults = useMemo(() => {
    if (!activeInteractionElement) {
      return {};
    }

    const shouldPreferResolvedInteractionInput = Boolean(
      activeInteractionElement.user_input?.trim()
    );

    return getInteractionDefaultValues(
      typeof activeInteractionElement.content === "string"
        ? activeInteractionElement.content
        : undefined,
      activeInteractionElement.user_input,
      shouldPreferResolvedInteractionInput
        ? undefined
        : interactionDefaultValueOptions
    );
  }, [activeInteractionElement, interactionDefaultValueOptions]);

  const interactionDefaultSelectedValues = useMemo(() => {
    if (!activeInteractionElement) {
      return undefined;
    }

    const shouldPreferResolvedInteractionInput = Boolean(
      activeInteractionElement.user_input?.trim()
    );

    return getInteractionDefaultSelectedValues(
      typeof activeInteractionElement.content === "string"
        ? activeInteractionElement.content
        : undefined,
      activeInteractionElement.user_input,
      shouldPreferResolvedInteractionInput
        ? undefined
        : interactionDefaultValueOptions
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
    // Keep the player icon in sync with the actual fullscreen owner.
    const syncFullscreenState = () => {
      setIsFullscreen(document.fullscreenElement === sectionRef.current);
    };

    syncFullscreenState();
    document.addEventListener("fullscreenchange", syncFullscreenState);

    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreenState);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const mobileMediaQuery = window.matchMedia("(max-width: 640px)");

    if (!mobileMediaQuery.matches || !isMobileLandscape) {
      return;
    }

    const { style } = document.body;
    const previousOverflow = style.overflow;
    const previousOverscrollBehavior = style.overscrollBehavior;

    // Lock the page scroll while the rotated slide takes over the viewport.
    style.overflow = "hidden";
    style.overscrollBehavior = "none";

    return () => {
      style.overflow = previousOverflow;
      style.overscrollBehavior = previousOverscrollBehavior;
    };
  }, [isMobileLandscape]);

  useEffect(() => {
    clearInteractionAutoCloseTimer();

    if (!isInteractionOverlayOpen || !shouldAutoContinueInteraction) {
      return;
    }

    // Auto-close passive interaction markers to keep playback moving.
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

  const handleFullscreen = useCallback(() => {
    const target = sectionRef.current;
    if (!target) {
      return;
    }

    if (document.fullscreenElement === target) {
      document.exitFullscreen().catch(() => {});
      return;
    }

    target.requestFullscreen?.().catch(() => {});
  }, []);

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
    pendingInteractionOverlayStepIndexRef.current = null;
    setHasPlayerInteracted(true);
    setIsAudioLoadingVisible(false);
    showPlayerControls(true);
    resetAudioSequence();
    goPrev();
  }, [goPrev, resetAudioSequence, showPlayerControls]);

  const handleNext = useCallback(() => {
    shouldScrollToBottomRef.current = true;
    pendingInteractionOverlayStepIndexRef.current = null;
    setHasPlayerInteracted(true);
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
      const endedAudioKey = audioList[audioIndex]?.audioKey;

      if (!endedAudioKey || !currentAudioKey) {
        return;
      }

      if (endedAudioKey !== currentAudioKey) {
        return;
      }

      const activeSequencePosition = currentAudioSequenceKeys.findIndex(
        (audioSequenceKey) => audioSequenceKey === endedAudioKey
      );
      if (activeSequencePosition < 0) {
        setCurrentAudioKey(null);
        return;
      }

      const nextSequencePosition = activeSequencePosition + 1;
      const nextAudioKey = currentAudioSequenceKeys[nextSequencePosition];

      if (nextAudioKey) {
        setCurrentAudioKey(nextAudioKey);
        return;
      }

      setCurrentAudioKey(null);
      setHasCompletedCurrentStepAudio(true);
      setIsAudioLoadingVisible(false);

      if (canGoNext) {
        const nextStepIndex = currentIndex + 1;
        const nextStepElement = slideElementList[nextStepIndex];

        if (hasCurrentStepAudioUrl && nextStepElement?.type === "interaction") {
          pendingInteractionOverlayStepIndexRef.current = nextStepIndex;
        }

        goNext();
      }
    },
    [
      audioList,
      canGoNext,
      currentIndex,
      currentAudioKey,
      currentAudioSequenceKeys,
      goNext,
      hasCurrentStepAudioUrl,
      slideElementList,
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
    },
    [onPointerDown]
  );

  const handleSurfaceClick = useCallback(() => {
    setHasPlayerInteracted(true);
    showPlayerControls(true);
  }, [showPlayerControls]);

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
      className={cn(
        "relative h-full w-full",
        isMobileLandscape && "slide--mobile-landscape",
        className
      )}
      onClick={handleSurfaceClick}
      onPointerDown={handleSurfacePointerDown}
      {...props}
    >
      <div
        ref={viewportRef}
        className={cn(
          "slide__viewport relative h-full min-h-0 w-full",
          isMobileLandscape && "slide__viewport--mobile-landscape"
        )}
      >
        {shouldShowLandscapeHeader ? (
          <div className="slide-landscape-header">
            <button
              aria-label={landscapeHeader?.backAriaLabel ?? "Back"}
              className="slide-landscape-header__back"
              onClick={handleLandscapeHeaderBack}
              type="button"
            >
              <ChevronLeft className="h-6 w-6 text-white" strokeWidth={2.25} />
            </button>

            {landscapeHeader?.content ? (
              <div className="min-w-0 flex-1 overflow-hidden">
                {landscapeHeader.content}
              </div>
            ) : null}
          </div>
        ) : null}

        <div
          className={cn(
            "h-full min-h-0 w-full",
            shouldApplyLandscapeViewportPadding &&
              "slide__viewport-content--with-header",
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
          <LoadingOverlayCard
            message={bufferingText}
            className="absolute left-1/2 top-1/2 z-[3] -translate-x-1/2 -translate-y-1/2"
          />
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
            style={interactionOverlayStyle}
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
            defaultPlaying
            isPlaybackPaused={shouldPausePlaybackForCustomAction}
            isAutoAdvanceEnabled={isAutoAdvanceEnabled}
            hasInteraction={Boolean(activeInteractionElement)}
            isInteractionOpen={isInteractionOverlayOpen}
            onAutoAdvanceToggle={setIsAutoAdvanceEnabled}
            onLoadingChange={handlePlayerLoadingChange}
            nextDisabled={!canGoNext}
            onEnded={handlePlayerEnded}
            onFullscreen={handleFullscreen}
            isFullscreen={isFullscreen}
            mobileScreenMode={mobileScreenMode}
            settingsPortalContainer={viewportRef.current}
            onMobileScreenModeChange={setMobileScreenMode}
            onInteractionToggle={handleInteractionToggle}
            onNext={handleNext}
            onPrev={handlePrev}
            prevDisabled={!canGoPrev}
            showControls={playerVisible}
            texts={playerTexts}
            customActionContext={playerCustomActionContext}
            customActions={playerCustomActions}
            useAutoAdvanceToggle={shouldUseSilentStepAutoAdvanceToggle}
          />
        ) : null}
      </div>
    </section>
  );
};

export default Slide;
