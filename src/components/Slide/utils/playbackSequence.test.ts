import { describe, expect, it } from "vitest";

import {
  getPlaybackSequenceTransition,
  resolveNextPendingAudioKey,
} from "./playbackSequence";

describe("playbackSequence", () => {
  it("starts from the first audio when the step has not completed anything yet", () => {
    expect(
      resolveNextPendingAudioKey({
        audioSequenceKeys: ["audio-1", "audio-2"],
        lastCompletedAudioKey: null,
      })
    ).toBe("audio-1");
  });

  it("resumes from the next appended audio after the last completed item", () => {
    expect(
      resolveNextPendingAudioKey({
        audioSequenceKeys: ["audio-1", "audio-2"],
        lastCompletedAudioKey: "audio-1",
      })
    ).toBe("audio-2");
  });

  it("returns null when there is no later audio left in the current step", () => {
    expect(
      resolveNextPendingAudioKey({
        audioSequenceKeys: ["audio-1"],
        lastCompletedAudioKey: "audio-1",
      })
    ).toBeNull();
  });

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
