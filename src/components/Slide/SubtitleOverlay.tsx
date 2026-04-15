import React, { memo, useEffect, useMemo } from "react";

import { cn } from "../../lib/utils";
import { getVisibleSubtitleText } from "./utils/subtitleCue";
import { usePlaybackTimeStore } from "./utils/playbackTimeStore";
import type { PlaybackTimeStore } from "./utils/playbackTimeStore";
import type { ElementSubtitleCue } from "./types";
import "./subtitle-overlay.css";

export interface SubtitleOverlayProps
  extends Omit<React.ComponentProps<"div">, "children"> {
  hasPlayerGap?: boolean;
  isPlayerHidden?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
  playbackTimeStore: PlaybackTimeStore;
  subtitleCues?: ElementSubtitleCue[];
}

const SubtitleOverlay = ({
  className,
  hasPlayerGap = false,
  isPlayerHidden = false,
  onVisibilityChange,
  playbackTimeStore,
  subtitleCues = [],
  ...props
}: SubtitleOverlayProps) => {
  const currentTimeMs = usePlaybackTimeStore(playbackTimeStore);
  const visibleSubtitleText = useMemo(
    () => getVisibleSubtitleText(subtitleCues, currentTimeMs),
    [currentTimeMs, subtitleCues]
  );
  const hasVisibleSubtitle = Boolean(visibleSubtitleText);

  useEffect(() => {
    onVisibilityChange?.(hasVisibleSubtitle);
  }, [hasVisibleSubtitle, onVisibilityChange]);

  if (!visibleSubtitleText) {
    return null;
  }

  return (
    <div
      aria-live="off"
      className={cn(
        "slide-subtitle-overlay",
        hasPlayerGap && "slide-subtitle-overlay--with-player-gap",
        isPlayerHidden && "slide-subtitle-overlay--player-hidden",
        className
      )}
      {...props}
    >
      <div className="slide-subtitle-overlay__surface">
        <p className="slide-subtitle-overlay__text">{visibleSubtitleText}</p>
      </div>
    </div>
  );
};

const MemoizedSubtitleOverlay = memo(SubtitleOverlay);

MemoizedSubtitleOverlay.displayName = "SubtitleOverlay";

export default MemoizedSubtitleOverlay;
