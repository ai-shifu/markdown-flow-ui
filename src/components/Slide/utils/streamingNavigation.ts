import type { Element } from "../types";

interface ResolveNextSlideIndexParams {
  previousIndex: number;
  previousSlideElementList: Element[];
  nextSlideElementList: Element[];
  previousStepHasSpeakableElement: boolean;
}

const isResolvedInteractionElement = (element?: Element) =>
  Boolean(
    element?.type === "interaction" &&
      (element.readonly || element.user_input?.trim())
  );

const hasStableMarkerPrefix = (
  previousSlideElementList: Element[],
  nextSlideElementList: Element[]
) =>
  previousSlideElementList.length <= nextSlideElementList.length &&
  previousSlideElementList.every(
    (element, index) => element === nextSlideElementList[index]
  );

export const resolveNextSlideIndexAfterMarkerAppend = ({
  previousIndex,
  previousSlideElementList,
  nextSlideElementList,
  previousStepHasSpeakableElement,
}: ResolveNextSlideIndexParams) => {
  if (nextSlideElementList.length === 0) {
    return -1;
  }

  const hasAppendedMarkers =
    nextSlideElementList.length > previousSlideElementList.length &&
    hasStableMarkerPrefix(previousSlideElementList, nextSlideElementList);
  const previousLastMarkerIndex = previousSlideElementList.length - 1;
  const wasFocusedOnPreviousLastMarker =
    previousIndex === previousLastMarkerIndex;
  const previousCurrentElement =
    previousIndex >= 0 ? previousSlideElementList[previousIndex] : undefined;

  // When a resolved interaction is already the terminal step and SSE appends
  // the first follow-up marker, jump into that new marker immediately instead
  // of waiting for the interaction auto-close and silent-step delay.
  if (
    hasAppendedMarkers &&
    wasFocusedOnPreviousLastMarker &&
    (isResolvedInteractionElement(previousCurrentElement) ||
      (!previousStepHasSpeakableElement &&
        previousCurrentElement?.type !== "interaction"))
  ) {
    return previousSlideElementList.length;
  }

  if (previousIndex >= 0 && previousIndex < nextSlideElementList.length) {
    return previousIndex;
  }

  return -1;
};
