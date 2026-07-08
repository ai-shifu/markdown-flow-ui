import type { Element } from "../types";

export const hasResolvedInteractionElement = (element?: Element) =>
  Boolean(element?.readonly || element?.user_input?.trim());

export const isUnresolvedInteractionElement = (element?: Element) =>
  element?.type === "interaction" && !hasResolvedInteractionElement(element);

export interface CanReachSubtitleJumpTargetOptions {
  currentIndex: number;
  slideElementList: Element[];
  targetSlideIndex: number | undefined;
}

export const canReachSubtitleJumpTarget = ({
  currentIndex,
  slideElementList,
  targetSlideIndex,
}: CanReachSubtitleJumpTargetOptions) => {
  if (targetSlideIndex == null || targetSlideIndex < 0) {
    return false;
  }

  if (targetSlideIndex < currentIndex) {
    return true;
  }

  const firstCheckedIndex = Math.max(currentIndex, 0);

  for (
    let slideIndex = firstCheckedIndex;
    slideIndex <= targetSlideIndex;
    slideIndex += 1
  ) {
    if (isUnresolvedInteractionElement(slideElementList[slideIndex])) {
      return false;
    }
  }

  return true;
};
