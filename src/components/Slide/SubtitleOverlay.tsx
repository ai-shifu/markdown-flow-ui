import React, { useMemo } from "react";

import { cn } from "../../lib/utils";
import type { ElementSubtitleCue } from "./types";
import "./subtitle-overlay.css";

export interface SubtitleOverlayProps
  extends Omit<React.ComponentProps<"div">, "children"> {
  currentTimeMs?: number;
  hasPlayerGap?: boolean;
  subtitleCues?: ElementSubtitleCue[];
}

const sortSubtitleCues = (subtitleCues: ElementSubtitleCue[] = []) =>
  [...subtitleCues].sort(
    (prevCue, nextCue) =>
      prevCue.start_ms - nextCue.start_ms ||
      prevCue.end_ms - nextCue.end_ms ||
      (prevCue.position ?? 0) - (nextCue.position ?? 0) ||
      prevCue.segment_index - nextCue.segment_index
  );

const getVisibleSubtitleText = (
  subtitleCues: ElementSubtitleCue[],
  currentTimeMs: number
) =>
  subtitleCues
    .filter(
      (subtitleCue) =>
        currentTimeMs >= subtitleCue.start_ms &&
        currentTimeMs < subtitleCue.end_ms
    )
    .sort(
      (prevCue, nextCue) =>
        (prevCue.position ?? 0) - (nextCue.position ?? 0) ||
        prevCue.segment_index - nextCue.segment_index ||
        prevCue.start_ms - nextCue.start_ms
    )
    .map((subtitleCue) => subtitleCue.text.trim())
    .filter(Boolean)
    .join("\n");

const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  className,
  currentTimeMs = 0,
  hasPlayerGap = false,
  subtitleCues = [],
  ...props
}) => {
  const normalizedSubtitleCues = useMemo(
    () => sortSubtitleCues(subtitleCues),
    [subtitleCues]
  );
  const visibleSubtitleText = useMemo(
    () => getVisibleSubtitleText(normalizedSubtitleCues, currentTimeMs),
    [currentTimeMs, normalizedSubtitleCues]
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
