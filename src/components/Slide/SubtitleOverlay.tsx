import React, { memo, useEffect, useMemo } from "react";

import { cn } from "../../lib/utils";
import { getVisibleSubtitleText } from "./utils/subtitleCue";
import { usePlaybackTimeStore } from "./utils/playbackTimeStore";
import type { PlaybackTimeStore } from "./utils/playbackTimeStore";
import type { ElementSubtitleCue } from "./types";
import "./subtitle-overlay.css";

export interface SubtitleOverlayProps extends Omit<
  React.ComponentProps<"div">,
  "children"
> {
  extraBottomOffset?: number;
  hasPlayerGap?: boolean;
  isEnabled?: boolean;
  isPlayerHidden?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
  playbackTimeStore: PlaybackTimeStore;
  subtitleCues?: ElementSubtitleCue[];
}

const SubtitleOverlay = ({
  className,
  extraBottomOffset = 0,
  hasPlayerGap = false,
  isEnabled = true,
  isPlayerHidden = false,
  onVisibilityChange,
  playbackTimeStore,
  style,
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
    onVisibilityChange?.(isEnabled && hasVisibleSubtitle);
  }, [hasVisibleSubtitle, isEnabled, onVisibilityChange]);

  if (!isEnabled || !visibleSubtitleText) {
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
      style={
        {
          ...style,
          "--slide-subtitle-extra-offset": `${Math.max(extraBottomOffset, 0)}px`,
        } as React.CSSProperties
      }
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
