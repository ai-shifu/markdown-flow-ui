import type { Element } from "../types";

import { DEFAULT_IMAGE_ONLY_AUTO_ADVANCE_DELAY_MS } from "../constants";

const IMAGE_ONLY_ELEMENT_TYPES = new Set(["img", "md_img", "svg"]);
const COMPLETE_IMAGE_TAG_PATTERN = /<(img|svg)\b[^>]*>/i;
const HTML_COMMENT_RE = /<!--[\s\S]*?-->/g;
const HTML_SCRIPT_RE = /<script\b[^>]*>[\s\S]*?<\/script>/gi;
const HTML_STYLE_RE = /<style\b[^>]*>[\s\S]*?<\/style>/gi;
const HTML_TAG_RE = /<\/?\s*[a-zA-Z][a-zA-Z0-9:_-]*\b[^>]*>/g;
const HTML_SPACE_ENTITY_RE = /&(?:nbsp|ensp|emsp|thinsp|zwnj|zwj);/gi;
const MEANINGFUL_TEXT_RE = /[\p{L}\p{N}]/u;

export interface SilentStepAutoAdvanceDelayParams {
  currentElementList: Element[];
  currentStepHasSpeakableElement: boolean;
  currentInteractionElement?: Element;
  markerAutoAdvanceDelay: number;
}

export interface SilentStepAutoAdvanceBehavior {
  delayMs: number;
  usesImageOnlyDelay: boolean;
}

const isRenderableStepContentElement = (element?: Element) =>
  Boolean(element) && !element?.is_marker && element?.is_renderable !== false;

const hasMeaningfulHtmlText = (content: string) =>
  MEANINGFUL_TEXT_RE.test(
    content
      .replace(HTML_COMMENT_RE, " ")
      .replace(HTML_SCRIPT_RE, " ")
      .replace(HTML_STYLE_RE, " ")
      .replace(HTML_TAG_RE, " ")
      .replace(HTML_SPACE_ENTITY_RE, " ")
      .trim()
  );

const isImageOnlyHtmlElement = (element: Element) => {
  if (element.type !== "html" || typeof element.content !== "string") {
    return false;
  }

  return (
    COMPLETE_IMAGE_TAG_PATTERN.test(element.content) &&
    !hasMeaningfulHtmlText(element.content)
  );
};

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

  return stepContentElements.every(
    (element) =>
      IMAGE_ONLY_ELEMENT_TYPES.has(element.type) ||
      isImageOnlyHtmlElement(element)
  );
};

export const resolveSilentStepAutoAdvanceDelay = ({
  currentElementList,
  currentStepHasSpeakableElement,
  currentInteractionElement,
  markerAutoAdvanceDelay,
}: SilentStepAutoAdvanceDelayParams) =>
  resolveSilentStepAutoAdvanceBehavior({
    currentElementList,
    currentStepHasSpeakableElement,
    currentInteractionElement,
    markerAutoAdvanceDelay,
  }).delayMs;

export const resolveSilentStepAutoAdvanceBehavior = ({
  currentElementList,
  currentStepHasSpeakableElement,
  currentInteractionElement,
  markerAutoAdvanceDelay,
}: SilentStepAutoAdvanceDelayParams): SilentStepAutoAdvanceBehavior => {
  const usesImageOnlyDelay = shouldUseImageOnlySilentStepAutoAdvanceDelay({
    currentElementList,
    currentStepHasSpeakableElement,
    currentInteractionElement,
  });

  return {
    delayMs: usesImageOnlyDelay
      ? DEFAULT_IMAGE_ONLY_AUTO_ADVANCE_DELAY_MS
      : markerAutoAdvanceDelay,
    usesImageOnlyDelay,
  };
};
