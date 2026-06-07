import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Captions,
  CaptionsOff,
  EllipsisVertical,
  FilePenLine,
  Maximize,
  RotateCcw,
  RotateCw,
  ScanLine,
  Volume2,
} from "lucide-react";

import { cn } from "../../lib/utils";
import MobilePlayerSettingsSheet from "./MobilePlayerSettingsSheet";
import { DEFAULT_SLIDE_PLAYER_TEXTS } from "./constants";
import type { SlideAudioItem } from "./useSlide";
import type {
  SlidePlayerCustomActionContext,
  SlidePlayerCustomActions,
} from "./types";
import {
  DEFAULT_MOBILE_VIEW_MODE,
  type MobileViewMode,
} from "./utils/mobileScreenMode";
import { hasReachedAudioEnd } from "./utils/audioCompletion";
import { PlayerKeyboardShortcutContext } from "./utils/playerKeyboardShortcutContext";
import {
  activatePlayerKeyboardShortcutOwner,
  getPlayerKeyboardShortcutAction,
  isActivePlayerKeyboardShortcutOwner,
  registerPlayerKeyboardShortcutOwner,
  shouldIgnorePlayerKeyboardShortcutEvent,
  type PlayerKeyboardShortcutAction,
} from "./utils/playerKeyboardShortcuts";
import {
  resolveAudioPlaybackSourceType,
  type AudioPlaybackSourceType,
} from "./utils/playbackSource";
import { shouldKeepPlayingAfterNavigation } from "./utils/playbackPreference";
import { toPlayerCustomActionList } from "./utils/playerCustomActions";
import { suppressPlayerControlsWakeAfterNavigation } from "./utils/playerNavigationContext";
import "./player.css";

const audioPreloadElementCache = new Map<string, HTMLAudioElement>();

/**
 * Labels and accessibility text used by the slide player controls.
 *
 * Missing fields fall back to `DEFAULT_SLIDE_PLAYER_TEXTS`; pass a `texts`
 * object when a consumer needs localized control labels or tooltip text.
 *
 * @example
 * ```tsx
 * <Player texts={{ playLabel: "播放", nextLabel: "下一步" }} />
 * ```
 */
export interface SlidePlayerTexts {
  closeSettingsLabel?: string;
  enterFullscreenLabel?: string;
  exitFullscreenLabel?: string;
  moreOptionsAriaLabel?: string;
  nextLabel?: string;
  notesLabel?: string;
  pauseAutoplayLabel?: string;
  pauseLabel?: string;
  playAutoplayLabel?: string;
  playLabel?: string;
  previousLabel?: string;
  screenModeLabel?: string;
  settingsTitle?: string;
  subtitleLabel?: string;
  subtitleToggleAriaLabel?: string;
  volumeAriaLabel?: string;
  screenLabel?: string;
  nonFullscreenLabel?: string;
  fullscreenLabel?: string;
  fullscreenHintText?: string;
}

export type SlidePlayerLoadingReason = "loadingAudio" | "waitingForMoreAudio";

export interface SlidePlayerNavigationContext {
  shouldContinuePlayback: boolean;
  /** Set false when navigation should not reveal hidden player controls. */
  shouldWakeControls?: boolean;
}

const preloadAudioUrl = (url?: string) => {
  if (typeof window === "undefined" || !url) {
    return;
  }

  if (audioPreloadElementCache.has(url)) {
    return;
  }

  // Use a detached audio element so warm-up follows the same media loading
  // path as the visible player instead of relying on link preload hints.
  const audio = window.document.createElement("audio");
  audio.preload = "auto";
  audio.setAttribute("playsinline", "true");
  audio.src = url;
  audio.load();

  audioPreloadElementCache.set(url, audio);
};

export type PlayerProps = Omit<React.ComponentProps<"div">, "onEnded"> & {
  audioList?: SlideAudioItem[];
  currentAudioIndex?: number;
  defaultPlaying?: boolean;
  isPlaybackPaused?: boolean;
  isAutoAdvanceEnabled?: boolean;
  useAutoAdvanceToggle?: boolean;
  onLoadingChange?: (state: {
    loading: boolean;
    reason: SlidePlayerLoadingReason | null;
  }) => void;
  onPlaybackPreferenceChange?: (playing: boolean) => void;
  onPlaybackStarted?: () => void;
  onPlaybackTimeChange?: (timeMs: number) => void;
  onSubtitleToggle?: () => void;
  onPrev?: (context: SlidePlayerNavigationContext) => void;
  onNext?: (context: SlidePlayerNavigationContext) => void;
  onFullscreen?: () => void;
  isFullscreen?: boolean;
  mobileViewMode?: MobileViewMode;
  settingsPortalContainer?: HTMLElement | null;
  onMobileViewModeChange?: (viewMode: MobileViewMode) => void;
  onEnded?: (audioIndex: number) => void;
  onAutoAdvanceToggle?: (enabled: boolean) => void;
  onInteractionToggle?: () => void;
  hasInteraction?: boolean;
  isInteractionOpen?: boolean;
  isSubtitleEnabled?: boolean;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  showControls?: boolean;
  /**
   * Enables document-level keyboard shortcuts for existing player actions.
   *
   * Defaults to `true`. Set to `false` when the page should not advertise or
   * handle player shortcuts for this standalone player instance.
   *
   * @example
   * ```tsx
   * <Player enableKeyboardShortcuts={false} />
   * ```
   */
  enableKeyboardShortcuts?: boolean;
  customActions?: SlidePlayerCustomActions;
  customActionContext?: SlidePlayerCustomActionContext;
  texts?: SlidePlayerTexts;
};

const PauseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="34"
    height="34"
    viewBox="0 0 34 34"
    fill="none"
  >
    <path
      d="M16.6667 33.3333C25.8714 33.3333 33.3333 25.8714 33.3333 16.6667C33.3333 7.46192 25.8714 0 16.6667 0C7.46192 0 0 7.46192 0 16.6667C0 25.8714 7.46192 33.3333 16.6667 33.3333Z"
      fill="#0A0A0A"
    />
    <path d="M12 10H16V24H12V10ZM18 10H22V24H18V10Z" fill="white" />
  </svg>
);

const PlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="34"
    height="34"
    viewBox="0 0 34 34"
    fill="none"
  >
    <path
      d="M16.6667 33.3333C25.8714 33.3333 33.3333 25.8714 33.3333 16.6667C33.3333 7.46192 25.8714 0 16.6667 0C7.46192 0 0 7.46192 0 16.6667C0 25.8714 7.46192 33.3333 16.6667 33.3333Z"
      fill="#0A0A0A"
    />
    <path d="M13.3333 10L23.3333 16.6667L13.3333 23.3333V10Z" fill="white" />
  </svg>
);

const PLAYER_SHORTCUT_LABELS = {
  fullscreen: "F",
  next: "→",
  notes: "N",
  playback: "Space",
  previous: "←",
  subtitle: "C",
} as const;

const getShortcutTitle = (label: string | undefined, shortcut: string) =>
  label ? `${label} (${shortcut})` : shortcut;

const Player = ({
  audioList = [],
  className,
  currentAudioIndex = -1,
  defaultPlaying = true,
  isPlaybackPaused = false,
  isAutoAdvanceEnabled = true,
  useAutoAdvanceToggle = false,
  onLoadingChange,
  onPlaybackPreferenceChange,
  onPlaybackStarted,
  onPlaybackTimeChange,
  onSubtitleToggle,
  onPrev,
  onNext,
  onFullscreen,
  isFullscreen = false,
  mobileViewMode = DEFAULT_MOBILE_VIEW_MODE,
  settingsPortalContainer,
  onMobileViewModeChange,
  onEnded,
  onAutoAdvanceToggle,
  onInteractionToggle,
  hasInteraction = false,
  isInteractionOpen = false,
  isSubtitleEnabled = true,
  prevDisabled = false,
  nextDisabled = false,
  showControls = true,
  enableKeyboardShortcuts = true,
  customActions,
  customActionContext,
  texts,
  onFocusCapture,
  onPointerDown,
  ...props
}: PlayerProps) => {
  const localKeyboardShortcutOwnerId = useId();
  const keyboardShortcutContext = useContext(PlayerKeyboardShortcutContext);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousInteractionOpenRef = useRef(isInteractionOpen);
  const audioSrcRef = useRef<string | null>(null);
  const currentAudioKeyRef = useRef<string | null>(null);
  const currentSegmentIndexRef = useRef(0);
  const waitingSegmentIndexRef = useRef<number | null>(null);
  const currentAudioRef = useRef<SlideAudioItem | undefined>(undefined);
  const currentAudioSegmentsRef = useRef<
    NonNullable<SlideAudioItem["audioSegments"]>
  >([]);
  const playbackPreferenceRef = useRef(
    useAutoAdvanceToggle ? isAutoAdvanceEnabled : defaultPlaying
  );
  const wasPlayingBeforeExternalPauseRef = useRef(false);
  const isLoadingRef = useRef(false);
  const isPausedByUserRef = useRef(false);
  const activeSourceTypeRef = useRef<"url" | "segment" | null>(null);
  const preferredSourceTypeRef = useRef<AudioPlaybackSourceType | null>(null);
  const isWaitingForSegmentRef = useRef(false);
  const pendingAutoPlayRef = useRef(false);
  const pendingSeekTimeRef = useRef<number | null>(null);
  const isSwitchingSegmentRef = useRef(false);
  const playbackAnimationFrameRef = useRef<number | null>(null);
  const playbackTimeMsRef = useRef(0);
  const playbackAccessModeRef = useRef<
    "unknown" | "auto" | "manual" | "blocked"
  >("unknown");
  const [isPlaying, setIsPlaying] = useState(defaultPlaying);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const keyboardShortcutOwnerId =
    keyboardShortcutContext?.ownerId ?? localKeyboardShortcutOwnerId;
  const shouldEnableKeyboardShortcuts =
    enableKeyboardShortcuts && (keyboardShortcutContext?.enabled ?? true);
  const currentAudio =
    currentAudioIndex >= 0 ? audioList[currentAudioIndex] : undefined;
  const currentAudioUrl = currentAudio?.audioUrl;
  const currentAudioSegments = useMemo(
    () =>
      [...(currentAudio?.audioSegments ?? [])].sort(
        (prevSegment, nextSegment) =>
          prevSegment.segment_index - nextSegment.segment_index
      ),
    [currentAudio?.audioSegments]
  );
  const customActionList = useMemo(
    () => toPlayerCustomActionList(customActions, customActionContext),
    [customActionContext, customActions]
  );
  const mobileVisibleActionCount = customActionList.length + 5;
  const controlsStyle = useMemo(
    () =>
      ({
        "--slide-player-mobile-control-count": String(mobileVisibleActionCount),
      }) as React.CSSProperties,
    [mobileVisibleActionCount]
  );
  const playerTexts = useMemo(
    () => ({
      ...DEFAULT_SLIDE_PLAYER_TEXTS,
      ...texts,
    }),
    [texts]
  );
  const currentAudioKey = useMemo(() => {
    if (!currentAudio) {
      return "none";
    }

    return (
      currentAudio.audioKey ??
      `${String(currentAudio.sequenceNumber ?? "none")}:${String(currentAudio.audioUrl ?? "")}`
    );
  }, [currentAudio]);
  const isTogglePlaying = useAutoAdvanceToggle
    ? isAutoAdvanceEnabled
    : isPlaying;
  const toggleAriaLabel = useAutoAdvanceToggle
    ? isAutoAdvanceEnabled
      ? playerTexts.pauseAutoplayLabel
      : playerTexts.playAutoplayLabel
    : isPlaying
      ? playerTexts.pauseLabel
      : playerTexts.playLabel;
  const fullscreenAriaLabel = isFullscreen
    ? playerTexts.exitFullscreenLabel
    : playerTexts.enterFullscreenLabel;
  const getShortcutMetadata = useCallback(
    (label: string | undefined, shortcutText: string, ariaKey: string) => ({
      ariaKeyShortcuts: shouldEnableKeyboardShortcuts ? ariaKey : undefined,
      title: shouldEnableKeyboardShortcuts
        ? getShortcutTitle(label, shortcutText)
        : label,
    }),
    [shouldEnableKeyboardShortcuts]
  );
  const subtitleShortcutMetadata = getShortcutMetadata(
    playerTexts.subtitleToggleAriaLabel,
    PLAYER_SHORTCUT_LABELS.subtitle,
    "c"
  );
  const previousShortcutMetadata = getShortcutMetadata(
    playerTexts.previousLabel,
    PLAYER_SHORTCUT_LABELS.previous,
    "ArrowLeft"
  );
  const playbackShortcutMetadata = getShortcutMetadata(
    toggleAriaLabel,
    PLAYER_SHORTCUT_LABELS.playback,
    "Space"
  );
  const nextShortcutMetadata = getShortcutMetadata(
    playerTexts.nextLabel,
    PLAYER_SHORTCUT_LABELS.next,
    "ArrowRight"
  );
  const fullscreenShortcutMetadata = getShortcutMetadata(
    fullscreenAriaLabel,
    PLAYER_SHORTCUT_LABELS.fullscreen,
    "f"
  );
  const notesShortcutMetadata = getShortcutMetadata(
    playerTexts.notesLabel,
    PLAYER_SHORTCUT_LABELS.notes,
    "n"
  );
  const activateKeyboardShortcutOwner = useCallback(() => {
    if (!shouldEnableKeyboardShortcuts) {
      return;
    }

    activatePlayerKeyboardShortcutOwner(keyboardShortcutOwnerId);
  }, [keyboardShortcutOwnerId, shouldEnableKeyboardShortcuts]);

  const handleRootPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      activateKeyboardShortcutOwner();
      onPointerDown?.(event);
    },
    [activateKeyboardShortcutOwner, onPointerDown]
  );

  const handleRootFocusCapture = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      activateKeyboardShortcutOwner();
      onFocusCapture?.(event);
    },
    [activateKeyboardShortcutOwner, onFocusCapture]
  );

  useEffect(() => {
    currentAudioRef.current = currentAudio;
  }, [currentAudio]);

  useEffect(() => {
    playbackPreferenceRef.current = useAutoAdvanceToggle
      ? isAutoAdvanceEnabled
      : defaultPlaying;
  }, [defaultPlaying, isAutoAdvanceEnabled, useAutoAdvanceToggle]);

  useEffect(() => {
    if (showControls) {
      return;
    }

    setIsMobileMoreOpen(false);
  }, [showControls]);

  useEffect(() => {
    if (!previousInteractionOpenRef.current && isInteractionOpen) {
      setIsMobileMoreOpen(false);
    }

    previousInteractionOpenRef.current = isInteractionOpen;
  }, [isInteractionOpen]);

  useEffect(() => {
    currentAudioSegmentsRef.current = currentAudioSegments;
  }, [currentAudioSegments]);

  useEffect(() => {
    const currentUrl = currentAudio?.audioUrl;
    const nextUrl =
      currentAudioIndex >= 0
        ? audioList[currentAudioIndex + 1]?.audioUrl
        : undefined;

    preloadAudioUrl(currentUrl);
    preloadAudioUrl(nextUrl);
  }, [audioList, currentAudio?.audioUrl, currentAudioIndex]);

  const updateLoading = useCallback(
    (loading: boolean, reason: SlidePlayerLoadingReason | null = null) => {
      if (isLoadingRef.current === loading && (!loading || reason === null)) {
        return;
      }

      isLoadingRef.current = loading;
      onLoadingChange?.({
        loading,
        reason: loading ? reason : null,
      });
    },
    [onLoadingChange]
  );

  const updatePlaybackPreference = useCallback(
    (playing: boolean) => {
      playbackPreferenceRef.current = playing;
      onPlaybackPreferenceChange?.(playing);
    },
    [onPlaybackPreferenceChange]
  );

  const getNavigationContext = useCallback((): SlidePlayerNavigationContext => {
    if (useAutoAdvanceToggle) {
      return {
        shouldContinuePlayback: playbackPreferenceRef.current,
      };
    }

    return {
      shouldContinuePlayback: shouldKeepPlayingAfterNavigation({
        defaultPlaying: playbackPreferenceRef.current,
        isPausedByUser: isPausedByUserRef.current,
      }),
    };
  }, [useAutoAdvanceToggle]);

  const isAutoplayBlockedError = useCallback((error: unknown) => {
    if (!(error instanceof DOMException)) {
      return false;
    }

    return error.name === "NotAllowedError" || error.name === "SecurityError";
  }, []);

  const canStartPlaybackAutomatically = useCallback(() => {
    return (
      defaultPlaying &&
      !isPlaybackPaused &&
      !isPausedByUserRef.current &&
      playbackAccessModeRef.current !== "blocked"
    );
  }, [defaultPlaying, isPlaybackPaused]);

  const getSegmentSrc = useCallback((audioData: string) => {
    if (!audioData) {
      return "";
    }

    if (audioData.startsWith("data:")) {
      return audioData;
    }

    return `data:audio/mpeg;base64,${audioData}`;
  }, []);

  const getWaitingSegmentSeekTime = useCallback(() => {
    const waitingSegmentIndex = waitingSegmentIndexRef.current;

    if (waitingSegmentIndex == null || waitingSegmentIndex <= 0) {
      return 0;
    }

    return (
      currentAudioSegmentsRef.current
        .slice(0, waitingSegmentIndex)
        .reduce(
          (totalDurationMs, segment) =>
            totalDurationMs + Math.max(Number(segment.duration_ms ?? 0), 0),
          0
        ) / 1000
    );
  }, []);

  const getSegmentStartTimeMs = useCallback((segmentIndex: number) => {
    if (segmentIndex <= 0) {
      return 0;
    }

    return currentAudioSegmentsRef.current
      .slice(0, segmentIndex)
      .reduce(
        (totalDurationMs, segment) =>
          totalDurationMs + Math.max(Number(segment.duration_ms ?? 0), 0),
        0
      );
  }, []);

  const getCurrentPlaybackTimeMs = useCallback(() => {
    const audioElement = audioRef.current;

    if (!audioElement) {
      return waitingSegmentIndexRef.current != null
        ? getSegmentStartTimeMs(waitingSegmentIndexRef.current)
        : 0;
    }

    if (activeSourceTypeRef.current === "segment") {
      return (
        getSegmentStartTimeMs(currentSegmentIndexRef.current) +
        Math.max(audioElement.currentTime, 0) * 1000
      );
    }

    if (pendingSeekTimeRef.current !== null && audioElement.readyState === 0) {
      return pendingSeekTimeRef.current * 1000;
    }

    return Math.max(audioElement.currentTime, 0) * 1000;
  }, [getSegmentStartTimeMs]);

  const publishPlaybackTime = useCallback(
    (timeMs: number) => {
      const nextPlaybackTimeMs = Math.max(timeMs, 0);

      if (playbackTimeMsRef.current === nextPlaybackTimeMs) {
        return;
      }

      playbackTimeMsRef.current = nextPlaybackTimeMs;
      onPlaybackTimeChange?.(nextPlaybackTimeMs);
    },
    [onPlaybackTimeChange]
  );

  const syncPlaybackTime = useCallback(() => {
    publishPlaybackTime(getCurrentPlaybackTimeMs());
  }, [getCurrentPlaybackTimeMs, publishPlaybackTime]);

  const stopPlaybackTimeLoop = useCallback(() => {
    if (
      typeof window === "undefined" ||
      playbackAnimationFrameRef.current === null
    ) {
      return;
    }

    window.cancelAnimationFrame(playbackAnimationFrameRef.current);
    playbackAnimationFrameRef.current = null;
  }, []);

  const startPlaybackTimeLoop = useCallback(() => {
    if (
      typeof window === "undefined" ||
      playbackAnimationFrameRef.current !== null
    ) {
      return;
    }

    const updateFrame = () => {
      syncPlaybackTime();

      const audioElement = audioRef.current;

      if (!audioElement || audioElement.paused || audioElement.ended) {
        playbackAnimationFrameRef.current = null;
        return;
      }

      playbackAnimationFrameRef.current =
        window.requestAnimationFrame(updateFrame);
    };

    playbackAnimationFrameRef.current =
      window.requestAnimationFrame(updateFrame);
  }, [syncPlaybackTime]);

  const resetAudio = useCallback(() => {
    const audioElement = audioRef.current;

    if (!audioElement) {
      return;
    }

    stopPlaybackTimeLoop();
    pendingAutoPlayRef.current = false;
    isPausedByUserRef.current = false;
    wasPlayingBeforeExternalPauseRef.current = false;
    activeSourceTypeRef.current = null;
    pendingSeekTimeRef.current = null;
    isWaitingForSegmentRef.current = false;
    isSwitchingSegmentRef.current = false;
    preferredSourceTypeRef.current = null;
    audioElement.pause();
    audioElement.removeAttribute("src");
    audioElement.load();
    audioSrcRef.current = null;
    currentSegmentIndexRef.current = 0;
    waitingSegmentIndexRef.current = null;
    publishPlaybackTime(0);
    setIsPlaying(false);
    updateLoading(false);
  }, [publishPlaybackTime, stopPlaybackTimeLoop, updateLoading]);

  const tryPlayCurrentAudio = useCallback(
    (_reason: string) => {
      const audioElement = audioRef.current;

      if (!audioElement) {
        return false;
      }

      const playPromise = audioElement.play();

      if (playPromise && typeof playPromise.then === "function") {
        void playPromise
          .then(() => {
            if (playbackAccessModeRef.current === "unknown") {
              playbackAccessModeRef.current = "auto";
            }

            pendingAutoPlayRef.current = false;
            isSwitchingSegmentRef.current = false;
          })
          .catch((error: unknown) => {
            if (
              playbackAccessModeRef.current === "unknown" &&
              isAutoplayBlockedError(error)
            ) {
              // Lock autoplay after the first browser rejection.
              playbackAccessModeRef.current = "blocked";
              pendingAutoPlayRef.current = false;
              updateLoading(false);
            }

            isSwitchingSegmentRef.current = false;
            setIsPlaying(false);
          });
      }

      return true;
    },
    [isAutoplayBlockedError, updateLoading]
  );

  const startSegmentPlayback = useCallback(
    (segmentIndex: number, _reason: string) => {
      const audioElement = audioRef.current;
      const segment = currentAudioSegmentsRef.current[segmentIndex];

      if (!audioElement || !segment) {
        return false;
      }

      const nextAudioSrc = getSegmentSrc(segment.audio_data);

      currentSegmentIndexRef.current = segmentIndex;
      waitingSegmentIndexRef.current = null;
      isWaitingForSegmentRef.current = false;
      isSwitchingSegmentRef.current = true;
      preferredSourceTypeRef.current = "segment";
      publishPlaybackTime(getSegmentStartTimeMs(segmentIndex));
      const shouldAutoResume = canStartPlaybackAutomatically();

      pendingAutoPlayRef.current = shouldAutoResume;
      updateLoading(false);

      const hasNewSrc = audioSrcRef.current !== nextAudioSrc;

      activeSourceTypeRef.current = "segment";

      if (hasNewSrc) {
        audioElement.pause();
        audioElement.removeAttribute("src");
        audioElement.load();
        audioSrcRef.current = nextAudioSrc;
        audioElement.src = nextAudioSrc;
        audioElement.load();
      }

      pendingSeekTimeRef.current = 0;

      if (audioElement.readyState > 0) {
        audioElement.currentTime = 0;
        pendingSeekTimeRef.current = null;
      }

      if (!shouldAutoResume) {
        pendingAutoPlayRef.current = false;
        isSwitchingSegmentRef.current = false;
        audioElement.pause();
        setIsPlaying(false);
        return true;
      }

      return tryPlayCurrentAudio(`start-segment:${_reason}`);
    },
    [
      canStartPlaybackAutomatically,
      getSegmentSrc,
      getSegmentStartTimeMs,
      publishPlaybackTime,
      tryPlayCurrentAudio,
      updateLoading,
    ]
  );

  const finishAudioItem = useCallback(
    (_reason?: string) => {
      stopPlaybackTimeLoop();
      pendingAutoPlayRef.current = false;
      isWaitingForSegmentRef.current = false;
      isSwitchingSegmentRef.current = false;
      syncPlaybackTime();
      setIsPlaying(false);
      updateLoading(false);

      if (currentAudioIndex >= 0) {
        onEnded?.(currentAudioIndex);
      }
    },
    [
      currentAudioIndex,
      onEnded,
      stopPlaybackTimeLoop,
      syncPlaybackTime,
      updateLoading,
    ]
  );

  const finishUrlAudioIfSeekedToEnd = useCallback(
    (_reason: string) => {
      const audioElement = audioRef.current;

      if (!audioElement || activeSourceTypeRef.current !== "url") {
        return false;
      }

      if (
        !hasReachedAudioEnd({
          currentTimeSeconds: Math.max(audioElement.currentTime, 0),
          durationSeconds: audioElement.duration,
        })
      ) {
        return false;
      }

      pendingAutoPlayRef.current = false;
      audioElement.pause();
      finishAudioItem(_reason);
      return true;
    },
    [finishAudioItem]
  );

  const handleSegmentEnded = useCallback(() => {
    const nextSegmentIndex = currentSegmentIndexRef.current + 1;
    const segments = currentAudioSegmentsRef.current;
    const nextSegment = segments[nextSegmentIndex];
    const activeAudio = currentAudioRef.current;
    const hasFinal = segments.some((segment) => segment.is_final);

    if (nextSegment) {
      startSegmentPlayback(nextSegmentIndex, "ended");
      return;
    }

    if (activeAudio?.isAudioStreaming || !hasFinal) {
      currentSegmentIndexRef.current = nextSegmentIndex;
      waitingSegmentIndexRef.current = nextSegmentIndex;
      isWaitingForSegmentRef.current = true;
      pendingAutoPlayRef.current = defaultPlaying;
      publishPlaybackTime(getSegmentStartTimeMs(nextSegmentIndex));
      setIsPlaying(false);
      updateLoading(true, "waitingForMoreAudio");

      return;
    }

    finishAudioItem("segments-completed");
  }, [
    defaultPlaying,
    finishAudioItem,
    getSegmentStartTimeMs,
    publishPlaybackTime,
    startSegmentPlayback,
    updateLoading,
  ]);

  useEffect(() => {
    if (currentAudioKeyRef.current === currentAudioKey) {
      return;
    }

    currentAudioKeyRef.current = currentAudioKey;
    currentSegmentIndexRef.current = 0;
    waitingSegmentIndexRef.current = null;
    isWaitingForSegmentRef.current = false;
    isPausedByUserRef.current = false;
    wasPlayingBeforeExternalPauseRef.current = false;
    pendingAutoPlayRef.current = false;
    isSwitchingSegmentRef.current = false;
    activeSourceTypeRef.current = null;
    preferredSourceTypeRef.current = null;
    audioSrcRef.current = null;
    stopPlaybackTimeLoop();
    publishPlaybackTime(0);
    updateLoading(false);

    const audioElement = audioRef.current;

    if (!audioElement) {
      return;
    }

    audioElement.pause();
    audioElement.removeAttribute("src");
    audioElement.load();
    setIsPlaying(false);
  }, [
    currentAudioIndex,
    currentAudioKey,
    currentAudioSegments.length,
    currentAudioUrl,
    publishPlaybackTime,
    stopPlaybackTimeLoop,
    updateLoading,
  ]);

  useEffect(() => {
    const audioElement = audioRef.current;

    if (!audioElement) {
      return;
    }

    if (isPlaybackPaused) {
      wasPlayingBeforeExternalPauseRef.current = Boolean(
        currentAudioRef.current &&
        !isPausedByUserRef.current &&
        (!audioElement.paused ||
          pendingAutoPlayRef.current ||
          waitingSegmentIndexRef.current !== null)
      );

      pendingAutoPlayRef.current = false;
      updateLoading(false);
      audioElement.pause();
      setIsPlaying(false);
      return;
    }

    if (
      !wasPlayingBeforeExternalPauseRef.current ||
      !currentAudioRef.current ||
      isPausedByUserRef.current
    ) {
      return;
    }

    wasPlayingBeforeExternalPauseRef.current = false;

    if (waitingSegmentIndexRef.current !== null) {
      if (
        waitingSegmentIndexRef.current < currentAudioSegmentsRef.current.length
      ) {
        startSegmentPlayback(waitingSegmentIndexRef.current, "external-resume");
        return;
      }

      pendingAutoPlayRef.current = true;
      updateLoading(true, "waitingForMoreAudio");
      return;
    }

    if (!audioSrcRef.current && currentAudioSegmentsRef.current.length > 0) {
      startSegmentPlayback(
        Math.min(
          currentSegmentIndexRef.current,
          currentAudioSegmentsRef.current.length - 1
        ),
        "external-resume-init"
      );
      return;
    }

    if (!audioElement.paused) {
      return;
    }

    pendingAutoPlayRef.current = true;
    tryPlayCurrentAudio("external-resume");
  }, [
    isPlaybackPaused,
    startSegmentPlayback,
    tryPlayCurrentAudio,
    updateLoading,
  ]);

  useEffect(() => {
    const audioElement = audioRef.current;

    if (!audioElement) {
      return;
    }

    if (!currentAudio) {
      resetAudio();
      return;
    }

    if (isPlaybackPaused) {
      pendingAutoPlayRef.current = false;
      updateLoading(false);
      audioElement.pause();
      setIsPlaying(false);
      return;
    }

    const resolvedSourceType = resolveAudioPlaybackSourceType({
      activeSourceType: activeSourceTypeRef.current,
      hasAudioUrl: Boolean(currentAudioUrl),
      segmentCount: currentAudioSegments.length,
      preferredSourceType: preferredSourceTypeRef.current,
      waitingSegmentIndex: waitingSegmentIndexRef.current,
    });

    if (
      resolvedSourceType &&
      preferredSourceTypeRef.current !== resolvedSourceType
    ) {
      preferredSourceTypeRef.current = resolvedSourceType;
    }

    if (resolvedSourceType === "url" && currentAudioUrl) {
      const hasNewSrc = audioSrcRef.current !== currentAudioUrl;
      const shouldAutoResume = canStartPlaybackAutomatically();

      if (hasNewSrc) {
        const nextSeekTime =
          waitingSegmentIndexRef.current !== null
            ? getWaitingSegmentSeekTime()
            : 0;

        audioElement.pause();
        audioElement.removeAttribute("src");
        audioElement.load();
        audioSrcRef.current = currentAudioUrl;
        activeSourceTypeRef.current = "url";
        audioElement.src = currentAudioUrl;
        audioElement.load();
        pendingSeekTimeRef.current = nextSeekTime;
        publishPlaybackTime(nextSeekTime * 1000);

        if (audioElement.readyState > 0) {
          audioElement.currentTime = nextSeekTime;
          pendingSeekTimeRef.current = null;
        }
      }

      pendingAutoPlayRef.current = shouldAutoResume;
      isWaitingForSegmentRef.current = false;
      isSwitchingSegmentRef.current = false;
      updateLoading(false);

      if (!shouldAutoResume) {
        pendingAutoPlayRef.current = false;
        audioElement.pause();
        setIsPlaying(false);
        return;
      }

      tryPlayCurrentAudio(hasNewSrc ? "sync-url-init" : "sync-url");
      return;
    }

    if (
      resolvedSourceType === "segment" &&
      waitingSegmentIndexRef.current !== null
    ) {
      if (waitingSegmentIndexRef.current < currentAudioSegments.length) {
        if (isPausedByUserRef.current) {
          setIsPlaying(false);
          updateLoading(false);
          return;
        }

        startSegmentPlayback(waitingSegmentIndexRef.current, "wait-resume");
        return;
      }

      isWaitingForSegmentRef.current = true;
      pendingAutoPlayRef.current = canStartPlaybackAutomatically();
      setIsPlaying(false);
      updateLoading(canStartPlaybackAutomatically());
      return;
    }

    if (resolvedSourceType === "segment" && !currentAudioSegments.length) {
      if (currentAudio.isAudioStreaming) {
        waitingSegmentIndexRef.current = currentSegmentIndexRef.current;
        isWaitingForSegmentRef.current = true;
        pendingAutoPlayRef.current = canStartPlaybackAutomatically();
        setIsPlaying(false);
        updateLoading(canStartPlaybackAutomatically());
        return;
      }

      resetAudio();
      return;
    }

    if (resolvedSourceType === "segment" && !audioSrcRef.current) {
      startSegmentPlayback(
        Math.min(
          currentSegmentIndexRef.current,
          currentAudioSegments.length - 1
        ),
        "effect-init"
      );
      return;
    }

    if (resolvedSourceType !== "segment") {
      resetAudio();
      return;
    }

    if (!defaultPlaying || isPausedByUserRef.current) {
      pendingAutoPlayRef.current = false;
      audioElement.pause();
      setIsPlaying(false);
      return;
    }

    if (audioElement.paused) {
      pendingAutoPlayRef.current = true;
      tryPlayCurrentAudio("sync-paused-retry");
    }
  }, [
    currentAudio,
    currentAudioIndex,
    currentAudioSegments,
    currentAudioUrl,
    defaultPlaying,
    isPlaybackPaused,
    canStartPlaybackAutomatically,
    publishPlaybackTime,
    resetAudio,
    startSegmentPlayback,
    tryPlayCurrentAudio,
    getWaitingSegmentSeekTime,
    updateLoading,
  ]);

  useEffect(() => resetAudio, [resetAudio]);

  useEffect(() => stopPlaybackTimeLoop, [stopPlaybackTimeLoop]);

  const handleAudioPlay = useCallback(() => {
    syncPlaybackTime();
    startPlaybackTimeLoop();
    setIsPlaying(true);
    updateLoading(false);
    onPlaybackStarted?.();
  }, [
    onPlaybackStarted,
    startPlaybackTimeLoop,
    syncPlaybackTime,
    updateLoading,
  ]);

  const handleAudioPause = useCallback(() => {
    if (isWaitingForSegmentRef.current || isSwitchingSegmentRef.current) {
      return;
    }

    stopPlaybackTimeLoop();
    syncPlaybackTime();
    setIsPlaying(false);
  }, [currentAudioIndex, stopPlaybackTimeLoop, syncPlaybackTime]);

  const handleAudioCanPlay = useCallback(() => {
    const audioElement = audioRef.current;

    if (audioElement && pendingSeekTimeRef.current !== null) {
      audioElement.currentTime = pendingSeekTimeRef.current;
      pendingSeekTimeRef.current = null;
    }

    syncPlaybackTime();

    if (finishUrlAudioIfSeekedToEnd("canplay-seek-finished")) {
      return;
    }

    if (!pendingAutoPlayRef.current || !defaultPlaying) {
      return;
    }

    tryPlayCurrentAudio("canplay");
  }, [
    currentAudioIndex,
    defaultPlaying,
    finishUrlAudioIfSeekedToEnd,
    syncPlaybackTime,
    tryPlayCurrentAudio,
  ]);

  const handleLoadedMetadata = useCallback(() => {
    const audioElement = audioRef.current;

    if (audioElement && pendingSeekTimeRef.current !== null) {
      audioElement.currentTime = pendingSeekTimeRef.current;
      pendingSeekTimeRef.current = null;
    }

    syncPlaybackTime();

    finishUrlAudioIfSeekedToEnd("metadata-seek-finished");
  }, [currentAudioIndex, finishUrlAudioIfSeekedToEnd, syncPlaybackTime]);

  const handleAudioTimeUpdate = useCallback(() => {
    syncPlaybackTime();
  }, [syncPlaybackTime]);

  const handleAudioLoadStart = useCallback(() => {
    if (isWaitingForSegmentRef.current) {
      return;
    }

    updateLoading(true, "loadingAudio");
  }, [updateLoading]);

  const handleAudioWaiting = useCallback(() => {
    if (isWaitingForSegmentRef.current) {
      updateLoading(true, "waitingForMoreAudio");
      return;
    }

    updateLoading(true, "loadingAudio");
  }, [updateLoading]);

  const handleAudioSeeking = useCallback(() => {
    syncPlaybackTime();
  }, [syncPlaybackTime]);

  const handleAudioEnded = useCallback(() => {
    const shouldFinishAsUrl =
      activeSourceTypeRef.current === "url" ||
      currentAudioSegmentsRef.current.length === 0;

    stopPlaybackTimeLoop();
    isSwitchingSegmentRef.current = false;

    if (shouldFinishAsUrl) {
      finishAudioItem("url-ended");
      return;
    }

    handleSegmentEnded();
  }, [finishAudioItem, handleSegmentEnded, stopPlaybackTimeLoop]);

  const handleAudioError = useCallback(() => {
    stopPlaybackTimeLoop();
    syncPlaybackTime();
    setIsPlaying(false);
    updateLoading(false);
  }, [stopPlaybackTimeLoop, syncPlaybackTime, updateLoading]);
  const handleMobileViewModeChange = useCallback(
    (nextViewMode: MobileViewMode) => {
      onMobileViewModeChange?.(nextViewMode);
      setIsMobileMoreOpen(false);
    },
    [onMobileViewModeChange]
  );

  const togglePlayback = useCallback(() => {
    if (useAutoAdvanceToggle) {
      const nextAutoAdvanceEnabled = !isAutoAdvanceEnabled;

      updatePlaybackPreference(nextAutoAdvanceEnabled);
      onAutoAdvanceToggle?.(nextAutoAdvanceEnabled);
      return true;
    }

    const audioElement = audioRef.current;

    if (isPlaybackPaused || !audioElement || !currentAudio) {
      return false;
    }

    if (waitingSegmentIndexRef.current !== null) {
      if (isPlaying) {
        updatePlaybackPreference(false);
        pendingAutoPlayRef.current = false;
        isPausedByUserRef.current = true;
        waitingSegmentIndexRef.current = null;
        isWaitingForSegmentRef.current = false;
        setIsPlaying(false);
        updateLoading(false);
        audioElement.pause();
        return true;
      }

      updatePlaybackPreference(true);
      playbackAccessModeRef.current = "manual";
      isPausedByUserRef.current = false;
      pendingAutoPlayRef.current = true;
      updateLoading(true, "waitingForMoreAudio");
      return true;
    }

    if (!audioElement.src && currentAudioSegments.length > 0) {
      updatePlaybackPreference(true);
      playbackAccessModeRef.current = "manual";
      isPausedByUserRef.current = false;
      startSegmentPlayback(
        Math.min(
          currentSegmentIndexRef.current,
          currentAudioSegments.length - 1
        ),
        "toggle"
      );
      return true;
    }

    if (audioElement.paused) {
      updatePlaybackPreference(true);
      playbackAccessModeRef.current = "manual";
      isPausedByUserRef.current = false;
      pendingAutoPlayRef.current = true;
      tryPlayCurrentAudio("toggle-resume");
      return true;
    }

    updatePlaybackPreference(false);
    pendingAutoPlayRef.current = false;
    isPausedByUserRef.current = true;
    audioElement.pause();
    return true;
  }, [
    currentAudio,
    currentAudioSegments.length,
    isAutoAdvanceEnabled,
    isPlaybackPaused,
    isPlaying,
    onAutoAdvanceToggle,
    startSegmentPlayback,
    tryPlayCurrentAudio,
    updateLoading,
    updatePlaybackPreference,
    useAutoAdvanceToggle,
  ]);

  useEffect(() => {
    if (!shouldEnableKeyboardShortcuts) {
      return;
    }

    return registerPlayerKeyboardShortcutOwner(keyboardShortcutOwnerId);
  }, [keyboardShortcutOwnerId, shouldEnableKeyboardShortcuts]);

  const keyboardShortcutHandlers = useMemo<
    Record<PlayerKeyboardShortcutAction, () => boolean>
  >(
    () => ({
      fullscreen: () => {
        if (!onFullscreen) {
          return false;
        }

        onFullscreen();
        return true;
      },
      interaction: () => {
        if (!onInteractionToggle) {
          return false;
        }

        if (hasInteraction) {
          onInteractionToggle();
        }

        return true;
      },
      next: () => {
        if (!onNext) {
          return false;
        }

        if (!nextDisabled) {
          onNext(
            suppressPlayerControlsWakeAfterNavigation(getNavigationContext())
          );
        }

        return true;
      },
      previous: () => {
        if (!onPrev) {
          return false;
        }

        if (!prevDisabled) {
          onPrev(
            suppressPlayerControlsWakeAfterNavigation(getNavigationContext())
          );
        }

        return true;
      },
      subtitle: () => {
        if (!onSubtitleToggle) {
          return false;
        }

        onSubtitleToggle();
        return true;
      },
      togglePlayback: () => {
        togglePlayback();
        return true;
      },
    }),
    [
      getNavigationContext,
      hasInteraction,
      nextDisabled,
      onFullscreen,
      onInteractionToggle,
      onNext,
      onPrev,
      onSubtitleToggle,
      prevDisabled,
      togglePlayback,
    ]
  );
  const keyboardShortcutHandlersRef = useRef(keyboardShortcutHandlers);

  useEffect(() => {
    keyboardShortcutHandlersRef.current = keyboardShortcutHandlers;
  }, [keyboardShortcutHandlers]);

  useEffect(() => {
    if (!shouldEnableKeyboardShortcuts || typeof document === "undefined") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isActivePlayerKeyboardShortcutOwner(keyboardShortcutOwnerId)) {
        return;
      }

      const action = getPlayerKeyboardShortcutAction(event);

      if (!action || shouldIgnorePlayerKeyboardShortcutEvent(event, action)) {
        return;
      }

      let handled = false;
      const handler = keyboardShortcutHandlersRef.current[action];

      handled = handler();

      if (!handled) {
        return;
      }

      event.preventDefault();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [keyboardShortcutOwnerId, shouldEnableKeyboardShortcuts]);

  useEffect(() => {
    onPlaybackTimeChange?.(playbackTimeMsRef.current);
  }, [onPlaybackTimeChange]);

  return (
    <div
      {...props}
      data-slide-player-shortcut-owner={keyboardShortcutOwnerId}
      className={cn("slide-player", className)}
      onFocusCapture={handleRootFocusCapture}
      onPointerDown={handleRootPointerDown}
    >
      <audio
        ref={audioRef}
        preload="auto"
        playsInline
        onLoadStart={handleAudioLoadStart}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleAudioCanPlay}
        onPlay={handleAudioPlay}
        onPause={handleAudioPause}
        onWaiting={handleAudioWaiting}
        onSeeking={handleAudioSeeking}
        onSeeked={handleAudioSeeking}
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
      />

      {showControls ? (
        <>
          <MobilePlayerSettingsSheet
            container={settingsPortalContainer}
            labels={{
              closeSettings: playerTexts.closeSettingsLabel,
              fullscreen: playerTexts.fullscreenLabel,
              nonFullscreen: playerTexts.nonFullscreenLabel,
              screen: playerTexts.screenLabel,
              screenMode: playerTexts.screenModeLabel,
              subtitle: playerTexts.subtitleLabel,
              subtitleToggle: playerTexts.subtitleToggleAriaLabel,
              title: playerTexts.settingsTitle,
            }}
            isSubtitleEnabled={isSubtitleEnabled}
            onClose={() => setIsMobileMoreOpen(false)}
            onOpenChange={setIsMobileMoreOpen}
            onSubtitleToggle={onSubtitleToggle ?? (() => {})}
            onViewModeChange={handleMobileViewModeChange}
            open={isMobileMoreOpen}
            viewMode={mobileViewMode}
          />

          <div className="slide-player__controls" style={controlsStyle}>
            <div className="slide-player__group">
              <button
                aria-expanded={isMobileMoreOpen}
                aria-haspopup="dialog"
                aria-label={playerTexts.moreOptionsAriaLabel}
                className="slide-player__action slide-player__action--mobile-more"
                onClick={() => {
                  setIsMobileMoreOpen((prevOpen) => !prevOpen);
                }}
                type="button"
              >
                <EllipsisVertical
                  className="slide-player__icon"
                  strokeWidth={2.25}
                />
              </button>
              <button
                aria-label={playerTexts.volumeAriaLabel}
                className="hidden"
                type="button"
              >
                <Volume2 className="slide-player__icon" strokeWidth={2.25} />
              </button>
              <button
                aria-label={playerTexts.subtitleToggleAriaLabel}
                aria-keyshortcuts={subtitleShortcutMetadata.ariaKeyShortcuts}
                aria-pressed={isSubtitleEnabled}
                className="slide-player__action slide-player__action--subtitle"
                onClick={onSubtitleToggle}
                title={subtitleShortcutMetadata.title}
                type="button"
              >
                {isSubtitleEnabled ? (
                  <Captions className="slide-player__icon" strokeWidth={2.25} />
                ) : (
                  <CaptionsOff
                    className="slide-player__icon"
                    strokeWidth={2.25}
                  />
                )}
              </button>
              <button
                aria-keyshortcuts={previousShortcutMetadata.ariaKeyShortcuts}
                aria-label={playerTexts.previousLabel}
                className="slide-player__action slide-player__action--prev"
                disabled={prevDisabled}
                onClick={() => {
                  onPrev?.(getNavigationContext());
                }}
                title={previousShortcutMetadata.title}
                type="button"
              >
                <RotateCcw className="slide-player__icon" strokeWidth={2.25} />
              </button>
              <button
                aria-label={toggleAriaLabel}
                aria-keyshortcuts={playbackShortcutMetadata.ariaKeyShortcuts}
                className="slide-player__toggle slide-player__toggle--playback"
                onClick={() => {
                  togglePlayback();
                }}
                title={playbackShortcutMetadata.title}
                type="button"
              >
                {isTogglePlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
              <button
                aria-keyshortcuts={nextShortcutMetadata.ariaKeyShortcuts}
                aria-label={playerTexts.nextLabel}
                className="slide-player__action slide-player__action--next"
                disabled={nextDisabled}
                onClick={() => {
                  onNext?.(getNavigationContext());
                }}
                title={nextShortcutMetadata.title}
                type="button"
              >
                <RotateCw className="slide-player__icon" strokeWidth={2.25} />
              </button>
              {onFullscreen ? (
                <button
                  aria-label={fullscreenAriaLabel}
                  aria-keyshortcuts={
                    fullscreenShortcutMetadata.ariaKeyShortcuts
                  }
                  className="slide-player__action slide-player__action--fullscreen"
                  onClick={onFullscreen}
                  title={fullscreenShortcutMetadata.title}
                  type="button"
                >
                  {isFullscreen ? (
                    <ScanLine
                      className="slide-player__icon"
                      strokeWidth={2.25}
                    />
                  ) : (
                    <Maximize
                      className="slide-player__icon"
                      strokeWidth={2.25}
                    />
                  )}
                </button>
              ) : null}
            </div>

            <div className="slide-player__separator" />

            <div className="slide-player__group">
              {customActionList.map((customAction, customActionIndex) => (
                <React.Fragment key={`custom-action-${customActionIndex}`}>
                  {customAction}
                </React.Fragment>
              ))}
              <button
                aria-label={playerTexts.notesLabel}
                aria-keyshortcuts={notesShortcutMetadata.ariaKeyShortcuts}
                className={cn(
                  "slide-player__action slide-player__action--notes",
                  isInteractionOpen && "slide-player__action--active"
                )}
                disabled={!hasInteraction}
                onClick={onInteractionToggle}
                title={notesShortcutMetadata.title}
                type="button"
              >
                <FilePenLine
                  className="slide-player__icon"
                  strokeWidth={2.25}
                />
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

const MemoizedPlayer = memo(Player);

MemoizedPlayer.displayName = "Player";

export default MemoizedPlayer;
