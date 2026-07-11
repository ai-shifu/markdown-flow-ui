import React, {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronLeft } from "lucide-react";

import { isSandboxInteractionMessage } from "../../lib/sandboxInteraction";
import { cn } from "../../lib/utils";
import type { MarkdownFlowLocale } from "../../lib/locale";
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
import {
  isLandscapeViewport as getIsFullscreenPreferredViewport,
  isMobileDevice as getIsMobileDevice,
  subscribeMobileDeviceChange,
} from "../../lib/mobileDevice";
import Player from "./Player";
import SubtitleOverlay from "./SubtitleOverlay";
import type {
  PlayerProps,
  SlidePlayerNavigationContext,
  SlidePlayerSubtitleJumpTarget,
  SlidePlayerSubtitleSeekRequest,
  SlidePlayerTexts,
} from "./Player";
import type { SlidePlayerLoadingReason } from "./Player";
import type { Element } from "./types";
import useSlide from "./useSlide";
import useWakePlayerFromIframe from "./useWakePlayerFromIframe";
import { PlayerKeyboardShortcutContext } from "./utils/playerKeyboardShortcutContext";
import { activatePlayerKeyboardShortcutOwner } from "./utils/playerKeyboardShortcuts";
import {
  DEFAULT_MOBILE_VIEW_MODE,
  resolveMobileViewModeState,
  type MobileViewMode,
} from "./utils/mobileScreenMode";
import { shouldPresentInteractionOverlay } from "./utils/interactionPlayback";
import { shouldWakePlayerControlsAfterNavigation } from "./utils/playerNavigationContext";
import { shouldAutoAdvanceIntoAppendedMarker } from "./utils/appendedMarkerAdvance";
import {
  getPlaybackSequenceTransition,
  shouldStartDefaultAudioSequence,
} from "./utils/playbackSequence";
import {
  canReachSubtitleJumpTarget,
  hasResolvedInteractionElement,
} from "./utils/subtitleJumpNavigation";
import {
  getPlayerCustomActionCount,
  resolvePlayerCustomActionElement,
} from "./utils/playerCustomActions";
import { createPlaybackTimeStore } from "./utils/playbackTimeStore";
import { shouldUseAutoAdvanceToggle } from "./utils/playerToggleMode";
import {
  areImageOnlyStepIframeVisualsReady,
  DEFAULT_IMAGE_ONLY_VISUAL_READY_TIMEOUT_MS,
} from "./utils/imageOnlyStepVisualReady";
import { resolveSilentStepAutoAdvanceDelay } from "./utils/silentStepAutoAdvance";
import {
  resolveSlidePlayerVisibility,
  type SlidePlayerControlsVisibility,
} from "./utils/playerVisibility";
import {
  DEFAULT_SLIDE_BUFFERING_TEXTS,
  getSlideLocaleTexts,
  type SlideBufferingReason,
} from "./slideI18n";
import "./slide.css";
export type {
  Element,
  ElementAudioSegment,
  ElementSubtitleCue,
  SlidePlayerCustomActionContext,
  SlidePlayerCustomActions,
} from "./types";
export type { SlidePlayerControlsVisibility } from "./utils/playerVisibility";

const DEFAULT_MARKER_AUTO_ADVANCE_DELAY_MS = 2000;
const DEFAULT_INTERACTION_OVERLAY_OPEN_DELAY_MS = 300;
const DEFAULT_INTERACTION_OVERLAY_FALLBACK_OFFSET_PX = 160;
const DEFAULT_INTERACTION_SUBTITLE_GAP_PX = 16;
const DEFAULT_BUFFERING_REASON: SlideBufferingReason = "waitingForAudio";

export type { SlideBufferingReason } from "./slideI18n";

export type SlideBufferingTextConfig =
  | string
  | Partial<Record<SlideBufferingReason, string>>;

const resolveBufferingTextByReason = (
  bufferingText: SlideBufferingTextConfig,
  reason: SlideBufferingReason
) => {
  if (typeof bufferingText === "string") {
    return bufferingText;
  }

  return (
    bufferingText[reason] ??
    bufferingText[DEFAULT_BUFFERING_REASON] ??
    DEFAULT_SLIDE_BUFFERING_TEXTS[reason]
  );
};

const mergeBufferingTextWithLocaleDefaults = (
  bufferingText: SlideBufferingTextConfig | undefined,
  localeBufferingText: Record<string, string>
): SlideBufferingTextConfig => {
  if (typeof bufferingText === "string") {
    return bufferingText;
  }

  return {
    ...localeBufferingText,
    ...bufferingText,
  };
};

const shouldShowBufferingOverlay = (
  reason: SlideBufferingReason | null,
  loading: boolean
) => {
  if (!loading) {
    return false;
  }

  // Keep the silent preload/loading phase invisible until audio is actually playable.
  return reason !== "loadingAudio";
};

type RenderSlideElementOptions = {
  replaceRootScreenHeightWithFull?: boolean;
};

interface InteractionOverlayCardProps {
  content: string;
  title: string;
  locale?: MarkdownFlowLocale;
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

export type SlideFullscreenHeader = {
  content?: React.ReactNode;
  backAriaLabel?: string;
  onBack?: () => void;
};

const InteractionOverlayCard = memo(
  ({
    content,
    title,
    locale,
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
          locale={locale}
          defaultButtonText={defaultButtonText}
          defaultInputText={defaultInputText}
          defaultSelectedValues={defaultSelectedValues}
          confirmButtonText={confirmButtonText}
          copyButtonText={copyButtonText}
          copiedButtonText={copiedButtonText}
          onSend={onSend}
          readonly={readonly}
          sandboxMode="content"
        />
      </div>
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
  /** Locale used for built-in UI text when a more specific text prop is not provided. */
  locale?: MarkdownFlowLocale;
  /** Enables the player runtime, including audio playback and keyboard shortcuts. */
  playerEnabled?: boolean;
  /**
   * Controls whether the player controls are always visible, always hidden, or auto-hidden.
   *
   * Use `"hidden"` to keep audio playback and keyboard shortcuts active while
   * hiding the visual controls.
   *
   * @example
   * ```tsx
   * <Slide playerControlsVisibility="hidden" enableKeyboardShortcuts />
   * ```
   */
  playerControlsVisibility?: SlidePlayerControlsVisibility;
  playerClassName?: string;
  fullscreenHeader?: SlideFullscreenHeader;
  playerCustomActions?: PlayerProps["customActions"];
  playerCustomActionPauseOnActive?: boolean;
  bufferingText?: SlideBufferingTextConfig;
  interactionTitle?: string;
  interactionTexts?: SlideInteractionTexts;
  playerTexts?: SlidePlayerTexts;
  playerAutoHideDelay?: number;
  markerAutoAdvanceDelay?: number;
  interactionDefaultValueOptions?: InteractionDefaultValueOptions;
  onSend?: (content: OnSendContentParams, element?: Element) => void;
  onPlayerVisibilityChange?: (visible: boolean) => void;
  onMobileViewModeChange?: (viewMode: MobileViewMode) => void;
  onStepChange?: (element: Element | undefined, index: number) => void;
  /**
   * Enables keyboard shortcuts for existing player actions.
   *
   * Defaults to `true`. The active slide responds after users click, touch, or
   * focus the slide/player surface; ignored targets include form controls and
   * interaction overlays.
   *
   * @example
   * ```tsx
   * <Slide elementList={slides} enableKeyboardShortcuts={false} />
   * ```
   */
  enableKeyboardShortcuts?: boolean;
  enableIframeScaling?: boolean;
  disableLoadingOverlay?: boolean;
}

const Slide: React.FC<SlideProps> = ({
  elementList = [],
  locale,
  playerEnabled,
  playerControlsVisibility,
  playerClassName,
  fullscreenHeader,
  playerCustomActions,
  playerCustomActionPauseOnActive = true,
  bufferingText,
  interactionTitle,
  interactionTexts,
  playerTexts,
  playerAutoHideDelay = 3000,
  markerAutoAdvanceDelay = DEFAULT_MARKER_AUTO_ADVANCE_DELAY_MS,
  interactionDefaultValueOptions,
  onSend,
  onPlayerVisibilityChange,
  onMobileViewModeChange,
  onStepChange,
  enableKeyboardShortcuts = true,
  enableIframeScaling = true,
  disableLoadingOverlay = false,
  className,
  onPointerDown,
  onFocusCapture,
  ...props
}) => {
  const localeTexts = useMemo(() => getSlideLocaleTexts(locale), [locale]);
  const resolvedBufferingText = useMemo(
    () =>
      mergeBufferingTextWithLocaleDefaults(
        bufferingText,
        localeTexts.bufferingText
      ),
    [bufferingText, localeTexts.bufferingText]
  );
  const {
    playerEnabled: resolvedPlayerEnabled,
    playerControlsVisibility: resolvedPlayerControlsVisibility,
  } = resolveSlidePlayerVisibility({
    playerEnabled,
    playerControlsVisibility,
  });
  const keyboardShortcutOwnerId = useId();
  const sectionRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const stageLayerRef = useRef<HTMLDivElement | null>(null);
  const lastElementRef = useRef<HTMLDivElement | null>(null);
  const playerHideTimerRef = useRef<number | null>(null);
  const isPointerInsidePlayerControlsRef = useRef(false);
  const autoAdvanceTimerRef = useRef<number | null>(null);
  const imageOnlyStepReadyTimeoutRef = useRef<number | null>(null);
  const interactionAutoCloseTimerRef = useRef<number | null>(null);
  const interactionOverlayOpenTimerRef = useRef<number | null>(null);
  const interactionOverlayRef = useRef<HTMLDivElement | null>(null);
  const prevRenderElementKeysRef = useRef<string[]>([]);
  const shouldScrollToBottomRef = useRef(false);
  const pendingInteractionOverlayStepIndexRef = useRef<number | null>(null);
  const pendingSubtitleJumpRef = useRef<{
    audioIndex: number;
    audioKey: string;
    slideIndex: number;
    timeMs: number;
  } | null>(null);
  const subtitleSeekRequestIdRef = useRef(0);
  const playbackResetKeyRef = useRef<string | null>(null);
  const appendedMarkerAdvanceStateRef = useRef({
    markerCount: 0,
    currentIndex: -1,
    canGoNext: false,
  });
  const shouldSkipDefaultAudioStartForSubtitleJumpRef = useRef(false);
  const {
    currentElementList,
    stepElementLists,
    slideElementList,
    currentIndex,
    audioList,
    audioSlideIndexes,
    currentAudioSequenceIndexes,
    currentStepHasSpeakableElement,
    currentInteractionElement,
    canGoPrev,
    canGoNext,
    handlePrev: goPrev,
    handleNext: goNext,
    handleGoTo: goTo,
  } = useSlide(elementList);
  const currentStepElement = useMemo(() => {
    if (currentIndex < 0) {
      return undefined;
    }

    return slideElementList[currentIndex];
  }, [currentIndex, slideElementList]);
  const currentRenderElementKeys = useMemo(
    () =>
      currentElementList.map(
        (element, index) =>
          `${element.sequence_number ?? `${element.type}-${index}`}:${String(element.is_new ?? "")}`
      ),
    [currentElementList]
  );
  const visibleMarkerCount = slideElementList.filter(
    (element) => element.is_renderable !== false
  ).length;
  const isSingleSlide = visibleMarkerCount === 1;
  const shouldMountPlayer =
    resolvedPlayerEnabled &&
    (slideElementList.length > 0 ||
      audioList.length > 0 ||
      Boolean(currentInteractionElement));
  const keyboardShortcutContextValue = useMemo(
    () => ({
      enabled: enableKeyboardShortcuts,
      ownerId: keyboardShortcutOwnerId,
    }),
    [enableKeyboardShortcuts, keyboardShortcutOwnerId]
  );
  const activateKeyboardShortcutOwner = useCallback(() => {
    if (!enableKeyboardShortcuts || !shouldMountPlayer) {
      return;
    }

    activatePlayerKeyboardShortcutOwner(keyboardShortcutOwnerId);
  }, [enableKeyboardShortcuts, keyboardShortcutOwnerId, shouldMountPlayer]);
  const currentAudioSequenceKeys = useMemo(
    () =>
      currentAudioSequenceIndexes
        .map((audioIndex) => audioList[audioIndex]?.audioKey)
        .filter((audioKey): audioKey is string => Boolean(audioKey)),
    [audioList, currentAudioSequenceIndexes]
  );
  const [isPlayerVisible, setIsPlayerVisible] = useState(true);
  const [hasPlayerInteracted, setHasPlayerInteracted] = useState(false);
  const [isPlaybackRequested, setIsPlaybackRequested] = useState(true);
  const [isAutoAdvanceEnabled, setIsAutoAdvanceEnabled] = useState(true);
  const [currentAudioKey, setCurrentAudioKey] = useState<string | null>(null);
  const [subtitleSeekRequest, setSubtitleSeekRequest] =
    useState<SlidePlayerSubtitleSeekRequest | null>(null);
  const [isAudioLoadingVisible, setIsAudioLoadingVisible] = useState(false);
  const [audioLoadingReason, setAudioLoadingReason] =
    useState<SlideBufferingReason>(DEFAULT_BUFFERING_REASON);
  const [hasCompletedCurrentStepAudio, setHasCompletedCurrentStepAudio] =
    useState(false);
  const [hasCurrentAudioPlaybackStarted, setHasCurrentAudioPlaybackStarted] =
    useState(false);
  const [isSubtitleEnabled, setIsSubtitleEnabled] = useState(true);
  const [isPlayerCustomActionActive, setIsPlayerCustomActionActive] =
    useState(false);
  const [activeInteractionElement, setActiveInteractionElement] = useState<
    Element | undefined
  >();
  const [isInteractionOverlayOpen, setIsInteractionOverlayOpen] =
    useState(false);
  const [
    interactionOverlaySubtitleOffset,
    setInteractionOverlaySubtitleOffset,
  ] = useState(0);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);
  const isMobileDevice = useMemo(() => getIsMobileDevice(), []);
  const [mobileViewMode, setMobileViewMode] = useState<MobileViewMode>(
    DEFAULT_MOBILE_VIEW_MODE
  );
  const [hasManualMobileViewMode, setHasManualMobileViewMode] = useState(false);
  const [isViewportFullscreenPreferred, setIsViewportFullscreenPreferred] =
    useState(() =>
      isMobileDevice ? getIsFullscreenPreferredViewport() : false
    );
  const playbackTimeStore = useMemo(() => createPlaybackTimeStore(), []);
  const {
    effectiveMobileViewMode,
    isImmersiveMobileFullscreen,
    isNativeMobileFullscreen,
    shouldRotateFullscreenViewport,
  } = useMemo(
    () =>
      resolveMobileViewModeState({
        hasManualMobileViewMode,
        isMobileDevice,
        isViewportFullscreenPreferred,
        mobileViewMode,
      }),
    [
      hasManualMobileViewMode,
      isMobileDevice,
      isViewportFullscreenPreferred,
      mobileViewMode,
    ]
  );
  const previousEffectiveMobileViewModeRef = useRef(effectiveMobileViewMode);
  const playerControlsVisible =
    shouldMountPlayer &&
    resolvedPlayerControlsVisibility !== "hidden" &&
    (resolvedPlayerControlsVisibility === "visible" || isPlayerVisible);
  const shouldShowFullscreenHeader =
    isImmersiveMobileFullscreen && playerControlsVisible;
  const shouldApplyFullscreenViewportPadding =
    isImmersiveMobileFullscreen && playerControlsVisible;
  const shouldShowMobileFullscreenMask =
    isImmersiveMobileFullscreen || isNativeMobileFullscreen;
  const isDesktopBrowserFullscreen = isBrowserFullscreen && !isMobileDevice;
  const handleMobileViewModeSelect = useCallback(
    (nextViewMode: MobileViewMode) => {
      setHasManualMobileViewMode(true);
      setMobileViewMode(nextViewMode);
    },
    []
  );
  const handleMobileViewModeReset = useCallback(() => {
    // Clear manual override so the effective mode returns to the default non-fullscreen state.
    setHasManualMobileViewMode(false);
    setMobileViewMode(DEFAULT_MOBILE_VIEW_MODE);
  }, []);
  const handleFullscreenHeaderBack = useCallback(() => {
    handleMobileViewModeReset();
    fullscreenHeader?.onBack?.();
  }, [fullscreenHeader, handleMobileViewModeReset]);
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
  const currentAudioItem = useMemo(
    () => (currentAudioIndex >= 0 ? audioList[currentAudioIndex] : undefined),
    [audioList, currentAudioIndex]
  );
  const currentSubtitleCues = currentAudioItem?.element?.subtitle_cues ?? [];
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
  const currentPlaybackStartedResetKey = useMemo(
    () =>
      [
        currentPlaybackResetKey,
        currentAudioItem?.audioKey ?? "none",
        String(currentAudioIndex),
      ].join("|"),
    [currentAudioIndex, currentAudioItem?.audioKey, currentPlaybackResetKey]
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
  const silentStepAutoAdvanceDelay = useMemo(
    () =>
      resolveSilentStepAutoAdvanceDelay({
        currentElementList,
        currentStepHasSpeakableElement,
        currentInteractionElement,
        markerAutoAdvanceDelay,
      }),
    [
      currentElementList,
      currentInteractionElement,
      currentStepHasSpeakableElement,
      markerAutoAdvanceDelay,
    ]
  );
  const isImageOnlySilentStep = useMemo(
    () => silentStepAutoAdvanceDelay !== markerAutoAdvanceDelay,
    [markerAutoAdvanceDelay, silentStepAutoAdvanceDelay]
  );
  const imageOnlyStepVisualReadyKey = useMemo(
    () => currentRenderElementKeys.join("|"),
    [currentRenderElementKeys]
  );
  const [readyImageOnlyStepKey, setReadyImageOnlyStepKey] = useState<
    string | null
  >(null);
  const isImageOnlyStepVisualReady =
    !isImageOnlySilentStep ||
    readyImageOnlyStepKey === imageOnlyStepVisualReadyKey;

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

  const clearInteractionOverlayOpenTimer = useCallback(() => {
    if (interactionOverlayOpenTimerRef.current === null) {
      return;
    }

    window.clearTimeout(interactionOverlayOpenTimerRef.current);
    interactionOverlayOpenTimerRef.current = null;
  }, []);

  const clearAutoAdvanceTimer = useCallback(() => {
    if (autoAdvanceTimerRef.current === null) {
      return;
    }

    window.clearTimeout(autoAdvanceTimerRef.current);
    autoAdvanceTimerRef.current = null;
  }, []);

  const clearImageOnlyStepReadyTimeout = useCallback(() => {
    if (imageOnlyStepReadyTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(imageOnlyStepReadyTimeoutRef.current);
    imageOnlyStepReadyTimeoutRef.current = null;
  }, []);

  const resetAudioSequence = useCallback(
    (
      options: {
        preservePendingSubtitleJump?: boolean;
      } = {}
    ) => {
      clearAutoAdvanceTimer();
      clearInteractionAutoCloseTimer();
      clearInteractionOverlayOpenTimer();
      clearImageOnlyStepReadyTimeout();
      setCurrentAudioKey(null);
      playbackTimeStore.reset();
      setIsAudioLoadingVisible(false);
      setAudioLoadingReason(DEFAULT_BUFFERING_REASON);
      setHasCompletedCurrentStepAudio(false);
      setHasCurrentAudioPlaybackStarted(false);
      setSubtitleSeekRequest(null);
      if (!options.preservePendingSubtitleJump) {
        pendingSubtitleJumpRef.current = null;
      }
      setActiveInteractionElement(undefined);
      setIsInteractionOverlayOpen(false);
      setInteractionOverlaySubtitleOffset(0);
    },
    [
      clearAutoAdvanceTimer,
      clearImageOnlyStepReadyTimeout,
      clearInteractionAutoCloseTimer,
      clearInteractionOverlayOpenTimer,
      playbackTimeStore,
    ]
  );

  const requestSubtitleCueSeek = useCallback(
    (target: SlidePlayerSubtitleJumpTarget) => {
      subtitleSeekRequestIdRef.current += 1;
      setSubtitleSeekRequest({
        ...target,
        id: subtitleSeekRequestIdRef.current,
      });
    },
    []
  );

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
    clearInteractionOverlayOpenTimer();
    setIsInteractionOverlayOpen(false);
    setInteractionOverlaySubtitleOffset(0);

    if (startCurrentAudioSequence()) {
      return;
    }

    if (canGoNext) {
      goNext();
    }
  }, [
    canGoNext,
    clearInteractionAutoCloseTimer,
    clearInteractionOverlayOpenTimer,
    goNext,
    startCurrentAudioSequence,
  ]);

  const scheduleInteractionOverlayOpen = useCallback(
    (interactionElement?: Element) => {
      clearInteractionOverlayOpenTimer();

      if (!interactionElement) {
        return;
      }

      const openOverlay = () => {
        interactionOverlayOpenTimerRef.current = null;
        setInteractionOverlaySubtitleOffset(
          DEFAULT_INTERACTION_OVERLAY_FALLBACK_OFFSET_PX
        );
        setIsInteractionOverlayOpen(true);
        pendingInteractionOverlayStepIndexRef.current = null;
      };

      interactionOverlayOpenTimerRef.current = window.setTimeout(
        openOverlay,
        DEFAULT_INTERACTION_OVERLAY_OPEN_DELAY_MS
      );
    },
    [clearInteractionOverlayOpenTimer]
  );

  const isPlayerControlsHovered = useCallback(
    () =>
      isPointerInsidePlayerControlsRef.current ||
      Boolean(
        sectionRef.current?.querySelector(".slide-player__controls:hover")
      ),
    []
  );

  const revealPlayerControls = useCallback(
    (enableAutoHide = hasPlayerInteracted) => {
      if (!shouldMountPlayer || resolvedPlayerControlsVisibility === "hidden") {
        return;
      }

      setIsPlayerVisible(true);
      clearPlayerHideTimer();

      if (
        resolvedPlayerControlsVisibility === "visible" ||
        !enableAutoHide ||
        playerAutoHideDelay <= 0 ||
        isPlayerControlsHovered()
      ) {
        return;
      }

      playerHideTimerRef.current = window.setTimeout(() => {
        if (isPlayerControlsHovered()) {
          playerHideTimerRef.current = null;
          return;
        }

        setIsPlayerVisible(false);
        playerHideTimerRef.current = null;
      }, playerAutoHideDelay);
    },
    [
      clearPlayerHideTimer,
      hasPlayerInteracted,
      isPlayerControlsHovered,
      playerAutoHideDelay,
      resolvedPlayerControlsVisibility,
      shouldMountPlayer,
    ]
  );

  const hasResolvedCurrentInteraction = Boolean(
    hasResolvedInteractionElement(currentInteractionElement)
  );

  const shouldBlockPlaybackForInteraction =
    Boolean(currentInteractionElement) && !hasResolvedCurrentInteraction;

  const handlePlaybackPreferenceChange = useCallback((playing: boolean) => {
    setIsPlaybackRequested(playing);
  }, []);

  const syncPlaybackPreferenceBeforeNavigation = useCallback(
    (context?: SlidePlayerNavigationContext) => {
      const shouldContinuePlayback =
        context?.shouldContinuePlayback ?? isPlaybackRequested;

      setIsPlaybackRequested(shouldContinuePlayback);
    },
    [isPlaybackRequested]
  );

  useEffect(() => {
    // Keep silent-step autoplay aligned with the same play/pause preference as audio.
    setIsAutoAdvanceEnabled(isPlaybackRequested);

    if (playerCustomActionPauseOnActive) {
      setIsPlayerCustomActionActive(false);
    }
  }, [currentIndex, isPlaybackRequested, playerCustomActionPauseOnActive]);

  useEffect(() => {
    return () => {
      clearAutoAdvanceTimer();
      clearImageOnlyStepReadyTimeout();
      clearPlayerHideTimer();
      clearInteractionAutoCloseTimer();
      clearInteractionOverlayOpenTimer();
    };
  }, [
    clearAutoAdvanceTimer,
    clearImageOnlyStepReadyTimeout,
    clearInteractionAutoCloseTimer,
    clearInteractionOverlayOpenTimer,
    clearPlayerHideTimer,
  ]);

  useEffect(() => {
    if (!isImageOnlySilentStep) {
      clearImageOnlyStepReadyTimeout();
      return;
    }

    let cancelled = false;
    let rafId: number | null = null;
    let cleanupListeners: (() => void) | null = null;

    const detachListeners = () => {
      cleanupListeners?.();
      cleanupListeners = null;
    };

    const finishVisualReady = () => {
      if (cancelled) {
        return;
      }

      detachListeners();
      clearImageOnlyStepReadyTimeout();
      setReadyImageOnlyStepKey(imageOnlyStepVisualReadyKey);
    };

    const evaluateVisualReady = () => {
      if (cancelled) {
        return;
      }

      detachListeners();

      const activeStepContainer = stageLayerRef.current?.querySelector(
        '[data-active-step="true"]'
      ) as HTMLElement | null;

      if (!activeStepContainer) {
        return;
      }

      const iframeElements = Array.from(
        activeStepContainer.querySelectorAll("iframe")
      ) as HTMLIFrameElement[];

      if (
        iframeElements.length === 0 ||
        areImageOnlyStepIframeVisualsReady(iframeElements)
      ) {
        finishVisualReady();
        return;
      }

      const cleanupCallbacks: Array<() => void> = [];
      const queueRecheck = () => {
        if (cancelled) {
          return;
        }

        if (rafId !== null) {
          window.cancelAnimationFrame(rafId);
        }

        rafId = window.requestAnimationFrame(() => {
          rafId = null;
          evaluateVisualReady();
        });
      };
      const registerEvent = (
        target: EventTarget,
        eventName: string,
        listener: EventListener
      ) => {
        target.addEventListener(eventName, listener, { once: true });
        cleanupCallbacks.push(() =>
          target.removeEventListener(eventName, listener)
        );
      };

      iframeElements.forEach((iframeElement) => {
        const iframeDocument = iframeElement.contentDocument;

        if (!iframeDocument || iframeDocument.readyState !== "complete") {
          registerEvent(iframeElement, "load", queueRecheck);
          return;
        }

        Array.from(iframeDocument.images)
          .filter((image) => !image.complete)
          .forEach((image) => {
            registerEvent(image, "load", queueRecheck);
            registerEvent(image, "error", queueRecheck);
          });
      });

      cleanupListeners = () => {
        cleanupCallbacks.forEach((cleanup) => cleanup());
      };
    };

    rafId = window.requestAnimationFrame(() => {
      rafId = null;
      evaluateVisualReady();
    });

    imageOnlyStepReadyTimeoutRef.current = window.setTimeout(() => {
      finishVisualReady();
    }, DEFAULT_IMAGE_ONLY_VISUAL_READY_TIMEOUT_MS);

    return () => {
      cancelled = true;
      detachListeners();
      clearImageOnlyStepReadyTimeout();
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [
    clearImageOnlyStepReadyTimeout,
    currentElementList,
    currentIndex,
    imageOnlyStepVisualReadyKey,
    isImageOnlySilentStep,
  ]);

  useEffect(() => {
    onPlayerVisibilityChange?.(playerControlsVisible);

    return () => {
      onPlayerVisibilityChange?.(false);
    };
  }, [onPlayerVisibilityChange, playerControlsVisible]);

  useEffect(() => {
    if (playerControlsVisible) {
      return;
    }

    isPointerInsidePlayerControlsRef.current = false;
  }, [playerControlsVisible]);

  useEffect(() => {
    if (isMobileDevice || mobileViewMode === DEFAULT_MOBILE_VIEW_MODE) {
      return;
    }

    setHasManualMobileViewMode(false);
    setMobileViewMode(DEFAULT_MOBILE_VIEW_MODE);
  }, [isMobileDevice, mobileViewMode]);

  useEffect(() => {
    if (!isMobileDevice) {
      setIsViewportFullscreenPreferred(false);
      return;
    }

    const syncViewportFullscreenPreference = () => {
      setIsViewportFullscreenPreferred(getIsFullscreenPreferredViewport());
    };

    syncViewportFullscreenPreference();

    return subscribeMobileDeviceChange(syncViewportFullscreenPreference);
  }, [isMobileDevice]);

  useEffect(() => {
    onMobileViewModeChange?.(effectiveMobileViewMode);
  }, [effectiveMobileViewMode, onMobileViewModeChange]);

  useEffect(() => {
    previousEffectiveMobileViewModeRef.current = effectiveMobileViewMode;
  }, [effectiveMobileViewMode]);

  useEffect(() => {
    onStepChange?.(currentStepElement, currentIndex);
  }, [currentIndex, currentStepElement, onStepChange]);

  useEffect(() => {
    const previousState = appendedMarkerAdvanceStateRef.current;
    const shouldAdvanceIntoAppendedMarker = shouldAutoAdvanceIntoAppendedMarker(
      {
        previousMarkerCount: previousState.markerCount,
        nextMarkerCount: slideElementList.length,
        previousIndex: previousState.currentIndex,
        previousCanGoNext: previousState.canGoNext,
        nextCanGoNext: canGoNext,
        currentAudioKey,
        hasCompletedCurrentStepAudio,
        hasResolvedCurrentInteraction,
        currentStepHasSpeakableElement,
        currentInteractionElement,
        isAutoAdvanceEnabled,
        shouldUseSilentStepAutoAdvanceToggle,
      }
    );

    appendedMarkerAdvanceStateRef.current = {
      markerCount: slideElementList.length,
      currentIndex,
      canGoNext,
    };

    if (!shouldAdvanceIntoAppendedMarker) {
      return;
    }

    goNext();
  }, [
    canGoNext,
    currentAudioKey,
    currentIndex,
    currentInteractionElement,
    currentStepHasSpeakableElement,
    goNext,
    hasCompletedCurrentStepAudio,
    hasResolvedCurrentInteraction,
    isAutoAdvanceEnabled,
    shouldUseSilentStepAutoAdvanceToggle,
    slideElementList.length,
  ]);

  useEffect(() => {
    if (!shouldMountPlayer || resolvedPlayerControlsVisibility === "hidden") {
      clearPlayerHideTimer();
      setIsPlayerVisible(false);
      return;
    }

    if (resolvedPlayerControlsVisibility === "visible") {
      clearPlayerHideTimer();
      setIsPlayerVisible(true);
      return;
    }

    if (!hasPlayerInteracted) {
      // Keep the initial player visible briefly, then hide it automatically.
      revealPlayerControls(true);
    }
  }, [
    clearPlayerHideTimer,
    hasPlayerInteracted,
    resolvedPlayerControlsVisibility,
    shouldMountPlayer,
    revealPlayerControls,
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

      if (event.data.eventType !== "click") {
        return;
      }

      if (!shouldMountPlayer) {
        return;
      }

      // Restore player controls on explicit click/tap without waking on scroll start.
      activateKeyboardShortcutOwner();
      setHasPlayerInteracted(true);
      revealPlayerControls(true);
    };

    window.addEventListener("message", handleSandboxInteraction);

    return () => {
      window.removeEventListener("message", handleSandboxInteraction);
    };
  }, [activateKeyboardShortcutOwner, shouldMountPlayer, revealPlayerControls]);

  useWakePlayerFromIframe({
    sectionRef,
    enabled: shouldMountPlayer,
    keyboardShortcutsEnabled: enableKeyboardShortcuts,
    onKeyboardShortcut: activateKeyboardShortcutOwner,
    onWake: () => {
      activateKeyboardShortcutOwner();
      setHasPlayerInteracted(true);
      revealPlayerControls(true);
    },
  });

  useEffect(() => {
    if (!shouldMountPlayer) {
      resetAudioSequence();
      return;
    }

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

    const pendingSubtitleJump = pendingSubtitleJumpRef.current;
    const shouldPreservePendingSubtitleJump =
      pendingSubtitleJump?.slideIndex === currentIndex;

    if (hasPlaybackContextChanged) {
      resetAudioSequence({
        preservePendingSubtitleJump: shouldPreservePendingSubtitleJump,
      });
    }

    if (currentElementList.length === 0 && !currentInteractionElement) {
      return;
    }

    if (shouldPausePlaybackForCustomAction) {
      return;
    }

    if (pendingSubtitleJump?.slideIndex === currentIndex) {
      if (
        !canReachSubtitleJumpTarget({
          currentIndex,
          resolvedCurrentInteractionElement: activeInteractionElement,
          slideElementList,
          targetSlideIndex: pendingSubtitleJump.slideIndex,
        })
      ) {
        // Keep the pending seek queued while the interaction overlay gates playback.
      } else {
        pendingSubtitleJumpRef.current = null;
        // The default audio-start effect still sees the pre-seek render state.
        // Skip it once so it does not replace the subtitle target audio.
        shouldSkipDefaultAudioStartForSubtitleJumpRef.current = true;
        setCurrentAudioKey(pendingSubtitleJump.audioKey);
        requestSubtitleCueSeek({
          audioIndex: pendingSubtitleJump.audioIndex,
          timeMs: pendingSubtitleJump.timeMs,
        });
        return;
      }
    }

    if (currentInteractionElement) {
      setActiveInteractionElement(currentInteractionElement);
    }

    if (shouldPresentOverlay) {
      // Delay auto-presenting the overlay so subtitles can settle above it.
      scheduleInteractionOverlayOpen(currentInteractionElement);
      return;
    }

    clearInteractionOverlayOpenTimer();
    pendingInteractionOverlayStepIndexRef.current = null;

    if (!shouldInitializeAudioSequence) {
      return;
    }

    if (startCurrentAudioSequence()) {
      return;
    }

    if (currentStepHasSpeakableElement) {
      if (disableLoadingOverlay) {
        setIsAudioLoadingVisible(false);
        return;
      }

      setIsAudioLoadingVisible(true);
      return;
    }

    if (!canGoNext) {
      return;
    }

    if (shouldUseSilentStepAutoAdvanceToggle && !isAutoAdvanceEnabled) {
      return;
    }

    if (isImageOnlySilentStep && !isImageOnlyStepVisualReady) {
      return;
    }

    // Auto-advance silent marker-only steps so playback flow does not stall.
    autoAdvanceTimerRef.current = window.setTimeout(() => {
      autoAdvanceTimerRef.current = null;
      goNext();
    }, silentStepAutoAdvanceDelay);

    return () => {
      clearAutoAdvanceTimer();
    };
  }, [
    activeInteractionElement,
    canGoNext,
    clearAutoAdvanceTimer,
    currentElementList.length,
    currentIndex,
    currentInteractionElement,
    currentAudioKey,
    currentPlaybackResetKey,
    currentStepHasSpeakableElement,
    isImageOnlySilentStep,
    isImageOnlyStepVisualReady,
    markerAutoAdvanceDelay,
    silentStepAutoAdvanceDelay,
    goNext,
    hasCompletedCurrentStepAudio,
    disableLoadingOverlay,
    isAutoAdvanceEnabled,
    hasResolvedCurrentInteraction,
    shouldBlockPlaybackForInteraction,
    clearInteractionOverlayOpenTimer,
    resetAudioSequence,
    requestSubtitleCueSeek,
    scheduleInteractionOverlayOpen,
    shouldMountPlayer,
    slideElementList,
    startCurrentAudioSequence,
    shouldPausePlaybackForCustomAction,
    shouldUseSilentStepAutoAdvanceToggle,
  ]);

  useEffect(() => {
    if (
      disableLoadingOverlay ||
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

    setAudioLoadingReason("waitingForAudio");
    setIsAudioLoadingVisible(true);
  }, [
    hasAvailableStepAudio,
    currentStepHasSpeakableElement,
    hasCompletedCurrentStepAudio,
    disableLoadingOverlay,
    shouldPausePlaybackForCustomAction,
    shouldBlockPlaybackForInteraction,
  ]);

  useEffect(() => {
    const shouldSkipDefaultAudioStart =
      shouldSkipDefaultAudioStartForSubtitleJumpRef.current;
    shouldSkipDefaultAudioStartForSubtitleJumpRef.current = false;

    if (
      !shouldStartDefaultAudioSequence({
        currentAudioKey,
        currentAudioSequenceLength: currentAudioSequenceKeys.length,
        currentStepHasSpeakableElement,
        hasCompletedCurrentStepAudio,
        shouldBlockPlaybackForInteraction,
        shouldPausePlaybackForCustomAction,
        shouldSkipDefaultAudioStart,
      })
    ) {
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

  useEffect(() => {
    if (currentAudioIndex >= 0) {
      return;
    }

    playbackTimeStore.reset();
  }, [currentAudioIndex, playbackTimeStore]);

  useEffect(() => {
    setHasCurrentAudioPlaybackStarted(false);
  }, [currentPlaybackStartedResetKey]);

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
  const shouldShowInteractionOverlay =
    Boolean(activeInteractionElement) && isInteractionOverlayOpen;

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
      setIsBrowserFullscreen(document.fullscreenElement === sectionRef.current);
    };

    syncFullscreenState();
    document.addEventListener("fullscreenchange", syncFullscreenState);

    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreenState);
    };
  }, []);

  useEffect(() => {
    if (!shouldShowInteractionOverlay) {
      setInteractionOverlaySubtitleOffset(0);
      return;
    }

    const interactionOverlayElement = interactionOverlayRef.current;

    if (!interactionOverlayElement) {
      return;
    }

    const updateSubtitleOffset = () => {
      const overlayHeight = Math.ceil(
        interactionOverlayElement.getBoundingClientRect().height
      );

      setInteractionOverlaySubtitleOffset(
        overlayHeight + DEFAULT_INTERACTION_SUBTITLE_GAP_PX
      );
    };

    updateSubtitleOffset();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      updateSubtitleOffset();
    });

    resizeObserver.observe(interactionOverlayElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [shouldShowInteractionOverlay]);

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
          disableLoadingOverlay={disableLoadingOverlay}
          hideFullScreen
          locale={locale}
          mode="blackboard"
          replaceRootScreenHeightWithFull={
            options.replaceRootScreenHeightWithFull
          }
          type="sandbox"
          content={element.content as string}
          enableScaling={enableIframeScaling}
        />
      );
    }

    return (
      <IframeSandbox
        className="content-render-iframe"
        disableLoadingOverlay={disableLoadingOverlay}
        hideFullScreen
        locale={locale}
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

  const canJumpToSubtitleTarget = useCallback(
    (target: SlidePlayerSubtitleJumpTarget) =>
      canReachSubtitleJumpTarget({
        currentIndex,
        resolvedCurrentInteractionElement: activeInteractionElement,
        slideElementList,
        targetSlideIndex: audioSlideIndexes[target.audioIndex],
      }),
    [
      activeInteractionElement,
      audioSlideIndexes,
      currentIndex,
      slideElementList,
    ]
  );

  const handleSubtitleJump = useCallback(
    (
      target: SlidePlayerSubtitleJumpTarget,
      context: SlidePlayerNavigationContext
    ) => {
      const targetAudio = audioList[target.audioIndex];
      const targetAudioKey = targetAudio?.audioKey;
      const targetSlideIndex = audioSlideIndexes[target.audioIndex];

      if (!targetAudioKey || targetSlideIndex == null) {
        return false;
      }

      if (!canJumpToSubtitleTarget(target)) {
        return false;
      }

      syncPlaybackPreferenceBeforeNavigation(context);
      pendingInteractionOverlayStepIndexRef.current = null;
      setIsAudioLoadingVisible(false);
      setHasCompletedCurrentStepAudio(false);
      setHasCurrentAudioPlaybackStarted(false);

      if (shouldWakePlayerControlsAfterNavigation(context)) {
        setHasPlayerInteracted(true);
        revealPlayerControls(true);
      }

      if (targetSlideIndex === currentIndex) {
        pendingSubtitleJumpRef.current = null;
        resetAudioSequence();
        setCurrentAudioKey(targetAudioKey);
        requestSubtitleCueSeek(target);
        return true;
      }

      shouldScrollToBottomRef.current = true;
      resetAudioSequence();
      pendingSubtitleJumpRef.current = {
        audioIndex: target.audioIndex,
        audioKey: targetAudioKey,
        slideIndex: targetSlideIndex,
        timeMs: target.timeMs,
      };
      goTo(targetSlideIndex);

      return true;
    },
    [
      audioList,
      audioSlideIndexes,
      canJumpToSubtitleTarget,
      currentIndex,
      goTo,
      requestSubtitleCueSeek,
      resetAudioSequence,
      revealPlayerControls,
      syncPlaybackPreferenceBeforeNavigation,
    ]
  );

  const handlePrev = useCallback(
    (context?: SlidePlayerNavigationContext) => {
      syncPlaybackPreferenceBeforeNavigation(context);
      shouldScrollToBottomRef.current = true;
      pendingInteractionOverlayStepIndexRef.current = null;
      setIsAudioLoadingVisible(false);
      if (shouldWakePlayerControlsAfterNavigation(context)) {
        setHasPlayerInteracted(true);
        revealPlayerControls(true);
      }
      resetAudioSequence();
      goPrev();
    },
    [
      goPrev,
      resetAudioSequence,
      revealPlayerControls,
      syncPlaybackPreferenceBeforeNavigation,
    ]
  );

  const handleNext = useCallback(
    (context?: SlidePlayerNavigationContext) => {
      syncPlaybackPreferenceBeforeNavigation(context);
      shouldScrollToBottomRef.current = true;
      pendingInteractionOverlayStepIndexRef.current = null;
      setIsAudioLoadingVisible(false);
      if (shouldWakePlayerControlsAfterNavigation(context)) {
        setHasPlayerInteracted(true);
        revealPlayerControls(true);
      }
      resetAudioSequence();
      goNext();
    },
    [
      goNext,
      resetAudioSequence,
      revealPlayerControls,
      syncPlaybackPreferenceBeforeNavigation,
    ]
  );

  const handlePlayerLoadingChange = useCallback(
    ({
      loading,
      reason,
    }: {
      loading: boolean;
      reason: SlidePlayerLoadingReason | null;
    }) => {
      if (disableLoadingOverlay) {
        setIsAudioLoadingVisible(false);
        return;
      }

      if (!currentStepHasSpeakableElement || hasCompletedCurrentStepAudio) {
        setIsAudioLoadingVisible(false);
        return;
      }

      if (loading && reason) {
        setAudioLoadingReason(reason);
      }
      setIsAudioLoadingVisible(shouldShowBufferingOverlay(reason, loading));
    },
    [
      currentStepHasSpeakableElement,
      hasCompletedCurrentStepAudio,
      disableLoadingOverlay,
    ]
  );

  useEffect(() => {
    if (!disableLoadingOverlay) {
      return;
    }

    setIsAudioLoadingVisible(false);
  }, [disableLoadingOverlay]);

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
        return;
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

  const handlePlayerControlsPointerEnter = useCallback(() => {
    isPointerInsidePlayerControlsRef.current = true;
    clearPlayerHideTimer();

    if (shouldMountPlayer) {
      setIsPlayerVisible(true);
    }
  }, [clearPlayerHideTimer, shouldMountPlayer]);

  const handlePlayerControlsPointerLeave = useCallback(() => {
    isPointerInsidePlayerControlsRef.current = false;
    revealPlayerControls(true);
  }, [revealPlayerControls]);

  const stopOverlayPropagation = useCallback(
    (
      event:
        | React.PointerEvent<HTMLDivElement>
        | React.MouseEvent<HTMLDivElement>
    ) => {
      event.stopPropagation();

      // Keep the player visible a bit longer when users interact with the overlay.
      if (playerControlsVisible) {
        revealPlayerControls(true);
      }
    },
    [playerControlsVisible, revealPlayerControls]
  );

  const handleSurfacePointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      activateKeyboardShortcutOwner();
      onPointerDown?.(event);
    },
    [activateKeyboardShortcutOwner, onPointerDown]
  );

  const handleSurfaceFocusCapture = useCallback(
    (event: React.FocusEvent<HTMLElement>) => {
      activateKeyboardShortcutOwner();
      onFocusCapture?.(event);
    },
    [activateKeyboardShortcutOwner, onFocusCapture]
  );

  const handleSurfaceClick = useCallback(() => {
    setHasPlayerInteracted(true);
    revealPlayerControls(true);
  }, [revealPlayerControls]);
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
        isMobileDevice && "slide--mobile-device",
        isDesktopBrowserFullscreen && "slide--browser-fullscreen",
        isImmersiveMobileFullscreen && "slide--mobile-landscape",
        isNativeMobileFullscreen && "slide--mobile-landscape-native",
        className
      )}
      onClick={handleSurfaceClick}
      onFocusCapture={handleSurfaceFocusCapture}
      onPointerDown={handleSurfacePointerDown}
      {...props}
    >
      {shouldShowMobileFullscreenMask ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-[9999] h-[100vh] max-h-[100vh] w-[100vw]"
        />
      ) : null}

      <div
        ref={viewportRef}
        className={cn(
          "slide__viewport relative h-full min-h-0 w-full",
          isImmersiveMobileFullscreen && "slide__viewport--mobile-landscape",
          isImmersiveMobileFullscreen &&
            !shouldRotateFullscreenViewport &&
            "slide__viewport--mobile-landscape-native"
        )}
      >
        {shouldShowFullscreenHeader ? (
          <div className="slide-landscape-header">
            <button
              aria-label={
                fullscreenHeader?.backAriaLabel ??
                localeTexts.fullscreenBackAriaLabel
              }
              className="slide-landscape-header__back"
              onClick={handleFullscreenHeaderBack}
              type="button"
            >
              <ChevronLeft
                className="slide-landscape-header__icon h-6 w-6"
                strokeWidth={2.25}
              />
            </button>

            {fullscreenHeader?.content ? (
              <div className="min-w-0 flex-1 overflow-hidden">
                {fullscreenHeader.content}
              </div>
            ) : null}
          </div>
        ) : null}

        <div
          className={cn(
            "h-full min-h-0 w-full",
            shouldApplyFullscreenViewportPadding &&
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
                        data-active-step={isActiveStep ? "true" : undefined}
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
            message={resolveBufferingTextByReason(
              resolvedBufferingText,
              audioLoadingReason
            )}
            className="absolute left-1/2 top-1/2 z-[3] -translate-x-1/2 -translate-y-1/2"
          />
        ) : null}

        <SubtitleOverlay
          extraBottomOffset={interactionOverlaySubtitleOffset}
          hasPlayerGap={playerControlsVisible}
          isEnabled={isSubtitleEnabled && hasCurrentAudioPlaybackStarted}
          isPlayerHidden={shouldMountPlayer && !playerControlsVisible}
          playbackTimeStore={playbackTimeStore}
          subtitleCues={currentSubtitleCues}
        />

        {shouldShowInteractionOverlay ? (
          <div
            ref={interactionOverlayRef}
            data-player-keyboard-shortcuts-ignore="true"
            className={cn(
              "slide-interaction-overlay",
              playerControlsVisible && shouldMountPlayer
                ? "slide-interaction-overlay--with-player"
                : "slide-interaction-overlay--standalone"
            )}
            onClick={stopOverlayPropagation}
            onPointerDown={stopOverlayPropagation}
            style={interactionOverlayStyle}
          >
            <InteractionOverlayCard
              content={String(activeInteractionElement?.content ?? "")}
              locale={locale}
              defaultButtonText={interactionDefaults.buttonText ?? ""}
              defaultInputText={interactionDefaults.inputText ?? ""}
              defaultSelectedValues={interactionDefaultSelectedValues}
              confirmButtonText={
                interactionTexts?.confirmButtonText ??
                localeTexts.interactionTexts.confirmButtonText
              }
              copyButtonText={
                interactionTexts?.copyButtonText ??
                localeTexts.interactionTexts.copyButtonText
              }
              copiedButtonText={
                interactionTexts?.copiedButtonText ??
                localeTexts.interactionTexts.copiedButtonText
              }
              onSend={handleInteractionSend}
              readonly={isInteractionReadonly}
              title={
                interactionTexts?.title ??
                interactionTitle ??
                localeTexts.interactionTexts.title
              }
            />
          </div>
        ) : null}

        {shouldMountPlayer ? (
          <PlayerKeyboardShortcutContext.Provider
            value={keyboardShortcutContextValue}
          >
            <Player
              audioList={audioList}
              className={cn(
                "absolute left-1/2 z-[2] -translate-x-1/2",
                isDesktopBrowserFullscreen ? "bottom-3" : "-bottom-3",
                playerClassName,
                !playerControlsVisible && "pointer-events-none opacity-0"
              )}
              currentAudioIndex={currentAudioIndex}
              defaultPlaying={isPlaybackRequested}
              enableKeyboardShortcuts={enableKeyboardShortcuts}
              isPlaybackPaused={shouldPausePlaybackForCustomAction}
              isAutoAdvanceEnabled={isAutoAdvanceEnabled}
              locale={locale}
              hasInteraction={Boolean(activeInteractionElement)}
              isInteractionOpen={isInteractionOverlayOpen}
              isSubtitleEnabled={isSubtitleEnabled}
              onAutoAdvanceToggle={setIsAutoAdvanceEnabled}
              onLoadingChange={handlePlayerLoadingChange}
              onPlaybackStarted={() => {
                setHasCurrentAudioPlaybackStarted(true);
              }}
              onPlaybackPreferenceChange={handlePlaybackPreferenceChange}
              onPlaybackTimeChange={playbackTimeStore.setTime}
              onSubtitleToggle={() => {
                setIsSubtitleEnabled((previousEnabled) => !previousEnabled);
              }}
              nextDisabled={!canGoNext}
              onEnded={handlePlayerEnded}
              onFullscreen={handleFullscreen}
              isFullscreen={isBrowserFullscreen}
              mobileViewMode={effectiveMobileViewMode}
              settingsPortalContainer={viewportRef.current}
              onMobileViewModeChange={handleMobileViewModeSelect}
              onControlsPointerEnter={handlePlayerControlsPointerEnter}
              onControlsPointerLeave={handlePlayerControlsPointerLeave}
              onInteractionToggle={handleInteractionToggle}
              onNext={handleNext}
              onPrev={handlePrev}
              onSubtitleJump={handleSubtitleJump}
              canJumpToSubtitleTarget={canJumpToSubtitleTarget}
              prevDisabled={!canGoPrev}
              showControls={playerControlsVisible}
              subtitleSeekRequest={subtitleSeekRequest}
              texts={playerTexts}
              customActionContext={playerCustomActionContext}
              customActions={playerCustomActions}
              useAutoAdvanceToggle={shouldUseSilentStepAutoAdvanceToggle}
            />
          </PlayerKeyboardShortcutContext.Provider>
        ) : null}
      </div>
    </section>
  );
};

export default Slide;
