import { describe, expect, it } from "vitest";

import {
  hasUnplayedStepAudio,
  resolvePendingStepAudioKey,
} from "./stepAudioProgress";

describe("resolvePendingStepAudioKey", () => {
  it("starts at the first key when nothing has played", () => {
    expect(resolvePendingStepAudioKey(["a", "b"], new Set())).toBe("a");
  });

  it("resumes at the first unplayed key instead of replaying the opening one", () => {
    expect(resolvePendingStepAudioKey(["a", "b", "c"], new Set(["a"]))).toBe(
      "b"
    );
  });

  it("returns undefined once every key has played", () => {
    expect(
      resolvePendingStepAudioKey(["a", "b"], new Set(["a", "b"]))
    ).toBeUndefined();
  });

  it("returns undefined for a step with no audio", () => {
    expect(resolvePendingStepAudioKey([], new Set())).toBeUndefined();
  });

  it("skips played keys that are no longer at the head of the sequence", () => {
    expect(
      resolvePendingStepAudioKey(["a", "b", "c"], new Set(["a", "b"]))
    ).toBe("c");
  });
});

describe("hasUnplayedStepAudio", () => {
  it("reports no pending audio when the sequence is fully played", () => {
    expect(hasUnplayedStepAudio(["a", "b"], new Set(["a", "b"]))).toBe(false);
  });

  it("reports pending audio when a segment is appended after completion", () => {
    // The learner answered an interaction, the first narration segment played
    // out, and the rest was still being synthesized. The newly arrived segment
    // has to reopen the step, otherwise it never plays.
    const playedAudioKeys = new Set(["a"]);

    expect(hasUnplayedStepAudio(["a"], playedAudioKeys)).toBe(false);
    expect(hasUnplayedStepAudio(["a", "b"], playedAudioKeys)).toBe(true);
  });

  it("reports no pending audio for an empty sequence", () => {
    expect(hasUnplayedStepAudio([], new Set())).toBe(false);
  });
});
