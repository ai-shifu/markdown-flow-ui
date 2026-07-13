import type { Element } from "../types";

interface ResolveNextSlideIndexParams {
  previousIndex: number;
  previousSlideElementList: Element[];
  nextSlideElementList: Element[];
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

const hasStableMarkerIdentityPrefix = (
  previousSlideElementList: Element[],
  nextSlideElementList: Element[]
) =>
  nextSlideElementList.length <= previousSlideElementList.length &&
  nextSlideElementList.every((element, index) => {
    const previousElement = previousSlideElementList[index];

    return (
      element.type === previousElement?.type &&
      element.sequence_number === previousElement?.sequence_number &&
      element.content === previousElement?.content
    );
  });

export const resolveNextSlideIndexAfterMarkerAppend = ({
  previousIndex,
  previousSlideElementList,
  nextSlideElementList,
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
    isResolvedInteractionElement(previousCurrentElement)
  ) {
    return previousSlideElementList.length;
  }

  const hasTruncatedMarkers =
    nextSlideElementList.length < previousSlideElementList.length &&
    hasStableMarkerIdentityPrefix(
      previousSlideElementList,
      nextSlideElementList
    );

  if (hasTruncatedMarkers && nextSlideElementList.length > 0) {
    return Math.min(previousIndex, nextSlideElementList.length - 1);
  }

  if (previousIndex >= 0 && previousIndex < nextSlideElementList.length) {
    return previousIndex;
  }

  return -1;
};
