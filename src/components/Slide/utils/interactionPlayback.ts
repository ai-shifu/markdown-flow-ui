interface ShouldPresentInteractionOverlayParams {
  hasInteraction: boolean;
  shouldBlockPlaybackForInteraction: boolean;
  shouldOpenInteractionOverlayAfterAudio: boolean;
  hasResolvedCurrentInteraction: boolean;
  currentStepHasSpeakableElement: boolean;
}

export const shouldPresentInteractionOverlay = ({
  hasInteraction,
  shouldBlockPlaybackForInteraction,
  shouldOpenInteractionOverlayAfterAudio,
  hasResolvedCurrentInteraction,
  currentStepHasSpeakableElement,
}: ShouldPresentInteractionOverlayParams) => {
  if (!hasInteraction) {
    return false;
  }

  if (shouldBlockPlaybackForInteraction) {
    return true;
  }

  if (shouldOpenInteractionOverlayAfterAudio) {
    return true;
  }

  if (!hasResolvedCurrentInteraction) {
    return false;
  }

  // Once a resolved interaction step starts receiving follow-up speech,
  // keep the overlay closed so the step can continue as normal playback.
  return !currentStepHasSpeakableElement;
};
