import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  EllipsisVertical,
  FilePenLine,
  Maximize,
  RotateCcw,
  RotateCw,
  Volume2,
} from "lucide-react";

import { cn } from "../../lib/utils";
import ContentRender from "../ContentRender";
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
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  interactionContent?: string;
  interactionTitle?: string;
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
  prevDisabled = false,
  nextDisabled = false,
  interactionContent,
  interactionTitle = "Submit the content below to continue.",
  showControls = true,
  ...props
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioSrcRef = useRef<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(defaultPlaying);
  const [isInteractionOpen, setIsInteractionOpen] = useState(false);
  const lastInteractionContentRef = useRef<string | null>(null);
  const hasInteraction = Boolean(interactionContent);
  const currentAudio =
    currentAudioIndex >= 0 ? audioList[currentAudioIndex] : undefined;
  const currentAudioUrl = currentAudio?.audioUrl;

  const resetAudio = useCallback(() => {
    const audioElement = audioRef.current;

    if (!audioElement) {
      return;
    }

    audioElement.pause();
    audioElement.removeAttribute("src");
    audioElement.load();
    audioSrcRef.current = null;
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    const nextInteraction = interactionContent ?? null;
    if (!nextInteraction) {
      lastInteractionContentRef.current = null;
      setIsInteractionOpen(false);
      return;
    }

    if (lastInteractionContentRef.current !== nextInteraction) {
      lastInteractionContentRef.current = nextInteraction;
      setIsInteractionOpen(true);
    }
  }, [interactionContent]);

  useEffect(() => {
    const audioElement = audioRef.current;

    if (!audioElement) {
      return;
    }

    if (!currentAudioUrl) {
      resetAudio();
      return;
    }

    if (audioSrcRef.current !== currentAudioUrl) {
      audioSrcRef.current = currentAudioUrl;
      audioElement.src = currentAudioUrl;
      audioElement.load();
      audioElement.currentTime = 0;
    }

    if (!defaultPlaying) {
      audioElement.pause();
      setIsPlaying(false);
      return;
    }

    void audioElement.play().catch(() => {
      setIsPlaying(false);
    });
  }, [currentAudioUrl, defaultPlaying, resetAudio]);

  useEffect(() => resetAudio, [resetAudio]);

  const handleAudioPlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handleAudioPause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false);

    if (currentAudioIndex >= 0) {
      onEnded?.(currentAudioIndex);
    }
  }, [currentAudioIndex, onEnded]);

  const handleAudioError = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const stopInteractionPropagation = useCallback(
    (
      event:
        | React.PointerEvent<HTMLDivElement>
        | React.MouseEvent<HTMLDivElement>
    ) => {
      event.stopPropagation();
    },
    []
  );

  return (
    <div className={cn("slide-player", className)} {...props}>
      <audio
        ref={audioRef}
        preload="metadata"
        playsInline
        onPlay={handleAudioPlay}
        onPause={handleAudioPause}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
      />
      {hasInteraction && isInteractionOpen ? (
        <div
          className="slide-player__interaction"
          onClick={stopInteractionPropagation}
          onPointerDown={stopInteractionPropagation}
        >
          <div className="slide-player__interaction-card">
            <div className="slide-player__interaction-header">
              <p className="slide-player__interaction-title">
                {interactionTitle}
              </p>
            </div>
            <div className="slide-player__interaction-body">
              <ContentRender
                content={interactionContent as string}
                enableTypewriter={false}
                sandboxMode="content"
              />
            </div>
            <div className="slide-player__interaction-arrow" />
          </div>
        </div>
      ) : null}

      {showControls ? (
        <div className="slide-player__controls">
          <div className="slide-player__group">
            <button
              aria-label="More options"
              className="slide-player__action"
              type="button"
            >
              <EllipsisVertical
                className="slide-player__icon"
                strokeWidth={2.25}
              />
            </button>
            <button
              aria-label="Volume"
              className="slide-player__action"
              type="button"
            >
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

                if (!audioElement || !currentAudioUrl) {
                  return;
                }

                if (audioElement.paused) {
                  void audioElement.play().catch(() => {
                    setIsPlaying(false);
                  });
                  return;
                }

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
              className="slide-player__action"
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
                hasInteraction && "slide-player__action--active"
              )}
              disabled={!hasInteraction}
              onClick={() => {
                if (!hasInteraction) {
                  return;
                }
                setIsInteractionOpen((prevOpen) => !prevOpen);
              }}
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
