import React, { useMemo } from "react";

import { cn } from "../../lib/utils";
import { getVisibleSubtitleText } from "./utils/subtitleCue";
import type { ElementSubtitleCue } from "./types";
import "./subtitle-overlay.css";

export interface SubtitleOverlayProps
  extends Omit<React.ComponentProps<"div">, "children"> {
  currentTimeMs?: number;
  hasPlayerGap?: boolean;
  isPlayerHidden?: boolean;
  subtitleCues?: ElementSubtitleCue[];
}

const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  className,
  currentTimeMs = 0,
  hasPlayerGap = false,
  isPlayerHidden = false,
  subtitleCues = [],
  ...props
}) => {
  const visibleSubtitleText = useMemo(
    () => getVisibleSubtitleText(subtitleCues, currentTimeMs),
    [currentTimeMs, subtitleCues]
  );

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

export default SubtitleOverlay;
