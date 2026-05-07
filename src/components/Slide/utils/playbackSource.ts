export type AudioPlaybackSourceType = "segment" | "url";

export interface ResolveAudioPlaybackSourceTypeOptions {
  activeSourceType: AudioPlaybackSourceType | null;
  hasAudioUrl: boolean;
  segmentCount: number;
  preferredSourceType: AudioPlaybackSourceType | null;
  waitingSegmentIndex: number | null;
}

export const resolveAudioPlaybackSourceType = ({
  activeSourceType,
  hasAudioUrl,
  segmentCount,
  preferredSourceType,
  waitingSegmentIndex,
}: ResolveAudioPlaybackSourceTypeOptions): AudioPlaybackSourceType | null => {
  const hasSegments = segmentCount > 0;
  const isWaitingForMissingSegment =
    waitingSegmentIndex !== null && waitingSegmentIndex >= segmentCount;

  // Keep the segment source stable once it starts unless it stalls and a
  // completed URL is available as a recovery path.
  if (preferredSourceType === "segment") {
    if (isWaitingForMissingSegment && hasAudioUrl) {
      return "url";
    }

    if (
      hasSegments ||
      waitingSegmentIndex !== null ||
      activeSourceType === "segment"
    ) {
      return "segment";
    }

    return hasAudioUrl ? "url" : null;
  }

  if (preferredSourceType === "url") {
    if (hasAudioUrl || activeSourceType === "url") {
      return "url";
    }

    return hasSegments ? "segment" : null;
  }

  if (hasSegments) {
    return "segment";
  }

  if (hasAudioUrl) {
    return "url";
  }

  return null;
};
