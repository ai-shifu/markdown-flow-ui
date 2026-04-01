import { describe, expect, it } from "vitest";

import { shouldUseAutoAdvanceToggle } from "./playerToggleMode";

describe("shouldUseAutoAdvanceToggle", () => {
  it("uses the autoplay toggle for silent steps between playable steps", () => {
    expect(
      shouldUseAutoAdvanceToggle({
        canGoNext: true,
        currentAudioIndex: -1,
        currentStepHasSpeakableElement: false,
        hasInteraction: false,
      })
    ).toBe(true);
  });

  it("keeps the audio toggle when the current step still expects speech", () => {
    expect(
      shouldUseAutoAdvanceToggle({
        canGoNext: true,
        currentAudioIndex: -1,
        currentStepHasSpeakableElement: true,
        hasInteraction: false,
      })
    ).toBe(false);
  });

  it("does not replace the toggle on interaction checkpoints", () => {
    expect(
      shouldUseAutoAdvanceToggle({
        canGoNext: true,
        currentAudioIndex: -1,
        currentStepHasSpeakableElement: false,
        hasInteraction: true,
      })
    ).toBe(false);
  });

  it("falls back to the regular toggle on the last step", () => {
    expect(
      shouldUseAutoAdvanceToggle({
        canGoNext: false,
        currentAudioIndex: -1,
        currentStepHasSpeakableElement: false,
        hasInteraction: false,
      })
    ).toBe(false);
  });
});
