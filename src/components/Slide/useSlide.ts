import { useMemo } from "react";

import type { Element } from "./types";

export interface UseSlideResult {
  currentElement?: Element;
  slideElementList: Element[];
  currentIndex: number;
}

const getSlideElementList = (elementList: Element[]) =>
  elementList.filter(
    (element) => element.is_checkpoint && element.type !== "interaction"
  );

const getInitialSlideIndex = (slideElementList: Element[]) => {
  const visibleIndex = slideElementList.findIndex(
    (element) => element.is_show === true
  );

  if (visibleIndex >= 0) {
    return visibleIndex;
  }

  return slideElementList.findIndex((element) => element.is_show !== false);
};

const useSlide = (elementList: Element[] = []): UseSlideResult => {
  const slideElementList = useMemo(
    () => getSlideElementList(elementList),
    [elementList]
  );

  const currentIndex = useMemo(
    () => getInitialSlideIndex(slideElementList),
    [slideElementList]
  );

  return {
    currentElement:
      currentIndex >= 0 ? slideElementList[currentIndex] : undefined,
    slideElementList,
    currentIndex,
  };
};

export default useSlide;
