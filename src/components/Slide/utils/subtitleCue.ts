import type { ElementSubtitleCue } from "../types";

export const getVisibleSubtitleText = (
  subtitleCues: ElementSubtitleCue[] = [],
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
        prevCue.start_ms - nextCue.start_ms ||
        prevCue.end_ms - nextCue.end_ms
    )
    .map((subtitleCue) => subtitleCue.text.trim())
    .filter(Boolean)
    .join("\n");
