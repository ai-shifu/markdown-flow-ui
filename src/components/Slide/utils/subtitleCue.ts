import type { ElementSubtitleCue } from "../types";

/** Direction for subtitle cue jump navigation. */
export type SubtitleCueJumpDirection = "previous" | "next";

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

const sortedSubtitleCuesCache = new WeakMap<
  ElementSubtitleCue[],
  ElementSubtitleCue[]
>();

const sortSubtitleCuesByPlaybackTime = (
  subtitleCues: ElementSubtitleCue[] = []
) => {
  const cachedSubtitleCues = sortedSubtitleCuesCache.get(subtitleCues);

  if (cachedSubtitleCues) {
    return cachedSubtitleCues;
  }

  const sortedSubtitleCues = [...subtitleCues].sort(
    (previousCue, nextCue) =>
      getSubtitleCueStartTimeMs(previousCue) -
        getSubtitleCueStartTimeMs(nextCue) ||
      getSubtitleCueEndTimeMs(previousCue) - getSubtitleCueEndTimeMs(nextCue) ||
      (previousCue.position ?? 0) - (nextCue.position ?? 0) ||
      (previousCue.segment_index ?? 0) - (nextCue.segment_index ?? 0)
  );

  sortedSubtitleCuesCache.set(subtitleCues, sortedSubtitleCues);

  return sortedSubtitleCues;
};

const getActiveSubtitleCueStartTimeMs = (
  subtitleCues: ElementSubtitleCue[],
  currentTimeMs: number
) => {
  let activeStartTimeMs: number | null = null;

  for (const subtitleCue of subtitleCues) {
    const startTimeMs = getSubtitleCueStartTimeMs(subtitleCue);

    if (startTimeMs > currentTimeMs) {
      break;
    }

    const endTimeMs = getSubtitleCueEndTimeMs(subtitleCue);

    if (currentTimeMs >= startTimeMs && currentTimeMs < endTimeMs) {
      activeStartTimeMs = startTimeMs;
    }
  }

  return activeStartTimeMs;
};

const getPreviousSubtitleCueStartTimeMs = (
  subtitleCues: ElementSubtitleCue[],
  currentTimeMs: number
) => {
  let previousStartTimeMs: number | null = null;

  for (const subtitleCue of subtitleCues) {
    const startTimeMs = getSubtitleCueStartTimeMs(subtitleCue);

    if (startTimeMs >= currentTimeMs) {
      break;
    }

    previousStartTimeMs = startTimeMs;
  }

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

/** Options used to resolve a subtitle cue jump target. */
export interface GetSubtitleCueJumpTimeOptions {
  currentTimeMs: number;
  direction: SubtitleCueJumpDirection;
  subtitleCues?: ElementSubtitleCue[];
}

/** Returns the target cue start time in milliseconds, or `null` when no target exists. */
export const getSubtitleCueJumpTime = ({
  currentTimeMs,
  direction,
  subtitleCues = [],
}: GetSubtitleCueJumpTimeOptions): number | null => {
  if (subtitleCues.length === 0) {
    return null;
  }

  const sortedSubtitleCues = sortSubtitleCuesByPlaybackTime(subtitleCues);
  const normalizedCurrentTimeMs = Math.max(Number(currentTimeMs), 0);

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

  return getPreviousSubtitleCueStartTimeMs(
    sortedSubtitleCues,
    activeStartTimeMs ?? normalizedCurrentTimeMs
  );
};
