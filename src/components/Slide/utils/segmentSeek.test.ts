import { describe, expect, it } from "vitest";

import {
  isPlaybackTimeCoveredBySegments,
  resolveSegmentSeekTarget,
} from "./segmentSeek";

describe("resolveSegmentSeekTarget", () => {
  const audioSegments = [
    {
      segment_index: 0,
      audio_data: "first",
      duration_ms: 1_000,
      is_final: false,
    },
    {
      segment_index: 1,
      audio_data: "second",
      duration_ms: 2_000,
      is_final: true,
    },
  ];

  it("resolves a playback time to the matching segment offset", () => {
    expect(resolveSegmentSeekTarget(audioSegments, 1_500)).toEqual({
      segmentIndex: 1,
      segmentTimeSeconds: 0.5,
    });
  });

  it("clamps seeks at or beyond the end to the last segment duration", () => {
    expect(resolveSegmentSeekTarget(audioSegments, 3_000)).toEqual({
      segmentIndex: 1,
      segmentTimeSeconds: 2,
    });
    expect(resolveSegmentSeekTarget(audioSegments, 4_000)).toEqual({
      segmentIndex: 1,
      segmentTimeSeconds: 2,
    });
  });

  it("returns null when there are no segments", () => {
    expect(resolveSegmentSeekTarget([], 1_000)).toBeNull();
  });

  it("does not resolve the unloaded boundary when the last segment is not final", () => {
    const streamingAudioSegments = [
      {
        segment_index: 0,
        audio_data: "first",
        duration_ms: 1_000,
        is_final: false,
      },
    ];

    expect(resolveSegmentSeekTarget(streamingAudioSegments, 999)).toEqual({
      segmentIndex: 0,
      segmentTimeSeconds: 0.999,
    });
    expect(resolveSegmentSeekTarget(streamingAudioSegments, 1_000)).toBeNull();
    expect(resolveSegmentSeekTarget(streamingAudioSegments, 1_001)).toBeNull();
  });

  it("detects whether a playback time is covered by loaded segments", () => {
    expect(isPlaybackTimeCoveredBySegments(audioSegments, 3_000)).toBe(true);
    expect(isPlaybackTimeCoveredBySegments(audioSegments, 3_001)).toBe(false);
    expect(isPlaybackTimeCoveredBySegments([], 0)).toBe(false);
  });

  it("only treats a loaded segment boundary as covered when the last segment is final", () => {
    const streamingAudioSegments = [
      {
        segment_index: 0,
        audio_data: "first",
        duration_ms: 1_000,
        is_final: false,
      },
    ];

    expect(isPlaybackTimeCoveredBySegments(streamingAudioSegments, 999)).toBe(
      true
    );
    expect(isPlaybackTimeCoveredBySegments(streamingAudioSegments, 1_000)).toBe(
      false
    );
    expect(isPlaybackTimeCoveredBySegments(audioSegments, 3_000)).toBe(true);
  });
});
