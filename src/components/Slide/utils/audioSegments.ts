import type { SlideAudioItem } from "../useSlide";

type SlideAudioSegments = NonNullable<SlideAudioItem["audioSegments"]>;
type SlideAudioSegment = SlideAudioSegments[number];

const sortedAudioSegmentsCache = new WeakMap<
  SlideAudioSegments,
  {
    lastSegments: Array<SlideAudioSegment | null | undefined>;
    sortedSegments: SlideAudioSegments;
  }
>();

const isPresentAudioSegment = (
  segment: SlideAudioSegment | null | undefined
): segment is SlideAudioSegment => Boolean(segment);

const hasSameSegmentReferences = (
  previousSegments: Array<SlideAudioSegment | null | undefined>,
  nextSegments: SlideAudioSegments
) =>
  previousSegments.length === nextSegments.length &&
  previousSegments.every(
    (previousSegment, index) => previousSegment === nextSegments[index]
  );

export const getSortedAudioSegments = (audioItem?: SlideAudioItem) => {
  const audioSegments = audioItem?.audioSegments;

  if (!audioSegments) {
    return [];
  }

  const cachedSegments = sortedAudioSegmentsCache.get(audioSegments);

  if (
    cachedSegments &&
    hasSameSegmentReferences(cachedSegments.lastSegments, audioSegments)
  ) {
    return cachedSegments.sortedSegments;
  }

  const sortedSegments = audioSegments
    .filter(isPresentAudioSegment)
    .sort(
      (prevSegment, nextSegment) =>
        (prevSegment?.segment_index ?? 0) - (nextSegment?.segment_index ?? 0)
    );

  sortedAudioSegmentsCache.set(audioSegments, {
    lastSegments: [...audioSegments],
    sortedSegments,
  });

  return sortedSegments;
};
