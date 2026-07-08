import type { SlideAudioItem } from "../useSlide";

export interface SegmentSeekTarget {
  segmentIndex: number;
  segmentTimeSeconds: number;
}

export const getAudioSegmentsDurationMs = (
  segments: NonNullable<SlideAudioItem["audioSegments"]> = []
) =>
  segments.reduce(
    (totalDurationMs, segment) =>
      totalDurationMs + Math.max(Number(segment?.duration_ms ?? 0), 0),
    0
  );

export const isPlaybackTimeCoveredBySegments = (
  segments: NonNullable<SlideAudioItem["audioSegments"]> = [],
  timeMs: number
) => {
  if (segments.length === 0) {
    return false;
  }

  const normalizedTimeMs = Math.max(Number(timeMs), 0);
  const loadedDurationMs = getAudioSegmentsDurationMs(segments);
  const lastSegment = segments[segments.length - 1];

  return (
    normalizedTimeMs < loadedDurationMs ||
    (normalizedTimeMs === loadedDurationMs && Boolean(lastSegment?.is_final))
  );
};

export const resolveSegmentSeekTarget = (
  segments: NonNullable<SlideAudioItem["audioSegments"]> = [],
  timeMs: number
): SegmentSeekTarget | null => {
  const normalizedTimeMs = Math.max(Number(timeMs), 0);
  let segmentStartTimeMs = 0;

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const durationMs = Math.max(Number(segment?.duration_ms ?? 0), 0);
    const segmentEndTimeMs = segmentStartTimeMs + durationMs;
    const isLastSegment = index === segments.length - 1;
    const isFinalSegment = Boolean(segment?.is_final);

    if (
      normalizedTimeMs < segmentEndTimeMs ||
      (durationMs === 0 &&
        normalizedTimeMs === segmentStartTimeMs &&
        (!isLastSegment || isFinalSegment)) ||
      (isLastSegment && isFinalSegment && normalizedTimeMs >= segmentEndTimeMs)
    ) {
      return {
        segmentIndex: index,
        segmentTimeSeconds:
          Math.min(
            Math.max(normalizedTimeMs - segmentStartTimeMs, 0),
            durationMs
          ) / 1000,
      };
    }

    segmentStartTimeMs = segmentEndTimeMs;
  }

  return null;
};
