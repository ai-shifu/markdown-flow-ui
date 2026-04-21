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
export type {
  SlideInteractionTexts,
  SlideFullscreenHeader,
  SlideErrorCode,
  SlideErrorContext,
  SlideProps,
} from "./Slide";
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
  ElementSubtitleCue,
  SlidePlayerCustomActionContext,
  SlidePlayerCustomActions,
} from "./types";
export type { PlayerProps, SlidePlayerTexts } from "./Player";
export type { UseSlideResult } from "./useSlide";
export type { MobileViewMode } from "./utils/mobileScreenMode";
export { SLIDE_ERROR_CODES } from "./constants";
