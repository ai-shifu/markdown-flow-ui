import { describe, expect, it } from "vitest";

import { resolveSegmentSeekTarget } from "./segmentSeek";

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
});
