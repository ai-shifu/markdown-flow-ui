import { useCallback, useEffect, useMemo, useState } from "react";

import type { Element } from "./types";

export interface SlideAudioItem {
  serialNumber?: number;
  audioUrl: string;
}

export interface UseSlideResult {
  currentElement?: Element;
  slideElementList: Element[];
  currentIndex: number;
  audioList: SlideAudioItem[];
  currentAudioSequenceIndexes: number[];
  canGoPrev: boolean;
  canGoNext: boolean;
  handlePrev: () => void;
  handleNext: () => void;
}

const getSlideElementList = (elementList: Element[]) =>
  elementList.filter(
    (element) => element.is_checkpoint && element.type !== "interaction"
  );

const getSlideElementIndexes = (elementList: Element[]) =>
  elementList.reduce<number[]>((indexes, element, index) => {
    if (element.is_checkpoint && element.type !== "interaction") {
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

const useSlide = (elementList: Element[] = []): UseSlideResult => {
  const slideElementList = useMemo(
    () => getSlideElementList(elementList),
    [elementList]
  );
  const slideElementIndexes = useMemo(
    () => getSlideElementIndexes(elementList),
    [elementList]
  );
  const audioList = useMemo(() => getAudioList(elementList), [elementList]);
  const audioIndexMap = useMemo(
    () => getAudioIndexMap(elementList),
    [elementList]
  );
  const slideAudioSequenceMap = useMemo(
    () =>
      getSlideAudioSequenceMap(elementList, slideElementIndexes, audioIndexMap),
    [audioIndexMap, elementList, slideElementIndexes]
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
  const currentElement = useMemo(() => {
    if (currentIndex < 0) {
      return undefined;
    }

    const element = slideElementList[currentIndex];

    if (!element) {
      return undefined;
    }

    return {
      ...element,
      is_show: true,
    };
  }, [currentIndex, slideElementList]);
  const currentAudioSequenceIndexes = useMemo(
    () => slideAudioSequenceMap.get(currentIndex) ?? [],
    [currentIndex, slideAudioSequenceMap]
  );

  return {
    currentElement,
    slideElementList,
    currentIndex,
    audioList,
    currentAudioSequenceIndexes,
    canGoPrev,
    canGoNext,
    handlePrev,
    handleNext,
  };
};

export default useSlide;
