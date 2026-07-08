import type { ElementSubtitleCue } from "../types";

/** Direction for subtitle cue jump navigation. */
export type SubtitleCueJumpDirection = "previous" | "next";

export interface SubtitleCueJumpTrack {
  subtitleCues?: ElementSubtitleCue[];
}

export interface SubtitleCueJumpTarget {
  audioIndex: number;
  timeMs: number;
}

const normalizePlaybackTimeMs = (timeMs: number) => {
  const parsedTimeMs = Number(timeMs);

  return Number.isFinite(parsedTimeMs) ? Math.max(parsedTimeMs, 0) : 0;
};

export const getVisibleSubtitleText = (
  subtitleCues: ElementSubtitleCue[] = [],
  currentTimeMs: number
): string => {
  const normalizedCurrentTimeMs = normalizePlaybackTimeMs(currentTimeMs);

  return subtitleCues
    .filter(
      (subtitleCue) =>
        normalizedCurrentTimeMs >= subtitleCue.start_ms &&
        normalizedCurrentTimeMs < subtitleCue.end_ms
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
};

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

const getFirstSubtitleCueStartTimeMs = (subtitleCues: ElementSubtitleCue[]) => {
  const firstSubtitleCue = subtitleCues[0];

  return firstSubtitleCue ? getSubtitleCueStartTimeMs(firstSubtitleCue) : null;
};

const getLastSubtitleCueStartTimeMs = (subtitleCues: ElementSubtitleCue[]) => {
  const lastSubtitleCue = subtitleCues[subtitleCues.length - 1];

  return lastSubtitleCue ? getSubtitleCueStartTimeMs(lastSubtitleCue) : null;
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
  const normalizedCurrentTimeMs = normalizePlaybackTimeMs(currentTimeMs);

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

export interface GetSubtitleCueJumpTargetOptions {
  currentAudioIndex: number;
  currentTimeMs: number;
  direction: SubtitleCueJumpDirection;
  tracks?: SubtitleCueJumpTrack[];
}

export const getSubtitleCueJumpTarget = ({
  currentAudioIndex,
  currentTimeMs,
  direction,
  tracks = [],
}: GetSubtitleCueJumpTargetOptions): SubtitleCueJumpTarget | null => {
  if (
    tracks.length === 0 ||
    currentAudioIndex < 0 ||
    currentAudioIndex >= tracks.length
  ) {
    return null;
  }

  const normalizedCurrentTimeMs = normalizePlaybackTimeMs(currentTimeMs);

  if (direction === "next") {
    for (
      let audioIndex = currentAudioIndex;
      audioIndex < tracks.length;
      audioIndex += 1
    ) {
      const sortedSubtitleCues = sortSubtitleCuesByPlaybackTime(
        tracks[audioIndex]?.subtitleCues ?? []
      );
      const timeMs =
        audioIndex === currentAudioIndex
          ? getNextSubtitleCueStartTimeMs(
              sortedSubtitleCues,
              normalizedCurrentTimeMs
            )
          : getFirstSubtitleCueStartTimeMs(sortedSubtitleCues);

      if (timeMs !== null) {
        return {
          audioIndex,
          timeMs,
        };
      }
    }

    return null;
  }

  for (let audioIndex = currentAudioIndex; audioIndex >= 0; audioIndex -= 1) {
    const sortedSubtitleCues = sortSubtitleCuesByPlaybackTime(
      tracks[audioIndex]?.subtitleCues ?? []
    );
    const timeMs =
      audioIndex === currentAudioIndex
        ? getSubtitleCueJumpTime({
            currentTimeMs: normalizedCurrentTimeMs,
            direction,
            subtitleCues: sortedSubtitleCues,
          })
        : getLastSubtitleCueStartTimeMs(sortedSubtitleCues);

    if (timeMs !== null) {
      return {
        audioIndex,
        timeMs,
      };
    }
  }

  return null;
};
