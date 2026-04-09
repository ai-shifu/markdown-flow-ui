import React from "react";
import type {
  Element,
  SlidePlayerCustomActionContext,
  SlidePlayerCustomActions,
} from "../types";
import type { SlideAudioItem } from "../useSlide";

const noop = () => {};

const DEFAULT_PLAYER_CUSTOM_ACTION_CONTEXT: SlidePlayerCustomActionContext = {
  currentElement: undefined,
  currentIndex: -1,
  currentStepElement: undefined,
  isActive: false,
  setActive: noop,
  toggleActive: noop,
};

const resolvePlayerCustomActions = (
  customActions?: SlidePlayerCustomActions,
  context: SlidePlayerCustomActionContext = DEFAULT_PLAYER_CUSTOM_ACTION_CONTEXT
) =>
  typeof customActions === "function" ? customActions(context) : customActions;

type ResolvePlayerCustomActionElementParams = {
  currentAudioIndex: number;
  currentAudioSequenceIndexes: number[];
  audioList: SlideAudioItem[];
  currentStepElement?: Element;
  currentInteractionElement?: Element;
};

export const resolvePlayerCustomActionElement = ({
  currentAudioIndex,
  currentAudioSequenceIndexes,
  audioList,
  currentStepElement,
  currentInteractionElement,
}: ResolvePlayerCustomActionElementParams) => {
  const currentAudioElement =
    currentAudioIndex >= 0 ? audioList[currentAudioIndex]?.element : undefined;
  const currentSequenceAudioIndex = currentAudioSequenceIndexes[0];
  const currentSequenceAudioElement =
    typeof currentSequenceAudioIndex === "number"
      ? audioList[currentSequenceAudioIndex]?.element
      : undefined;

  return (
    currentAudioElement ??
    currentSequenceAudioElement ??
    currentInteractionElement ??
    currentStepElement
  );
};

export const toPlayerCustomActionList = (
  customActions?: SlidePlayerCustomActions,
  context?: SlidePlayerCustomActionContext
) => React.Children.toArray(resolvePlayerCustomActions(customActions, context));

export const getPlayerCustomActionCount = (
  customActions?: SlidePlayerCustomActions,
  context?: SlidePlayerCustomActionContext
) => toPlayerCustomActionList(customActions, context).length;
