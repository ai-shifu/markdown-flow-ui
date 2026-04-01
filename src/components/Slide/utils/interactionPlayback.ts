interface ShouldPresentInteractionOverlayParams {
  hasInteraction: boolean;
  shouldBlockPlaybackForInteraction: boolean;
  shouldOpenInteractionOverlayAfterAudio: boolean;
  hasPlaybackContextChanged: boolean;
  hasResolvedCurrentInteraction: boolean;
  currentStepHasSpeakableElement: boolean;
}

export const shouldPresentInteractionOverlay = ({
  hasInteraction,
  shouldBlockPlaybackForInteraction,
  shouldOpenInteractionOverlayAfterAudio,
  hasPlaybackContextChanged,
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

  // Re-open the interaction entry state whenever playback navigates into
  // the interaction step so the notes action stays highlighted for history
  // playback and manual prev/next navigation.
  if (hasPlaybackContextChanged) {
    return true;
  }

  if (!hasResolvedCurrentInteraction) {
    return false;
  }

  // Once a resolved interaction step starts receiving follow-up speech,
  // keep the overlay closed so the step can continue as normal playback.
  return !currentStepHasSpeakableElement;
};
