import Slide from "./Slide";
import Player from "./Player";
import {
  applyDiffElement,
  applyUnifiedDiff,
  parseUnifiedDiff,
  splitDiffContent,
} from "./diff-utils";
import {
  getInteractionDefaultSelectedValues,
  getInteractionDefaultValues,
} from "../../lib/interaction-defaults";
import useSlide from "./useSlide";

export default Slide;
export {
  Slide,
  applyDiffElement,
  applyUnifiedDiff,
  parseUnifiedDiff,
  splitDiffContent,
  Player,
  useSlide,
  getInteractionDefaultValues,
  getInteractionDefaultSelectedValues,
};
export type { SlideInteractionTexts, SlideProps } from "./Slide";
export type {
  InteractionDefaultResolver,
  InteractionDefaultResolverParams,
  InteractionDefaultValueOptions,
  InteractionDefaultValues,
  InteractionParseResult,
} from "../../lib/interaction-defaults";
export type {
  Element,
  ElementAudioSegment,
  SlidePlayerCustomActionContext,
  SlidePlayerCustomActions,
} from "./types";
export type { PlayerProps } from "./Player";
export type { UseSlideResult } from "./useSlide";
