import { describe, expect, it } from "vitest";

import { shouldKeepPlayingAfterNavigation } from "./playbackPreference";

const baseState = {
  defaultPlaying: true,
  hasCurrentAudio: true,
  hasPendingAutoPlay: false,
  isPausedByUser: false,
  isPlaybackPaused: false,
  isPlaying: false,
  isWaitingForMoreAudio: false,
};

describe("shouldKeepPlayingAfterNavigation", () => {
  it("keeps playing when the current audio is actively playing", () => {
    expect(
      shouldKeepPlayingAfterNavigation({
        ...baseState,
        isPlaying: true,
      })
    ).toBe(true);
  });

  it("keeps playing while the player is waiting for more audio", () => {
    expect(
      shouldKeepPlayingAfterNavigation({
        ...baseState,
        isWaitingForMoreAudio: true,
      })
    ).toBe(true);
  });

  it("stays paused after the user pauses playback", () => {
    expect(
      shouldKeepPlayingAfterNavigation({
        ...baseState,
        defaultPlaying: false,
        isPausedByUser: true,
      })
    ).toBe(false);
  });

  it("keeps the requested playback state before audio is available", () => {
    expect(
      shouldKeepPlayingAfterNavigation({
        ...baseState,
        hasCurrentAudio: false,
      })
    ).toBe(true);
  });
});
