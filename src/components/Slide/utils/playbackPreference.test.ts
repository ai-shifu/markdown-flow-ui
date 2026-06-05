import { describe, expect, it } from "vitest";

import { shouldKeepPlayingAfterNavigation } from "./playbackPreference";

describe("shouldKeepPlayingAfterNavigation", () => {
  it("keeps playing when playback is requested and not paused by user", () => {
    expect(
      shouldKeepPlayingAfterNavigation({
        defaultPlaying: true,
        isPausedByUser: false,
      })
    ).toBe(true);
  });

  it("stays paused when playback is not requested", () => {
    expect(
      shouldKeepPlayingAfterNavigation({
        defaultPlaying: false,
        isPausedByUser: false,
      })
    ).toBe(false);
  });

  it("stays paused after the user pauses playback", () => {
    expect(
      shouldKeepPlayingAfterNavigation({
        defaultPlaying: true,
        isPausedByUser: true,
      })
    ).toBe(false);
  });
});
