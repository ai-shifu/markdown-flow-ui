import { describe, expect, it } from "vitest";

import { getPlaybackSequenceTransition } from "./playbackSequence";

describe("playbackSequence", () => {
  it("does not restart the current step after it already finished", () => {
    expect(
      getPlaybackSequenceTransition({
        previousResetKey: "step-1|none",
        nextResetKey: "step-1|none",
        currentAudioKey: null,
        hasCompletedCurrentStepAudio: true,
      })
    ).toEqual({
      hasPlaybackContextChanged: false,
      shouldInitializeAudioSequence: false,
    });
  });

  it("does not rewind an active audio item during append-only updates", () => {
    expect(
      getPlaybackSequenceTransition({
        previousResetKey: "step-1|none",
        nextResetKey: "step-1|none",
        currentAudioKey: "audio-2",
        hasCompletedCurrentStepAudio: false,
      })
    ).toEqual({
      hasPlaybackContextChanged: false,
      shouldInitializeAudioSequence: false,
    });
  });

  it("reinitializes playback when the step context changes", () => {
    expect(
      getPlaybackSequenceTransition({
        previousResetKey: "step-1|none",
        nextResetKey: "step-2|none",
        currentAudioKey: null,
        hasCompletedCurrentStepAudio: true,
      })
    ).toEqual({
      hasPlaybackContextChanged: true,
      shouldInitializeAudioSequence: true,
    });
  });
});
