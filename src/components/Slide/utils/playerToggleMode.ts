interface ShouldUseAutoAdvanceToggleParams {
  canGoNext: boolean;
  currentAudioIndex: number;
  currentStepHasSpeakableElement: boolean;
  hasInteraction: boolean;
}

export const shouldUseAutoAdvanceToggle = ({
  canGoNext,
  currentAudioIndex,
  currentStepHasSpeakableElement,
  hasInteraction,
}: ShouldUseAutoAdvanceToggleParams) =>
  canGoNext &&
  currentAudioIndex < 0 &&
  !currentStepHasSpeakableElement &&
  !hasInteraction;
