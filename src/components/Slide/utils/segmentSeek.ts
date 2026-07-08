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
) =>
  segments.length > 0 &&
  Math.max(Number(timeMs), 0) <= getAudioSegmentsDurationMs(segments);

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

    if (
      normalizedTimeMs < segmentEndTimeMs ||
      (durationMs === 0 && normalizedTimeMs === segmentStartTimeMs) ||
      (index === segments.length - 1 && normalizedTimeMs >= segmentEndTimeMs)
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
