import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  EllipsisVertical,
  FilePenLine,
  Maximize,
  RotateCcw,
  RotateCw,
  Volume2,
} from "lucide-react";

import { cn } from "../../lib/utils";
import type { SlideAudioItem } from "./useSlide";
import "./player.css";

const audioPreloadLinkCache = new Set<string>();

const preloadAudioUrl = (url?: string) => {
  if (
    typeof document === "undefined" ||
    !url ||
    audioPreloadLinkCache.has(url)
  ) {
    return;
  }

  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "audio";
  link.href = url;
  if (/^https?:/i.test(url)) {
    link.crossOrigin = "anonymous";
  }
  document.head.appendChild(link);
  audioPreloadLinkCache.add(url);
};

export type PlayerProps = React.ComponentProps<"div"> & {
  audioList?: SlideAudioItem[];
  currentAudioIndex?: number;
  defaultPlaying?: boolean;
  onLoadingChange?: (loading: boolean) => void;
  onPrev?: () => void;
  onNext?: () => void;
  onFullscreen?: () => void;
  onEnded?: (audioIndex: number) => void;
  onPlayRequest?: () => void;
  onInteractionToggle?: () => void;
  hasInteraction?: boolean;
  isInteractionOpen?: boolean;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  showControls?: boolean;
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

const Player: React.FC<PlayerProps> = ({
  audioList = [],
  className,
  currentAudioIndex = -1,
  defaultPlaying = true,
  onLoadingChange,
  onPrev,
  onNext,
  onFullscreen,
  onEnded,
  onPlayRequest,
  onInteractionToggle,
  hasInteraction = false,
  isInteractionOpen = false,
  prevDisabled = false,
  nextDisabled = false,
  showControls = true,
  ...props
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioSrcRef = useRef<string | null>(null);
  const currentAudioKeyRef = useRef<string | null>(null);
  const currentSegmentIndexRef = useRef(0);
  const waitingSegmentIndexRef = useRef<number | null>(null);
  const currentAudioRef = useRef<SlideAudioItem | undefined>(undefined);
  const currentAudioSegmentsRef = useRef<
    NonNullable<SlideAudioItem["audioSegments"]>
  >([]);
  const isLoadingRef = useRef(false);
  const isPausedByUserRef = useRef(false);
  const activeSourceTypeRef = useRef<"url" | "segment" | null>(null);
  const isWaitingForSegmentRef = useRef(false);
  const pendingAutoPlayRef = useRef(false);
  const pendingSeekTimeRef = useRef<number | null>(null);
  const isSwitchingSegmentRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(defaultPlaying);
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
  const currentAudioKey = `${currentAudioIndex}:${currentAudio?.audioKey ?? "none"}`;

  useEffect(() => {
    currentAudioRef.current = currentAudio;
  }, [currentAudio]);

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
    (loading: boolean) => {
      if (isLoadingRef.current === loading) {
        return;
      }

      isLoadingRef.current = loading;
      onLoadingChange?.(loading);
    },
    [onLoadingChange]
  );

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

  const resetAudio = useCallback(() => {
    const audioElement = audioRef.current;

    if (!audioElement) {
      return;
    }

    pendingAutoPlayRef.current = false;
    isPausedByUserRef.current = false;
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
    setIsPlaying(false);
    updateLoading(false);
  }, [updateLoading]);

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
            pendingAutoPlayRef.current = false;
            isSwitchingSegmentRef.current = false;
          })
          .catch((_error: unknown) => {
            setIsPlaying(false);
          });
      }

      return true;
    },
    [currentAudioIndex]
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
      const shouldAutoResume = defaultPlaying && !isPausedByUserRef.current;

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

      if (hasNewSrc) {
        return true;
      }

      return tryPlayCurrentAudio(`start-segment:${_reason}`);
    },
    [defaultPlaying, getSegmentSrc, tryPlayCurrentAudio, updateLoading]
  );

  const finishAudioItem = useCallback(
    (_reason?: string) => {
      pendingAutoPlayRef.current = false;
      isWaitingForSegmentRef.current = false;
      isSwitchingSegmentRef.current = false;
      setIsPlaying(false);
      updateLoading(false);

      if (currentAudioIndex >= 0) {
        onEnded?.(currentAudioIndex);
      }
    },
    [currentAudioIndex, onEnded, updateLoading]
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
      setIsPlaying(defaultPlaying);
      updateLoading(true);

      return;
    }

    finishAudioItem("segments-completed");
  }, [defaultPlaying, finishAudioItem, startSegmentPlayback, updateLoading]);

  useEffect(() => {
    if (currentAudioKeyRef.current === currentAudioKey) {
      return;
    }

    currentAudioKeyRef.current = currentAudioKey;
    currentSegmentIndexRef.current = 0;
    waitingSegmentIndexRef.current = null;
    isWaitingForSegmentRef.current = false;
    isPausedByUserRef.current = false;
    pendingAutoPlayRef.current = false;
    isSwitchingSegmentRef.current = false;
    activeSourceTypeRef.current = null;
    audioSrcRef.current = null;
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

    if (currentAudioUrl) {
      const hasNewSrc = audioSrcRef.current !== currentAudioUrl;
      const shouldAutoResume = defaultPlaying && !isPausedByUserRef.current;
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

      if (!hasNewSrc) {
        tryPlayCurrentAudio("sync-url");
      }
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
      pendingAutoPlayRef.current = defaultPlaying && !isPausedByUserRef.current;
      setIsPlaying(defaultPlaying && !isPausedByUserRef.current);
      updateLoading(!isPausedByUserRef.current);
      return;
    }

    if (!currentAudioSegments.length) {
      if (currentAudio.isAudioStreaming) {
        waitingSegmentIndexRef.current = currentSegmentIndexRef.current;
        isWaitingForSegmentRef.current = true;
        pendingAutoPlayRef.current =
          defaultPlaying && !isPausedByUserRef.current;
        setIsPlaying(defaultPlaying && !isPausedByUserRef.current);
        updateLoading(!isPausedByUserRef.current);
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
    resetAudio,
    startSegmentPlayback,
    tryPlayCurrentAudio,
    getWaitingSegmentSeekTime,
    updateLoading,
  ]);

  useEffect(() => resetAudio, [resetAudio]);

  const handleAudioPlay = useCallback(() => {
    setIsPlaying(true);
    updateLoading(false);
  }, [updateLoading]);

  const handleAudioPause = useCallback(() => {
    if (isWaitingForSegmentRef.current || isSwitchingSegmentRef.current) {
      return;
    }

    setIsPlaying(false);
  }, [currentAudioIndex]);

  const handleAudioCanPlay = useCallback(() => {
    const audioElement = audioRef.current;

    if (audioElement && pendingSeekTimeRef.current !== null) {
      audioElement.currentTime = pendingSeekTimeRef.current;
      pendingSeekTimeRef.current = null;
    }

    if (!pendingAutoPlayRef.current || !defaultPlaying) {
      return;
    }

    tryPlayCurrentAudio("canplay");
  }, [currentAudioIndex, defaultPlaying, tryPlayCurrentAudio]);

  const handleLoadedMetadata = useCallback(() => {
    const audioElement = audioRef.current;

    if (audioElement && pendingSeekTimeRef.current !== null) {
      audioElement.currentTime = pendingSeekTimeRef.current;
      pendingSeekTimeRef.current = null;
    }
  }, [currentAudioIndex]);

  const handleAudioEnded = useCallback(() => {
    const shouldFinishAsUrl =
      activeSourceTypeRef.current === "url" ||
      currentAudioSegmentsRef.current.length === 0;

    isSwitchingSegmentRef.current = false;

    if (shouldFinishAsUrl) {
      finishAudioItem("url-ended");
      return;
    }

    handleSegmentEnded();
  }, [finishAudioItem, handleSegmentEnded]);

  const handleAudioError = useCallback(() => {
    setIsPlaying(false);
    updateLoading(false);
  }, [updateLoading]);

  return (
    <div className={cn("slide-player", className)} {...props}>
      <audio
        ref={audioRef}
        preload="auto"
        playsInline
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleAudioCanPlay}
        onPlay={handleAudioPlay}
        onPause={handleAudioPause}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
      />

      {showControls ? (
        <div className="slide-player__controls">
          <div className="slide-player__group">
            <button aria-label="More options" className="hidden" type="button">
              <EllipsisVertical
                className="slide-player__icon"
                strokeWidth={2.25}
              />
            </button>
            <button aria-label="Volume" className="hidden" type="button">
              <Volume2 className="slide-player__icon" strokeWidth={2.25} />
            </button>
            <button
              aria-label="Rewind"
              className="slide-player__action"
              disabled={prevDisabled}
              onClick={onPrev}
              type="button"
            >
              <RotateCcw className="slide-player__icon" strokeWidth={2.25} />
            </button>
            <button
              aria-label={isPlaying ? "Pause" : "Play"}
              className="slide-player__toggle"
              onClick={() => {
                const audioElement = audioRef.current;

                if (!audioElement || !currentAudio) {
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

                  onPlayRequest?.();
                  isPausedByUserRef.current = false;
                  pendingAutoPlayRef.current = true;
                  setIsPlaying(true);
                  return;
                }

                if (!audioElement.src && currentAudioSegments.length > 0) {
                  // Only the player play button can unlock playback when autoplay is unavailable.
                  onPlayRequest?.();
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
                  onPlayRequest?.();
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
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button
              aria-label="Forward"
              className="slide-player__action"
              disabled={nextDisabled}
              onClick={onNext}
              type="button"
            >
              <RotateCw className="slide-player__icon" strokeWidth={2.25} />
            </button>
            <button
              aria-label="Fullscreen"
              className="hidden"
              onClick={onFullscreen}
              type="button"
            >
              <Maximize className="slide-player__icon" strokeWidth={2.25} />
            </button>
          </div>

          <div className="slide-player__separator" />

          <div className="slide-player__group">
            <button
              aria-label="Notes"
              className={cn(
                "slide-player__action",
                isInteractionOpen && "slide-player__action--active"
              )}
              disabled={!hasInteraction}
              onClick={onInteractionToggle}
              type="button"
            >
              <FilePenLine className="slide-player__icon" strokeWidth={2.25} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Player;
