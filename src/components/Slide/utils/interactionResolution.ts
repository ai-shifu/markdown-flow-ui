import {
  getInteractionDefaultSelectedValues,
  getInteractionDefaultValues,
  type InteractionDefaultValueOptions,
} from "../../../lib/interaction-defaults";
import type { Element } from "../types";

interface ResolveSlideInteractionStateOptions {
  interactionDefaultValueOptions?: InteractionDefaultValueOptions;
}

export const resolveSlideInteractionState = (
  activeInteractionElement?: Element,
  options: ResolveSlideInteractionStateOptions = {}
) => {
  const { interactionDefaultValueOptions } = options;
  if (!activeInteractionElement) {
    return {
      interactionDefaults: {},
      interactionDefaultSelectedValues: undefined,
      hasResolvedInteractionInput: false,
      isInteractionReadonly: false,
      shouldAutoContinueInteraction: false,
    };
  }

  const interactionContent =
    typeof activeInteractionElement.content === "string"
      ? activeInteractionElement.content
      : undefined;
  const hasResolvedInteractionInput = Boolean(
    activeInteractionElement.user_input?.trim()
  );
  const effectiveDefaultValueOptions = hasResolvedInteractionInput
    ? undefined
    : interactionDefaultValueOptions;

  return {
    interactionDefaults: getInteractionDefaultValues(
      interactionContent,
      activeInteractionElement.user_input,
      effectiveDefaultValueOptions
    ),
    interactionDefaultSelectedValues: getInteractionDefaultSelectedValues(
      interactionContent,
      activeInteractionElement.user_input,
      effectiveDefaultValueOptions
    ),
    hasResolvedInteractionInput,
    isInteractionReadonly: Boolean(activeInteractionElement.readonly),
    // Keep auto-continue only for passive markers that are explicitly readonly.
    shouldAutoContinueInteraction: Boolean(activeInteractionElement.readonly),
  };
};
