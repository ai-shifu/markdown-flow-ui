import type { Element } from "../types";

interface ShouldAutoAdvanceIntoAppendedMarkerParams {
  previousMarkerCount: number;
  nextMarkerCount: number;
  previousIndex: number;
  previousCanGoNext: boolean;
  nextCanGoNext: boolean;
  currentAudioKey: string | null;
  hasCompletedCurrentStepAudio: boolean;
  hasResolvedCurrentInteraction: boolean;
  currentStepHasSpeakableElement: boolean;
  currentInteractionElement?: Element;
  isAutoAdvanceEnabled: boolean;
  shouldUseSilentStepAutoAdvanceToggle: boolean;
}

export const shouldAutoAdvanceIntoAppendedMarker = ({
  previousMarkerCount,
  nextMarkerCount,
  previousIndex,
  previousCanGoNext,
  nextCanGoNext,
  currentAudioKey,
  hasCompletedCurrentStepAudio,
  hasResolvedCurrentInteraction,
  currentStepHasSpeakableElement,
  currentInteractionElement,
  isAutoAdvanceEnabled,
  shouldUseSilentStepAutoAdvanceToggle,
}: ShouldAutoAdvanceIntoAppendedMarkerParams) => {
  const hasAppendedMarker = nextMarkerCount > previousMarkerCount;
  const wasFocusedOnPreviousLastMarker =
    previousMarkerCount > 0 && previousIndex === previousMarkerCount - 1;
  const hasJustUnlockedNextStep = !previousCanGoNext && nextCanGoNext;
  const isResolvedInteractionStep =
    Boolean(currentInteractionElement) && hasResolvedCurrentInteraction;
  const isCompletedSpeakableStep =
    currentStepHasSpeakableElement && hasCompletedCurrentStepAudio;
  const isSilentStep =
    !currentStepHasSpeakableElement && !currentInteractionElement;
  const shouldAutoAdvanceSilentStep =
    isSilentStep &&
    (!shouldUseSilentStepAutoAdvanceToggle || isAutoAdvanceEnabled);

  if (!hasAppendedMarker || !wasFocusedOnPreviousLastMarker) {
    return false;
  }

  if (!hasJustUnlockedNextStep || currentAudioKey) {
    return false;
  }

  return (
    isResolvedInteractionStep ||
    isCompletedSpeakableStep ||
    shouldAutoAdvanceSilentStep
  );
};
