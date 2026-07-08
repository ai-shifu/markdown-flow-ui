import type { SlideAudioItem } from "../useSlide";

type SlideAudioSegments = NonNullable<SlideAudioItem["audioSegments"]>;
type SlideAudioSegment = SlideAudioSegments[number];

const sortedAudioSegmentsCache = new WeakMap<
  SlideAudioSegments,
  {
    signature: string;
    sortedSegments: SlideAudioSegments;
  }
>();
const audioSegmentIdentityCache = new WeakMap<object, number>();
let nextAudioSegmentIdentity = 0;

const isPresentAudioSegment = (
  segment: SlideAudioSegment | null | undefined
): segment is SlideAudioSegment => Boolean(segment);

const getAudioSegmentIdentity = (segment: SlideAudioSegment) => {
  const cachedIdentity = audioSegmentIdentityCache.get(segment);

  if (cachedIdentity != null) {
    return cachedIdentity;
  }

  nextAudioSegmentIdentity += 1;
  audioSegmentIdentityCache.set(segment, nextAudioSegmentIdentity);

  return nextAudioSegmentIdentity;
};

const getAudioSegmentsSignature = (audioSegments: SlideAudioSegments) =>
  audioSegments
    .map((segment) =>
      segment
        ? `${getAudioSegmentIdentity(segment)}:${segment.segment_index ?? 0}:${Number(segment.duration_ms ?? 0)}:${segment.is_final ? "1" : "0"}`
        : ""
    )
    .join("|");

export const getSortedAudioSegments = (audioItem?: SlideAudioItem) => {
  const audioSegments = audioItem?.audioSegments;

  if (!audioSegments) {
    return [];
  }

  const signature = getAudioSegmentsSignature(audioSegments);
  const cachedSegments = sortedAudioSegmentsCache.get(audioSegments);

  if (cachedSegments?.signature === signature) {
    return cachedSegments.sortedSegments;
  }

  const sortedSegments = audioSegments
    .filter(isPresentAudioSegment)
    .sort(
      (prevSegment, nextSegment) =>
        (prevSegment?.segment_index ?? 0) - (nextSegment?.segment_index ?? 0)
    );

  sortedAudioSegmentsCache.set(audioSegments, {
    signature,
    sortedSegments,
  });

  return sortedSegments;
};
