import React, { useState } from "react";
import {
  EllipsisVertical,
  FilePenLine,
  Maximize,
  RotateCcw,
  RotateCw,
  Volume2,
} from "lucide-react";

import { cn } from "../../lib/utils";
import "./player.css";

export type PlayerProps = React.ComponentProps<"div"> & {
  defaultPlaying?: boolean;
  onFullscreen?: () => void;
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
  className,
  defaultPlaying = true,
  onFullscreen,
  ...props
}) => {
  const [isPlaying, setIsPlaying] = useState(defaultPlaying);

  return (
    <div className={cn("slide-player", className)} {...props}>
      <div className="slide-player__group">
        <button
          aria-label="More options"
          className="slide-player__action"
          type="button"
        >
          <EllipsisVertical className="slide-player__icon" strokeWidth={2.25} />
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
          type="button"
        >
          <RotateCcw className="slide-player__icon" strokeWidth={2.25} />
        </button>
        <button
          aria-label={isPlaying ? "Pause" : "Play"}
          className="slide-player__toggle"
          onClick={() => {
            setIsPlaying((playing) => !playing);
          }}
          type="button"
        >
          <span className="slide-player__toggle-icon">
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </span>
        </button>
        <button
          aria-label="Forward"
          className="slide-player__action"
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
          aria-label="Edit slide"
          className="slide-player__action"
          type="button"
        >
          <FilePenLine className="slide-player__icon" strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
};

export default Player;
