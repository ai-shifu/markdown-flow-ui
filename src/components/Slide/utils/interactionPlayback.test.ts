import { describe, expect, it } from "vitest";

import { shouldPresentInteractionOverlay } from "./interactionPlayback";

describe("shouldPresentInteractionOverlay", () => {
  it("keeps unresolved interactions blocking playback", () => {
    expect(
      shouldPresentInteractionOverlay({
        hasInteraction: true,
        shouldBlockPlaybackForInteraction: true,
        shouldOpenInteractionOverlayAfterAudio: false,
        hasResolvedCurrentInteraction: false,
        currentStepHasSpeakableElement: false,
      })
    ).toBe(true);
  });

  it("keeps resolved history interactions open when no follow-up speech exists", () => {
    expect(
      shouldPresentInteractionOverlay({
        hasInteraction: true,
        shouldBlockPlaybackForInteraction: false,
        shouldOpenInteractionOverlayAfterAudio: false,
        hasResolvedCurrentInteraction: true,
        currentStepHasSpeakableElement: false,
      })
    ).toBe(true);
  });

  it("allows resolved interaction steps to continue playback once follow-up speech arrives", () => {
    expect(
      shouldPresentInteractionOverlay({
        hasInteraction: true,
        shouldBlockPlaybackForInteraction: false,
        shouldOpenInteractionOverlayAfterAudio: false,
        hasResolvedCurrentInteraction: true,
        currentStepHasSpeakableElement: true,
      })
    ).toBe(false);
  });
});
