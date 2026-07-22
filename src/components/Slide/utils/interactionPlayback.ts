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

export interface ShouldRenderInteractionOverlayParams {
  hasActiveInteraction: boolean;
  isInteractionOverlayOpen: boolean;
}

export const shouldRenderInteractionOverlay = ({
  hasActiveInteraction,
  isInteractionOverlayOpen,
}: ShouldRenderInteractionOverlayParams) => {
  if (!hasActiveInteraction || !isInteractionOverlayOpen) {
    return false;
  }

  return true;
};

export interface InteractionOverlayDragOffset {
  x: number;
  y: number;
}

export interface InteractionOverlayDragBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

const clampNumber = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const clampInteractionOverlayDragOffset = (
  offset: InteractionOverlayDragOffset,
  bounds: InteractionOverlayDragBounds
): InteractionOverlayDragOffset => ({
  x: clampNumber(offset.x, bounds.minX, bounds.maxX),
  y: clampNumber(offset.y, bounds.minY, bounds.maxY),
});
