import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { applyDiffElement } from "./diff-utils";
import type { Element, ElementAudioSegment } from "./types";
import { resolveNextSlideIndexAfterMarkerAppend } from "./utils/streamingNavigation";

export interface SlideAudioItem {
  audioKey?: string;
  sequenceNumber?: number;
  audioUrl?: string;
  audioSegments?: ElementAudioSegment[];
  isAudioStreaming?: boolean;
  element?: Element;
}

export interface UseSlideResult {
  currentElementList: Element[];
  stepElementLists: Element[][];
  slideElementList: Element[];
  currentIndex: number;
  audioList: SlideAudioItem[];
  currentAudioSequenceIndexes: number[];
  currentStepHasSpeakableElement: boolean;
  currentInteractionElement?: Element;
  canGoPrev: boolean;
  canGoNext: boolean;
  handlePrev: () => void;
  handleNext: () => void;
}

const getMarkerElementList = (elementList: Element[]) =>
  elementList.filter((element) => element.is_marker);

const getMarkerElementIndexes = (elementList: Element[]) =>
  elementList.reduce<number[]>((indexes, element, index) => {
    if (element.is_marker) {
      indexes.push(index);
    }

    return indexes;
  }, []);

const hasPlayableAudio = (element?: Element) =>
  Boolean(
    element?.is_speakable &&
    (element.audio_url || (element.audio_segments?.length ?? 0) > 0)
  );

const isStreamingAudio = (segments: ElementAudioSegment[] = []) =>
  segments.length > 0 && !segments.some((segment) => segment.is_final);

const getElementAudioKey = (element: Element, index: number) => {
  const candidateElement = element as Element & {
    element_bid?: string;
    blockBid?: string;
    generated_block_bid?: string;
  };

  return (
    candidateElement.element_bid ||
    candidateElement.blockBid ||
    candidateElement.generated_block_bid ||
    `${element.type}:${String(element.sequence_number ?? index)}`
  );
};

const getAudioList = (elementList: Element[]) =>
  elementList.reduce<SlideAudioItem[]>((list, element, elementIndex) => {
    if (hasPlayableAudio(element)) {
      const normalizedAudioSegments = element.audio_segments ?? [];
      const hasAudioSegments = normalizedAudioSegments.length > 0;

      list.push({
        audioKey: getElementAudioKey(element, elementIndex),
        sequenceNumber: element.sequence_number,
        // Keep one canonical source to avoid duplicated playback resets.
        // When streaming segments exist, keep playback on the segment source.
        audioUrl: hasAudioSegments ? "" : element.audio_url,
        audioSegments: normalizedAudioSegments,
        isAudioStreaming: isStreamingAudio(normalizedAudioSegments),
        element,
      });
    }

    return list;
  }, []);

const getAudioIndexMap = (elementList: Element[]) => {
  const audioIndexMap = new Map<number, number>();
  let audioIndex = 0;

  elementList.forEach((element, index) => {
    if (hasPlayableAudio(element)) {
      audioIndexMap.set(index, audioIndex);
      audioIndex += 1;
    }
  });

  return audioIndexMap;
};

const getSlideAudioSequenceMap = (
  elementList: Element[],
  markerElementIndexes: number[],
  audioIndexMap: Map<number, number>
) =>
  markerElementIndexes.reduce<Map<number, number[]>>(
    (sequenceMap, startIndex, slideIndex) => {
      const nextMarkerIndex =
        markerElementIndexes[slideIndex + 1] ?? elementList.length;
      const sequenceIndexes: number[] = [];

      for (let index = startIndex; index < nextMarkerIndex; index += 1) {
        const element = elementList[index];

        if (!hasPlayableAudio(element)) {
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
    (element) => element.is_renderable === true
  );

  if (visibleIndex >= 0) {
    return visibleIndex;
  }

  return slideElementList.findIndex(
    (element) => element.is_renderable !== false
  );
};

const getVisibleElement = (element: Element): Element => ({
  ...element,
  is_renderable: true,
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

      if (element.is_new) {
        return [visibleElement];
      }

      if (currentList.length === 0) {
        return [visibleElement];
      }

      return [...currentList, visibleElement];
    }, []);
};

const getStepElementLists = (slideElementList: Element[]) =>
  slideElementList.map((_, index) =>
    getCurrentElementList(slideElementList, index)
  );

const getStepHasSpeakableElement = (
  elementList: Element[],
  markerElementIndexes: number[],
  currentIndex: number
) => {
  if (currentIndex < 0) {
    return false;
  }

  const startIndex = markerElementIndexes[currentIndex];

  if (typeof startIndex !== "number") {
    return false;
  }

  const nextMarkerIndex =
    markerElementIndexes[currentIndex + 1] ?? elementList.length;

  for (let index = startIndex; index < nextMarkerIndex; index += 1) {
    if (elementList[index]?.is_speakable) {
      return true;
    }
  }

  return false;
};

const hasSameElementReferences = (
  prevElementList: Element[],
  nextElementList: Element[]
) =>
  prevElementList.length === nextElementList.length &&
  prevElementList.every((element, index) => element === nextElementList[index]);

const hasSameNumberValues = (prevValues: number[], nextValues: number[]) =>
  prevValues.length === nextValues.length &&
  prevValues.every((value, index) => value === nextValues[index]);

const useSlide = (elementList: Element[] = []): UseSlideResult => {
  const stableElementListRef = useRef(elementList);
  const stableCurrentAudioSequenceIndexesRef = useRef<number[]>([]);
  const stableElementList = useMemo(() => {
    if (hasSameElementReferences(stableElementListRef.current, elementList)) {
      return stableElementListRef.current;
    }

    // Reuse the previous wrapper array when the element references are unchanged.
    stableElementListRef.current = elementList;
    return elementList;
  }, [elementList]);
  const slideElementList = useMemo(
    () => getMarkerElementList(stableElementList),
    [stableElementList]
  );
  const previousSlideElementListRef = useRef(slideElementList);
  const markerElementIndexes = useMemo(
    () => getMarkerElementIndexes(stableElementList),
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
        markerElementIndexes,
        audioIndexMap
      ),
    [audioIndexMap, markerElementIndexes, stableElementList]
  );
  const [currentIndex, setCurrentIndex] = useState(() =>
    getInitialSlideIndex(slideElementList)
  );

  useEffect(() => {
    const previousSlideElementList = previousSlideElementListRef.current;

    setCurrentIndex((prevIndex) => {
      const resolvedNextIndex = resolveNextSlideIndexAfterMarkerAppend({
        previousIndex: prevIndex,
        previousSlideElementList,
        nextSlideElementList: slideElementList,
      });

      if (resolvedNextIndex >= 0) {
        return resolvedNextIndex;
      }

      return getInitialSlideIndex(slideElementList);
    });

    previousSlideElementListRef.current = slideElementList;
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
  const stepElementLists = useMemo(
    () => getStepElementLists(slideElementList),
    [slideElementList]
  );
  const currentAudioSequenceIndexes = useMemo(() => {
    const nextAudioSequenceIndexes =
      slideAudioSequenceMap.get(currentIndex) ?? [];

    if (
      hasSameNumberValues(
        stableCurrentAudioSequenceIndexesRef.current,
        nextAudioSequenceIndexes
      )
    ) {
      return stableCurrentAudioSequenceIndexesRef.current;
    }

    stableCurrentAudioSequenceIndexesRef.current = nextAudioSequenceIndexes;

    return nextAudioSequenceIndexes;
  }, [currentIndex, slideAudioSequenceMap]);
  const currentStepHasSpeakableElement = useMemo(
    () =>
      getStepHasSpeakableElement(
        stableElementList,
        markerElementIndexes,
        currentIndex
      ),
    [currentIndex, markerElementIndexes, stableElementList]
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
    stepElementLists,
    slideElementList,
    currentIndex,
    audioList,
    currentAudioSequenceIndexes,
    currentStepHasSpeakableElement,
    currentInteractionElement,
    canGoPrev,
    canGoNext,
    handlePrev,
    handleNext,
  };
};

export default useSlide;
