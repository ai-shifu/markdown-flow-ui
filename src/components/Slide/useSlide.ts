import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { applyDiffElement } from "./diff-utils";
import type { Element } from "./types";

export interface SlideAudioItem {
  serialNumber?: number;
  audioUrl: string;
}

export interface UseSlideResult {
  currentElementList: Element[];
  slideElementList: Element[];
  currentIndex: number;
  audioList: SlideAudioItem[];
  currentAudioSequenceIndexes: number[];
  currentInteractionElement?: Element;
  canGoPrev: boolean;
  canGoNext: boolean;
  handlePrev: () => void;
  handleNext: () => void;
}

const getSlideElementList = (elementList: Element[]) =>
  elementList.filter((element) => element.is_checkpoint);

const getSlideElementIndexes = (elementList: Element[]) =>
  elementList.reduce<number[]>((indexes, element, index) => {
    if (element.is_checkpoint) {
      indexes.push(index);
    }

    return indexes;
  }, []);

const getAudioList = (elementList: Element[]) =>
  elementList.reduce<SlideAudioItem[]>((list, element) => {
    if (element.is_read && element.audio_url) {
      list.push({
        serialNumber: element.serial_number,
        audioUrl: element.audio_url,
      });
    }

    return list;
  }, []);

const getAudioIndexMap = (elementList: Element[]) => {
  const audioIndexMap = new Map<number, number>();
  let audioIndex = 0;

  elementList.forEach((element, index) => {
    if (element.is_read && element.audio_url) {
      audioIndexMap.set(index, audioIndex);
      audioIndex += 1;
    }
  });

  return audioIndexMap;
};

const getSlideAudioSequenceMap = (
  elementList: Element[],
  slideElementIndexes: number[],
  audioIndexMap: Map<number, number>
) =>
  slideElementIndexes.reduce<Map<number, number[]>>(
    (sequenceMap, startIndex, slideIndex) => {
      const nextCheckpointIndex =
        slideElementIndexes[slideIndex + 1] ?? elementList.length;
      const sequenceIndexes: number[] = [];

      for (let index = startIndex; index < nextCheckpointIndex; index += 1) {
        const element = elementList[index];

        if (!element?.is_read || !element.audio_url) {
          continue;
        }

        const audioIndex = audioIndexMap.get(index);

        if (audioIndex == null) {
          continue;
        }

        sequenceIndexes.push(audioIndex);
      }

      sequenceMap.set(slideIndex, sequenceIndexes);
      return sequenceMap;
    },
    new Map<number, number[]>()
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

const getVisibleElement = (element: Element): Element => ({
  ...element,
  is_show: true,
});

const getCurrentElementList = (
  slideElementList: Element[],
  currentIndex: number
) => {
  if (currentIndex < 0) {
    return [];
  }

  return slideElementList
    .slice(0, currentIndex + 1)
    .reduce<Element[]>((currentList, element) => {
      if (element.type === "interaction") {
        return currentList;
      }

      const visibleElement = getVisibleElement(element);

      if (visibleElement.type === "diff") {
        const nextList = applyDiffElement(currentList, visibleElement);

        return nextList ?? [...currentList, visibleElement];
      }

      if (element.operation === "new") {
        return [visibleElement];
      }

      if (currentList.length === 0) {
        return [visibleElement];
      }

      return [...currentList, visibleElement];
    }, []);
};

const hasSameElementReferences = (
  prevElementList: Element[],
  nextElementList: Element[]
) =>
  prevElementList.length === nextElementList.length &&
  prevElementList.every((element, index) => element === nextElementList[index]);

const useSlide = (elementList: Element[] = []): UseSlideResult => {
  const stableElementListRef = useRef(elementList);
  const stableElementList = useMemo(() => {
    if (hasSameElementReferences(stableElementListRef.current, elementList)) {
      return stableElementListRef.current;
    }

    // Reuse the previous wrapper array when the element references are unchanged.
    stableElementListRef.current = elementList;
    return elementList;
  }, [elementList]);
  const slideElementList = useMemo(
    () => getSlideElementList(stableElementList),
    [stableElementList]
  );
  const slideElementIndexes = useMemo(
    () => getSlideElementIndexes(stableElementList),
    [stableElementList]
  );
  const audioList = useMemo(
    () => getAudioList(stableElementList),
    [stableElementList]
  );
  const audioIndexMap = useMemo(
    () => getAudioIndexMap(stableElementList),
    [stableElementList]
  );
  const slideAudioSequenceMap = useMemo(
    () =>
      getSlideAudioSequenceMap(
        stableElementList,
        slideElementIndexes,
        audioIndexMap
      ),
    [audioIndexMap, slideElementIndexes, stableElementList]
  );
  const [currentIndex, setCurrentIndex] = useState(() =>
    getInitialSlideIndex(slideElementList)
  );

  useEffect(() => {
    setCurrentIndex((prevIndex) => {
      if (slideElementList.length === 0) {
        return -1;
      }

      if (prevIndex >= 0 && prevIndex < slideElementList.length) {
        return prevIndex;
      }

      return getInitialSlideIndex(slideElementList);
    });
  }, [slideElementList]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex <= 0) {
        return Math.max(prevIndex, 0);
      }

      return Math.max(prevIndex - 1, 0);
    });
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex < 0) {
        return prevIndex;
      }

      return Math.min(prevIndex + 1, slideElementList.length - 1);
    });
  }, [slideElementList.length]);

  const canGoPrev = currentIndex > 0;
  const canGoNext =
    currentIndex >= 0 && currentIndex < slideElementList.length - 1;
  const currentStepElement = useMemo(() => {
    if (currentIndex < 0) {
      return undefined;
    }

    const element = slideElementList[currentIndex];

    if (!element) {
      return undefined;
    }

    return getVisibleElement(element);
  }, [currentIndex, slideElementList]);
  const currentElementList = useMemo(
    () => getCurrentElementList(slideElementList, currentIndex),
    [currentIndex, slideElementList]
  );
  const currentAudioSequenceIndexes = useMemo(
    () => slideAudioSequenceMap.get(currentIndex) ?? [],
    [currentIndex, slideAudioSequenceMap]
  );
  const currentInteractionElement = useMemo(
    () =>
      currentStepElement?.type === "interaction"
        ? currentStepElement
        : undefined,
    [currentStepElement]
  );

  return {
    currentElementList,
    slideElementList,
    currentIndex,
    audioList,
    currentAudioSequenceIndexes,
    currentInteractionElement,
    canGoPrev,
    canGoNext,
    handlePrev,
    handleNext,
  };
};

export default useSlide;
