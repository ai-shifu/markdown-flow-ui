import type { ElementSubtitleCue } from "../types";

export type SubtitleCueJumpDirection = "previous" | "next";

export const DEFAULT_SUBTITLE_CUE_REPLAY_THRESHOLD_MS = 800;

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

const getSubtitleCueStartTimeMs = (subtitleCue: ElementSubtitleCue) =>
  Math.max(Number(subtitleCue.start_ms ?? 0), 0);

const getSubtitleCueEndTimeMs = (subtitleCue: ElementSubtitleCue) =>
  Math.max(Number(subtitleCue.end_ms ?? 0), 0);

const sortSubtitleCuesByPlaybackTime = (
  subtitleCues: ElementSubtitleCue[] = []
) =>
  [...subtitleCues].sort(
    (prevCue, nextCue) =>
      getSubtitleCueStartTimeMs(prevCue) - getSubtitleCueStartTimeMs(nextCue) ||
      getSubtitleCueEndTimeMs(prevCue) - getSubtitleCueEndTimeMs(nextCue) ||
      (prevCue.position ?? 0) - (nextCue.position ?? 0) ||
      prevCue.segment_index - nextCue.segment_index
  );

const getActiveSubtitleCueStartTimeMs = (
  subtitleCues: ElementSubtitleCue[],
  currentTimeMs: number
) => {
  let activeStartTimeMs: number | null = null;

  subtitleCues.forEach((subtitleCue) => {
    const startTimeMs = getSubtitleCueStartTimeMs(subtitleCue);
    const endTimeMs = getSubtitleCueEndTimeMs(subtitleCue);

    if (currentTimeMs >= startTimeMs && currentTimeMs < endTimeMs) {
      activeStartTimeMs = startTimeMs;
    }
  });

  return activeStartTimeMs;
};

const getPreviousSubtitleCueStartTimeMs = (
  subtitleCues: ElementSubtitleCue[],
  currentTimeMs: number
) => {
  let previousStartTimeMs: number | null = null;

  subtitleCues.forEach((subtitleCue) => {
    const startTimeMs = getSubtitleCueStartTimeMs(subtitleCue);

    if (startTimeMs < currentTimeMs) {
      previousStartTimeMs = startTimeMs;
    }
  });

  return previousStartTimeMs;
};

const getNextSubtitleCueStartTimeMs = (
  subtitleCues: ElementSubtitleCue[],
  currentTimeMs: number
) => {
  const nextSubtitleCue = subtitleCues.find(
    (subtitleCue) => getSubtitleCueStartTimeMs(subtitleCue) > currentTimeMs
  );

  return nextSubtitleCue ? getSubtitleCueStartTimeMs(nextSubtitleCue) : null;
};

export interface GetSubtitleCueJumpTimeOptions {
  currentTimeMs: number;
  direction: SubtitleCueJumpDirection;
  replayThresholdMs?: number;
  subtitleCues?: ElementSubtitleCue[];
}

export const getSubtitleCueJumpTime = ({
  currentTimeMs,
  direction,
  replayThresholdMs = DEFAULT_SUBTITLE_CUE_REPLAY_THRESHOLD_MS,
  subtitleCues = [],
}: GetSubtitleCueJumpTimeOptions) => {
  const sortedSubtitleCues = sortSubtitleCuesByPlaybackTime(subtitleCues);
  const normalizedCurrentTimeMs = Math.max(Number(currentTimeMs), 0);

  if (sortedSubtitleCues.length === 0) {
    return null;
  }

  if (direction === "next") {
    return getNextSubtitleCueStartTimeMs(
      sortedSubtitleCues,
      normalizedCurrentTimeMs
    );
  }

  const activeStartTimeMs = getActiveSubtitleCueStartTimeMs(
    sortedSubtitleCues,
    normalizedCurrentTimeMs
  );

  if (
    activeStartTimeMs !== null &&
    normalizedCurrentTimeMs - activeStartTimeMs >= replayThresholdMs
  ) {
    return activeStartTimeMs;
  }

  return getPreviousSubtitleCueStartTimeMs(
    sortedSubtitleCues,
    activeStartTimeMs ?? normalizedCurrentTimeMs
  );
};
