import { describe, expect, it } from "vitest";

import { resolveAudioPlaybackSourceType } from "./playbackSource";

describe("resolveAudioPlaybackSourceType", () => {
  it("prefers segment playback when both segments and URL are available initially", () => {
    expect(
      resolveAudioPlaybackSourceType({
        activeSourceType: null,
        hasAudioUrl: true,
        segmentCount: 2,
        preferredSourceType: null,
        waitingSegmentIndex: null,
      })
    ).toBe("segment");
  });

  it("keeps the segment source while the current segment playback is active", () => {
    expect(
      resolveAudioPlaybackSourceType({
        activeSourceType: "segment",
        hasAudioUrl: true,
        segmentCount: 2,
        preferredSourceType: "segment",
        waitingSegmentIndex: null,
      })
    ).toBe("segment");
  });

  it("falls back to the URL source when segment playback stalls", () => {
    expect(
      resolveAudioPlaybackSourceType({
        activeSourceType: "segment",
        hasAudioUrl: true,
        segmentCount: 1,
        preferredSourceType: "segment",
        waitingSegmentIndex: 1,
      })
    ).toBe("url");
  });

  it("keeps the URL source once fallback already happened", () => {
    expect(
      resolveAudioPlaybackSourceType({
        activeSourceType: "url",
        hasAudioUrl: true,
        segmentCount: 2,
        preferredSourceType: "url",
        waitingSegmentIndex: null,
      })
    ).toBe("url");
  });
});
