import type { Element } from "../types";

import { DEFAULT_IMAGE_ONLY_AUTO_ADVANCE_DELAY_MS } from "../constants";

const IMAGE_ONLY_ELEMENT_TYPES = new Set(["img", "md_img", "svg"]);

export interface SilentStepAutoAdvanceDelayParams {
  currentElementList: Element[];
  currentStepHasSpeakableElement: boolean;
  currentInteractionElement?: Element;
  markerAutoAdvanceDelay: number;
}

const isRenderableStepContentElement = (element?: Element) =>
  Boolean(element) && !element?.is_marker && element?.is_renderable !== false;

export const shouldUseImageOnlySilentStepAutoAdvanceDelay = ({
  currentElementList,
  currentStepHasSpeakableElement,
  currentInteractionElement,
}: Omit<SilentStepAutoAdvanceDelayParams, "markerAutoAdvanceDelay">) => {
  if (currentStepHasSpeakableElement || currentInteractionElement) {
    return false;
  }

  const stepContentElements = currentElementList.filter(
    isRenderableStepContentElement
  );

  if (stepContentElements.length === 0) {
    return false;
  }

  return stepContentElements.every((element) =>
    IMAGE_ONLY_ELEMENT_TYPES.has(element.type)
  );
};

export const resolveSilentStepAutoAdvanceDelay = ({
  currentElementList,
  currentStepHasSpeakableElement,
  currentInteractionElement,
  markerAutoAdvanceDelay,
}: SilentStepAutoAdvanceDelayParams) =>
  shouldUseImageOnlySilentStepAutoAdvanceDelay({
    currentElementList,
    currentStepHasSpeakableElement,
    currentInteractionElement,
  })
    ? DEFAULT_IMAGE_ONLY_AUTO_ADVANCE_DELAY_MS
    : markerAutoAdvanceDelay;
