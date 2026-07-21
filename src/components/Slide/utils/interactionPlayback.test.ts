import { describe, expect, it } from "vitest";

import {
  shouldPresentInteractionOverlay,
  shouldRenderInteractionOverlay,
} from "./interactionPlayback";

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

describe("shouldRenderInteractionOverlay", () => {
  it("keeps unresolved blocking interactions visible when player controls auto-hide", () => {
    expect(
      shouldRenderInteractionOverlay({
        hasActiveInteraction: true,
        isInteractionOverlayOpen: true,
      })
    ).toBe(true);
  });

  it("shows unresolved blocking interactions while player controls are visible", () => {
    expect(
      shouldRenderInteractionOverlay({
        hasActiveInteraction: true,
        isInteractionOverlayOpen: true,
      })
    ).toBe(true);
  });

  it("keeps resolved or readonly interactions visible even when player controls hide", () => {
    expect(
      shouldRenderInteractionOverlay({
        hasActiveInteraction: true,
        isInteractionOverlayOpen: true,
      })
    ).toBe(true);
  });

  it("does not hide the overlay when the player is not mounted", () => {
    expect(
      shouldRenderInteractionOverlay({
        hasActiveInteraction: true,
        isInteractionOverlayOpen: true,
      })
    ).toBe(true);
  });

  it("hides the overlay when there is no active interaction", () => {
    expect(
      shouldRenderInteractionOverlay({
        hasActiveInteraction: false,
        isInteractionOverlayOpen: true,
      })
    ).toBe(false);
  });

  it("hides the overlay when the interaction overlay is closed", () => {
    expect(
      shouldRenderInteractionOverlay({
        hasActiveInteraction: true,
        isInteractionOverlayOpen: false,
      })
    ).toBe(false);
  });
});
