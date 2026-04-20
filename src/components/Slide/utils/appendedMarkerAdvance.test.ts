import { describe, expect, it } from "vitest";

import type { Element } from "../types";
import { shouldAutoAdvanceIntoAppendedMarker } from "./appendedMarkerAdvance";

const createInteractionElement = (): Element => ({
  content: "?[%{{level}}A|B]",
  type: "interaction",
  is_marker: true,
  is_renderable: true,
});

describe("shouldAutoAdvanceIntoAppendedMarker", () => {
  it("advances when a completed speakable terminal step receives a new marker", () => {
    expect(
      shouldAutoAdvanceIntoAppendedMarker({
        previousMarkerCount: 1,
        nextMarkerCount: 2,
        previousIndex: 0,
        previousCanGoNext: false,
        nextCanGoNext: true,
        currentAudioKey: null,
        hasCompletedCurrentStepAudio: true,
        hasResolvedCurrentInteraction: false,
        currentStepHasSpeakableElement: true,
        currentInteractionElement: undefined,
        isAutoAdvanceEnabled: true,
        shouldUseSilentStepAutoAdvanceToggle: true,
      })
    ).toBe(true);
  });

  it("advances when a resolved interaction terminal step receives a new marker", () => {
    expect(
      shouldAutoAdvanceIntoAppendedMarker({
        previousMarkerCount: 1,
        nextMarkerCount: 2,
        previousIndex: 0,
        previousCanGoNext: false,
        nextCanGoNext: true,
        currentAudioKey: null,
        hasCompletedCurrentStepAudio: false,
        hasResolvedCurrentInteraction: true,
        currentStepHasSpeakableElement: false,
        currentInteractionElement: createInteractionElement(),
        isAutoAdvanceEnabled: true,
        shouldUseSilentStepAutoAdvanceToggle: true,
      })
    ).toBe(true);
  });

  it("does not advance while the current step audio is still active", () => {
    expect(
      shouldAutoAdvanceIntoAppendedMarker({
        previousMarkerCount: 1,
        nextMarkerCount: 2,
        previousIndex: 0,
        previousCanGoNext: false,
        nextCanGoNext: true,
        currentAudioKey: "audio-1",
        hasCompletedCurrentStepAudio: false,
        hasResolvedCurrentInteraction: false,
        currentStepHasSpeakableElement: true,
        currentInteractionElement: undefined,
        isAutoAdvanceEnabled: true,
        shouldUseSilentStepAutoAdvanceToggle: true,
      })
    ).toBe(false);
  });

  it("does not advance when the newly appended marker did not unlock the next step", () => {
    expect(
      shouldAutoAdvanceIntoAppendedMarker({
        previousMarkerCount: 2,
        nextMarkerCount: 3,
        previousIndex: 0,
        previousCanGoNext: true,
        nextCanGoNext: true,
        currentAudioKey: null,
        hasCompletedCurrentStepAudio: true,
        hasResolvedCurrentInteraction: false,
        currentStepHasSpeakableElement: true,
        currentInteractionElement: undefined,
        isAutoAdvanceEnabled: true,
        shouldUseSilentStepAutoAdvanceToggle: true,
      })
    ).toBe(false);
  });
});
