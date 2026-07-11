import { describe, expect, it } from "vitest";

import {
  getPlaybackSequenceTransition,
  shouldStartDefaultAudioSequence,
} from "./playbackSequence";

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

  it("starts the default audio sequence when the step has pending audio", () => {
    expect(
      shouldStartDefaultAudioSequence({
        currentAudioKey: null,
        currentAudioSequenceLength: 2,
        currentStepHasSpeakableElement: true,
        hasCompletedCurrentStepAudio: false,
        shouldBlockPlaybackForInteraction: false,
        shouldPausePlaybackForCustomAction: false,
        shouldSkipDefaultAudioStart: false,
      })
    ).toBe(true);
  });

  it("does not start the default audio sequence after a subtitle jump selected a target audio", () => {
    expect(
      shouldStartDefaultAudioSequence({
        currentAudioKey: null,
        currentAudioSequenceLength: 2,
        currentStepHasSpeakableElement: true,
        hasCompletedCurrentStepAudio: false,
        shouldBlockPlaybackForInteraction: false,
        shouldPausePlaybackForCustomAction: false,
        shouldSkipDefaultAudioStart: true,
      })
    ).toBe(false);
  });
});
