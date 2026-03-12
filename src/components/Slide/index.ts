import Slide from "./Slide";
import Player from "./Player";
import {
  getInteractionDefaultSelectedValues,
  getInteractionDefaultValues,
} from "./interaction-defaults";
import useSlide from "./useSlide";

export default Slide;
export {
  Player,
  useSlide,
  getInteractionDefaultValues,
  getInteractionDefaultSelectedValues,
};
export type { SlideProps } from "./Slide";
export type {
  InteractionDefaultResolver,
  InteractionDefaultResolverParams,
  InteractionDefaultValueOptions,
  InteractionDefaultValues,
  InteractionParseResult,
} from "./interaction-defaults";
export type { Element } from "./types";
export type { PlayerProps } from "./Player";
export type { UseSlideResult } from "./useSlide";
