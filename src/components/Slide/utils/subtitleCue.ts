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

const isSameSubtitleCueJumpTarget = (
  previousTarget: SubtitleCueJumpTarget | null | undefined,
  nextTarget: SubtitleCueJumpTarget
) =>
  previousTarget?.audioIndex === nextTarget.audioIndex &&
  previousTarget.timeMs === nextTarget.timeMs;

const resolveSubtitleCueJumpTargetCandidate = ({
  audioIndex,
  excludeTarget,
  getFallbackTimeMs,
  sortedSubtitleCues,
  timeMs,
}: {
  audioIndex: number;
  excludeTarget: SubtitleCueJumpTarget | null;
  getFallbackTimeMs: (
    subtitleCues: ElementSubtitleCue[],
    timeMs: number
  ) => number | null;
  sortedSubtitleCues: ElementSubtitleCue[];
  timeMs: number | null;
}): SubtitleCueJumpTarget | null => {
  if (timeMs === null) {
    return null;
  }

  const target = {
    audioIndex,
    timeMs,
  };

  if (!isSameSubtitleCueJumpTarget(excludeTarget, target)) {
    return target;
  }

  const fallbackTimeMs = getFallbackTimeMs(sortedSubtitleCues, timeMs);

  return fallbackTimeMs !== null
    ? {
        audioIndex,
        timeMs: fallbackTimeMs,
      }
    : null;
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
  excludeTarget?: SubtitleCueJumpTarget | null;
  tracks?: SubtitleCueJumpTrack[];
}

const getNextSubtitleCueJumpTarget = ({
  currentAudioIndex,
  currentTimeMs,
  excludeTarget,
  tracks,
}: {
  currentAudioIndex: number;
  currentTimeMs: number;
  excludeTarget: SubtitleCueJumpTarget | null;
  tracks: SubtitleCueJumpTrack[];
}) => {
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
        ? getNextSubtitleCueStartTimeMs(sortedSubtitleCues, currentTimeMs)
        : getFirstSubtitleCueStartTimeMs(sortedSubtitleCues);
    const target = resolveSubtitleCueJumpTargetCandidate({
      audioIndex,
      excludeTarget,
      getFallbackTimeMs: getNextSubtitleCueStartTimeMs,
      sortedSubtitleCues,
      timeMs,
    });

    if (target) {
      return target;
    }
  }

  return null;
};

const getPreviousSubtitleCueJumpTarget = ({
  currentAudioIndex,
  currentTimeMs,
  excludeTarget,
  tracks,
}: {
  currentAudioIndex: number;
  currentTimeMs: number;
  excludeTarget: SubtitleCueJumpTarget | null;
  tracks: SubtitleCueJumpTrack[];
}) => {
  for (let audioIndex = currentAudioIndex; audioIndex >= 0; audioIndex -= 1) {
    const sortedSubtitleCues = sortSubtitleCuesByPlaybackTime(
      tracks[audioIndex]?.subtitleCues ?? []
    );
    const timeMs =
      audioIndex === currentAudioIndex
        ? getSubtitleCueJumpTime({
            currentTimeMs,
            direction: "previous",
            subtitleCues: sortedSubtitleCues,
          })
        : getLastSubtitleCueStartTimeMs(sortedSubtitleCues);
    const target = resolveSubtitleCueJumpTargetCandidate({
      audioIndex,
      excludeTarget,
      getFallbackTimeMs: getPreviousSubtitleCueStartTimeMs,
      sortedSubtitleCues,
      timeMs,
    });

    if (target) {
      return target;
    }
  }

  return null;
};

export const getSubtitleCueJumpTarget = ({
  currentAudioIndex,
  currentTimeMs,
  direction,
  excludeTarget = null,
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
    return getNextSubtitleCueJumpTarget({
      currentAudioIndex,
      currentTimeMs: normalizedCurrentTimeMs,
      excludeTarget,
      tracks,
    });
  }

  return getPreviousSubtitleCueJumpTarget({
    currentAudioIndex,
    currentTimeMs: normalizedCurrentTimeMs,
    excludeTarget,
    tracks,
  });
};
