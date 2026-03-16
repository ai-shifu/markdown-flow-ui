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

export type PlayerProps = React.ComponentProps<"div"> & {
  audioList?: SlideAudioItem[];
  currentAudioIndex?: number;
  defaultPlaying?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  onFullscreen?: () => void;
  onEnded?: (audioIndex: number) => void;
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
  onPrev,
  onNext,
  onFullscreen,
  onEnded,
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
  const currentAudioKey = `${currentAudioIndex}:${currentAudio?.serialNumber ?? "none"}:${currentAudioUrl ?? ""}`;

  useEffect(() => {
    currentAudioRef.current = currentAudio;
  }, [currentAudio]);

  useEffect(() => {
    currentAudioSegmentsRef.current = currentAudioSegments;
  }, [currentAudioSegments]);

  const getSegmentSrc = useCallback((audioData: string) => {
    if (!audioData) {
      return "";
    }

    if (audioData.startsWith("data:")) {
      return audioData;
    }

    return `data:audio/mpeg;base64,${audioData}`;
  }, []);

  const resetAudio = useCallback(() => {
    const audioElement = audioRef.current;

    if (!audioElement) {
      return;
    }

    pendingAutoPlayRef.current = false;
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
  }, [currentAudioIndex]);

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
      pendingAutoPlayRef.current = defaultPlaying;

      const hasNewSrc = audioSrcRef.current !== nextAudioSrc;

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

      if (!defaultPlaying) {
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
    [currentAudioIndex, defaultPlaying, getSegmentSrc, tryPlayCurrentAudio]
  );

  const finishAudioItem = useCallback(() => {
    pendingAutoPlayRef.current = false;
    isWaitingForSegmentRef.current = false;
    isSwitchingSegmentRef.current = false;
    setIsPlaying(false);

    if (currentAudioIndex >= 0) {
      onEnded?.(currentAudioIndex);
    }
  }, [currentAudioIndex, onEnded]);

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

      return;
    }

    finishAudioItem("segments-completed");
  }, [
    currentAudioIndex,
    defaultPlaying,
    finishAudioItem,
    startSegmentPlayback,
  ]);

  useEffect(() => {
    if (currentAudioKeyRef.current === currentAudioKey) {
      return;
    }

    currentAudioKeyRef.current = currentAudioKey;
    currentSegmentIndexRef.current = 0;
    waitingSegmentIndexRef.current = null;
    isWaitingForSegmentRef.current = false;
    pendingAutoPlayRef.current = false;
    isSwitchingSegmentRef.current = false;
    audioSrcRef.current = null;

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

      if (hasNewSrc) {
        audioElement.pause();
        audioElement.removeAttribute("src");
        audioElement.load();
        audioSrcRef.current = currentAudioUrl;
        audioElement.src = currentAudioUrl;
        audioElement.load();
      }

      pendingSeekTimeRef.current = 0;

      if (audioElement.readyState > 0) {
        audioElement.currentTime = 0;
        pendingSeekTimeRef.current = null;
      }

      pendingAutoPlayRef.current = defaultPlaying;
      isWaitingForSegmentRef.current = false;
      isSwitchingSegmentRef.current = false;

      if (!defaultPlaying) {
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
        startSegmentPlayback(waitingSegmentIndexRef.current, "wait-resume");
        return;
      }

      isWaitingForSegmentRef.current = true;
      pendingAutoPlayRef.current = defaultPlaying;
      setIsPlaying(defaultPlaying);
      return;
    }

    if (!currentAudioSegments.length) {
      if (currentAudio.isAudioStreaming) {
        waitingSegmentIndexRef.current = currentSegmentIndexRef.current;
        isWaitingForSegmentRef.current = true;
        pendingAutoPlayRef.current = defaultPlaying;
        setIsPlaying(defaultPlaying);
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

    if (!defaultPlaying) {
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
  ]);

  useEffect(() => resetAudio, [resetAudio]);

  const handleAudioPlay = useCallback(() => {
    setIsPlaying(true);
  }, [currentAudioIndex]);

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
    isSwitchingSegmentRef.current = false;

    if (
      currentAudioRef.current?.audioUrl ||
      currentAudioSegmentsRef.current.length === 0
    ) {
      finishAudioItem("url-ended");
      return;
    }

    handleSegmentEnded();
  }, [currentAudioIndex, finishAudioItem, handleSegmentEnded]);

  const handleAudioError = useCallback(() => {
    setIsPlaying(false);
  }, [currentAudioIndex]);

  return (
    <div className={cn("slide-player", className)} {...props}>
      <audio
        ref={audioRef}
        preload="metadata"
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
                    waitingSegmentIndexRef.current = null;
                    isWaitingForSegmentRef.current = false;
                    setIsPlaying(false);
                    audioElement.pause();
                    return;
                  }

                  pendingAutoPlayRef.current = true;
                  setIsPlaying(true);
                  return;
                }

                if (!audioElement.src && currentAudioSegments.length > 0) {
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
                  pendingAutoPlayRef.current = true;
                  tryPlayCurrentAudio("toggle-resume");
                  return;
                }

                pendingAutoPlayRef.current = false;
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
