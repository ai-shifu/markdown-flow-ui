import { describe, expect, it } from "vitest";

import { shouldPresentInteractionOverlay } from "./interactionPlayback";

describe("shouldPresentInteractionOverlay", () => {
  it("keeps unresolved interactions blocking playback", () => {
    expect(
      shouldPresentInteractionOverlay({
        hasInteraction: true,
        shouldBlockPlaybackForInteraction: true,
        shouldOpenInteractionOverlayAfterAudio: false,
        hasPlaybackContextChanged: false,
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
        hasPlaybackContextChanged: false,
        hasResolvedCurrentInteraction: true,
        currentStepHasSpeakableElement: false,
      })
    ).toBe(true);
  });

  it("re-opens resolved interaction steps when playback navigates back into them", () => {
    expect(
      shouldPresentInteractionOverlay({
        hasInteraction: true,
        shouldBlockPlaybackForInteraction: false,
        shouldOpenInteractionOverlayAfterAudio: false,
        hasPlaybackContextChanged: true,
        hasResolvedCurrentInteraction: true,
        currentStepHasSpeakableElement: true,
      })
    ).toBe(true);
  });

  it("allows resolved interaction steps to continue playback once follow-up speech arrives without navigation", () => {
    expect(
      shouldPresentInteractionOverlay({
        hasInteraction: true,
        shouldBlockPlaybackForInteraction: false,
        shouldOpenInteractionOverlayAfterAudio: false,
        hasPlaybackContextChanged: false,
        hasResolvedCurrentInteraction: true,
        currentStepHasSpeakableElement: true,
      })
    ).toBe(false);
  });
});
