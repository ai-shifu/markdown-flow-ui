import { describe, expect, it } from "vitest";

import {
  clampInteractionOverlayDragOffset,
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
  it("renders active open interactions", () => {
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

describe("clampInteractionOverlayDragOffset", () => {
  it("keeps dragged interaction overlays within the viewport bounds", () => {
    expect(
      clampInteractionOverlayDragOffset(
        { x: 240, y: -180 },
        { minX: -80, maxX: 120, minY: -100, maxY: 60 }
      )
    ).toEqual({ x: 120, y: -100 });
  });

  it("preserves offsets that are already inside the viewport bounds", () => {
    expect(
      clampInteractionOverlayDragOffset(
        { x: 24, y: -12 },
        { minX: -80, maxX: 120, minY: -100, maxY: 60 }
      )
    ).toEqual({ x: 24, y: -12 });
  });
});
