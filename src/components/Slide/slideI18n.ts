import {
  normalizeMarkdownFlowLocale,
  type MarkdownFlowLocale,
} from "../../lib/locale";
import localeTexts from "./locales/slide.json";

export interface SlidePlayerLocaleTexts {
  closeSettingsLabel: string;
  enterFullscreenLabel: string;
  exitFullscreenLabel: string;
  moreOptionsAriaLabel: string;
  nextLabel: string;
  nextSubtitleLabel: string;
  notesLabel: string;
  pauseAutoplayLabel: string;
  pauseLabel: string;
  playAutoplayLabel: string;
  playLabel: string;
  previousLabel: string;
  previousSubtitleLabel: string;
  screenModeLabel: string;
  settingsTitle: string;
  subtitleLabel: string;
  subtitleToggleAriaLabel: string;
  volumeAriaLabel: string;
  screenLabel: string;
  nonFullscreenLabel: string;
  fullscreenLabel: string;
  fullscreenHintText: string;
}

export interface SlideInteractionLocaleTexts {
  title: string;
  confirmButtonText: string;
  copyButtonText: string;
  copiedButtonText: string;
  dragHandleAriaLabel: string;
}

export type SlideBufferingReason =
  | "waitingForAudio"
  | import("./Player").SlidePlayerLoadingReason;

export interface SlideLocaleTexts {
  bufferingText: Record<SlideBufferingReason, string>;
  fullscreenBackAriaLabel: string;
  interactionTexts: SlideInteractionLocaleTexts;
  playerTexts: SlidePlayerLocaleTexts;
}

export const SLIDE_LOCALE_TEXTS: Record<MarkdownFlowLocale, SlideLocaleTexts> =
  localeTexts;

export const DEFAULT_SLIDE_PLAYER_TEXTS: SlidePlayerLocaleTexts =
  SLIDE_LOCALE_TEXTS["en-US"].playerTexts;

export const DEFAULT_SLIDE_INTERACTION_TEXTS: SlideInteractionLocaleTexts =
  SLIDE_LOCALE_TEXTS["en-US"].interactionTexts;

export const DEFAULT_SLIDE_BUFFERING_TEXTS: Record<
  SlideBufferingReason,
  string
> = SLIDE_LOCALE_TEXTS["en-US"].bufferingText;

export const getSlideLocaleTexts = (locale?: string | null): SlideLocaleTexts =>
  SLIDE_LOCALE_TEXTS[normalizeMarkdownFlowLocale(locale)];

export const getSlidePlayerTexts = (
  locale?: string | null
): SlidePlayerLocaleTexts => getSlideLocaleTexts(locale).playerTexts;
