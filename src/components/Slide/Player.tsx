import React, {
  memo,
  useCallback,
  useEffect,
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
import { toPlayerCustomActionList } from "./utils/playerCustomActions";
import "./player.css";

const audioPreloadElementCache = new Map<string, HTMLAudioElement>();

export interface SlidePlayerTexts {
  settingsTitle?: string;
  subtitleLabel?: string;
  subtitleToggleAriaLabel?: string;
  screenLabel?: string;
  nonFullscreenLabel?: string;
  fullscreenLabel?: string;
  fullscreenHintText?: string;
}

export type SlidePlayerLoadingReason = "loadingAudio" | "waitingForMoreAudio";

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
  onPlaybackStarted?: () => void;
  onPlaybackTimeChange?: (timeMs: number) => void;
  onSubtitleToggle?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
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

const Player = ({
  audioList = [],
  className,
  currentAudioIndex = -1,
  defaultPlaying = true,
  isPlaybackPaused = false,
  isAutoAdvanceEnabled = true,
  useAutoAdvanceToggle = false,
  onLoadingChange,
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
  customActions,
  customActionContext,
  texts,
  ...props
}: PlayerProps) => {
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
  const wasPlayingBeforeExternalPauseRef = useRef(false);
  const isLoadingRef = useRef(false);
  const isPausedByUserRef = useRef(false);
  const activeSourceTypeRef = useRef<"url" | "segment" | null>(null);
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
      ? "Pause autoplay"
      : "Play autoplay"
    : isPlaying
      ? "Pause"
      : "Play";

  useEffect(() => {
    currentAudioRef.current = currentAudio;
  }, [currentAudio]);

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

    if (currentAudioUrl) {
      const hasNewSrc = audioSrcRef.current !== currentAudioUrl;
      const shouldAutoResume = canStartPlaybackAutomatically();
      const shouldKeepSegmentSource =
        activeSourceTypeRef.current === "segment" &&
        Boolean(audioSrcRef.current) &&
        waitingSegmentIndexRef.current === null;

      if (shouldKeepSegmentSource) {
        if (!shouldAutoResume) {
          pendingAutoPlayRef.current = false;
          audioElement.pause();
          setIsPlaying(false);
          return;
        }

        if (audioElement.paused) {
          pendingAutoPlayRef.current = true;
          tryPlayCurrentAudio("keep-segment-source");
        }

        return;
      }

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

    if (waitingSegmentIndexRef.current !== null) {
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

    if (!currentAudioSegments.length) {
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

    if (!audioSrcRef.current) {
      startSegmentPlayback(
        Math.min(
          currentSegmentIndexRef.current,
          currentAudioSegments.length - 1
        ),
        "effect-init"
      );
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

  useEffect(() => {
    onPlaybackTimeChange?.(playbackTimeMsRef.current);
  }, [onPlaybackTimeChange]);

  return (
    <div className={cn("slide-player", className)} {...props}>
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
              fullscreen: playerTexts.fullscreenLabel,
              nonFullscreen: playerTexts.nonFullscreenLabel,
              screen: playerTexts.screenLabel,
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
                aria-label="More options"
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
              <button aria-label="Volume" className="hidden" type="button">
                <Volume2 className="slide-player__icon" strokeWidth={2.25} />
              </button>
              <button
                aria-label={playerTexts.subtitleToggleAriaLabel}
                aria-pressed={isSubtitleEnabled}
                className="slide-player__action slide-player__action--subtitle"
                onClick={onSubtitleToggle}
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
                aria-label="Rewind"
                className="slide-player__action slide-player__action--prev"
                disabled={prevDisabled}
                onClick={onPrev}
                type="button"
              >
                <RotateCcw className="slide-player__icon" strokeWidth={2.25} />
              </button>
              <button
                aria-label={toggleAriaLabel}
                className="slide-player__toggle slide-player__toggle--playback"
                onClick={() => {
                  if (useAutoAdvanceToggle) {
                    onAutoAdvanceToggle?.(!isAutoAdvanceEnabled);
                    return;
                  }

                  const audioElement = audioRef.current;

                  if (isPlaybackPaused || !audioElement || !currentAudio) {
                    return;
                  }

                  if (waitingSegmentIndexRef.current !== null) {
                    if (isPlaying) {
                      pendingAutoPlayRef.current = false;
                      isPausedByUserRef.current = true;
                      waitingSegmentIndexRef.current = null;
                      isWaitingForSegmentRef.current = false;
                      setIsPlaying(false);
                      updateLoading(false);
                      audioElement.pause();
                      return;
                    }

                    playbackAccessModeRef.current = "manual";
                    isPausedByUserRef.current = false;
                    pendingAutoPlayRef.current = true;
                    updateLoading(true, "waitingForMoreAudio");
                    return;
                  }

                  if (!audioElement.src && currentAudioSegments.length > 0) {
                    playbackAccessModeRef.current = "manual";
                    isPausedByUserRef.current = false;
                    startSegmentPlayback(
                      Math.min(
                        currentSegmentIndexRef.current,
                        currentAudioSegments.length - 1
                      ),
                      "toggle"
                    );
                    return;
                  }

                  if (audioElement.paused) {
                    playbackAccessModeRef.current = "manual";
                    isPausedByUserRef.current = false;
                    pendingAutoPlayRef.current = true;
                    tryPlayCurrentAudio("toggle-resume");
                    return;
                  }

                  pendingAutoPlayRef.current = false;
                  isPausedByUserRef.current = true;
                  audioElement.pause();
                }}
                type="button"
              >
                {isTogglePlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
              <button
                aria-label="Forward"
                className="slide-player__action slide-player__action--next"
                disabled={nextDisabled}
                onClick={onNext}
                type="button"
              >
                <RotateCw className="slide-player__icon" strokeWidth={2.25} />
              </button>
              {onFullscreen ? (
                <button
                  aria-label={
                    isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                  }
                  className="slide-player__action slide-player__action--fullscreen"
                  onClick={onFullscreen}
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
                aria-label="Notes"
                className={cn(
                  "slide-player__action slide-player__action--notes",
                  isInteractionOpen && "slide-player__action--active"
                )}
                disabled={!hasInteraction}
                onClick={onInteractionToggle}
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
