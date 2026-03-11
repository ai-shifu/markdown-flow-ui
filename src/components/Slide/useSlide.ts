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
  currentAudioIndex: number;
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
  const [currentIndex, setCurrentIndex] = useState(() =>
    getInitialSlideIndex(slideElementList)
  );
  const [currentAudioIndex, setCurrentAudioIndex] = useState(-1);

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

  useEffect(() => {
    setCurrentAudioIndex((prevIndex) => {
      if (audioList.length === 0) {
        return -1;
      }

      return prevIndex >= 0 && prevIndex < audioList.length ? prevIndex : -1;
    });
  }, [audioList]);

  const getAudioIndexInRange = useCallback(
    (startIndex: number, endIndex: number, step: 1 | -1) => {
      for (
        let index = startIndex;
        step === 1 ? index <= endIndex : index >= endIndex;
        index += step
      ) {
        const element = elementList[index];

        if (!element?.is_read || !element.audio_url) {
          continue;
        }

        return audioIndexMap.get(index) ?? -1;
      }

      return -1;
    },
    [audioIndexMap, elementList]
  );

  const handlePrev = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex <= 0 || slideElementIndexes[prevIndex] == null) {
        return Math.max(prevIndex, 0);
      }

      const nextIndex = Math.max(prevIndex - 1, 0);

      if (nextIndex === prevIndex) {
        return prevIndex;
      }

      setCurrentAudioIndex(
        getAudioIndexInRange(
          slideElementIndexes[prevIndex] - 1,
          slideElementIndexes[nextIndex],
          -1
        )
      );

      return nextIndex;
    });
  }, [getAudioIndexInRange, slideElementIndexes]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex < 0 || slideElementIndexes[prevIndex] == null) {
        return prevIndex;
      }

      const nextIndex = Math.min(prevIndex + 1, slideElementList.length - 1);

      if (nextIndex === prevIndex) {
        return prevIndex;
      }

      setCurrentAudioIndex(
        getAudioIndexInRange(
          slideElementIndexes[prevIndex] + 1,
          slideElementIndexes[nextIndex],
          1
        )
      );

      return nextIndex;
    });
  }, [getAudioIndexInRange, slideElementIndexes, slideElementList.length]);

  const canGoPrev = currentIndex > 0;
  const canGoNext =
    currentIndex >= 0 && currentIndex < slideElementList.length - 1;

  return {
    currentElement:
      currentIndex >= 0
        ? {
            ...slideElementList[currentIndex],
            is_show: true,
          }
        : undefined,
    slideElementList,
    currentIndex,
    audioList,
    currentAudioIndex,
    canGoPrev,
    canGoNext,
    handlePrev,
    handleNext,
  };
};

export default useSlide;
