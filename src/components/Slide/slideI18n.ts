import {
  normalizeMarkdownFlowLocale,
  type MarkdownFlowLocale,
} from "../../lib/locale";
import {
  buildLocaleTexts,
  type LocaleTextValues,
} from "../../lib/localeTextMap";

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

const SLIDE_PLAYER_TEXT_KEYS = [
  "closeSettingsLabel",
  "enterFullscreenLabel",
  "exitFullscreenLabel",
  "moreOptionsAriaLabel",
  "nextLabel",
  "nextSubtitleLabel",
  "notesLabel",
  "pauseAutoplayLabel",
  "pauseLabel",
  "playAutoplayLabel",
  "playLabel",
  "previousLabel",
  "previousSubtitleLabel",
  "screenModeLabel",
  "settingsTitle",
  "subtitleLabel",
  "subtitleToggleAriaLabel",
  "volumeAriaLabel",
  "screenLabel",
  "nonFullscreenLabel",
  "fullscreenLabel",
  "fullscreenHintText",
] as const satisfies readonly (keyof SlidePlayerLocaleTexts)[];

const SLIDE_INTERACTION_TEXT_KEYS = [
  "title",
  "confirmButtonText",
  "copyButtonText",
  "copiedButtonText",
] as const satisfies readonly (keyof SlideInteractionLocaleTexts)[];

const SLIDE_BUFFERING_TEXT_KEYS = [
  "waitingForAudio",
  "loadingAudio",
  "waitingForMoreAudio",
] as const satisfies readonly SlideBufferingReason[];

const createSlidePlayerTexts = (
  values: LocaleTextValues<typeof SLIDE_PLAYER_TEXT_KEYS>
): SlidePlayerLocaleTexts =>
  buildLocaleTexts(SLIDE_PLAYER_TEXT_KEYS, values) as SlidePlayerLocaleTexts;

const createSlideInteractionTexts = (
  values: LocaleTextValues<typeof SLIDE_INTERACTION_TEXT_KEYS>
): SlideInteractionLocaleTexts =>
  buildLocaleTexts(
    SLIDE_INTERACTION_TEXT_KEYS,
    values
  ) as SlideInteractionLocaleTexts;

const createSlideBufferingTexts = (
  values: LocaleTextValues<typeof SLIDE_BUFFERING_TEXT_KEYS>
): Record<SlideBufferingReason, string> =>
  buildLocaleTexts(SLIDE_BUFFERING_TEXT_KEYS, values) as Record<
    SlideBufferingReason,
    string
  >;

const createSlideLocaleTexts = (
  fullscreenBackAriaLabel: string,
  bufferingValues: LocaleTextValues<typeof SLIDE_BUFFERING_TEXT_KEYS>,
  interactionValues: LocaleTextValues<typeof SLIDE_INTERACTION_TEXT_KEYS>,
  playerValues: LocaleTextValues<typeof SLIDE_PLAYER_TEXT_KEYS>
): SlideLocaleTexts => ({
  bufferingText: createSlideBufferingTexts(bufferingValues),
  fullscreenBackAriaLabel,
  interactionTexts: createSlideInteractionTexts(interactionValues),
  playerTexts: createSlidePlayerTexts(playerValues),
});

export const DEFAULT_SLIDE_PLAYER_TEXTS: SlidePlayerLocaleTexts =
  createSlidePlayerTexts([
    "Close settings",
    "Enter fullscreen",
    "Exit fullscreen",
    "More options",
    "Next page",
    "Next sentence",
    "Notes",
    "Pause autoplay",
    "Pause",
    "Play autoplay",
    "Play",
    "Previous page",
    "Previous sentence",
    "Screen mode",
    "Settings",
    "Subtitles",
    "Toggle subtitles",
    "Volume",
    "Screen",
    "Non-fullscreen",
    "Fullscreen",
    "Please rotate your screen for the best experience",
  ]);

export const DEFAULT_SLIDE_INTERACTION_TEXTS: SlideInteractionLocaleTexts =
  createSlideInteractionTexts([
    "Submit the content below to continue.",
    "Submit",
    "Copy",
    "Copied",
  ]);

export const DEFAULT_SLIDE_BUFFERING_TEXTS = createSlideBufferingTexts([
  "Waiting for current slide audio...",
  "Loading audio...",
  "Waiting for more audio...",
]);

export const SLIDE_LOCALE_TEXTS: Record<MarkdownFlowLocale, SlideLocaleTexts> =
  {
    "en-US": {
      bufferingText: DEFAULT_SLIDE_BUFFERING_TEXTS,
      fullscreenBackAriaLabel: "Back to non-full screen",
      interactionTexts: DEFAULT_SLIDE_INTERACTION_TEXTS,
      playerTexts: DEFAULT_SLIDE_PLAYER_TEXTS,
    },
    "fr-FR": createSlideLocaleTexts(
      "Retour au mode non plein écran",
      [
        "En attente de l'audio de la diapositive actuelle...",
        "Chargement audio…",
        "En attente de plus d’audio…",
      ],
      [
        "Soumettez le contenu ci-dessous pour continuer.",
        "Soumettre",
        "Copier",
        "Copié",
      ],
      [
        "Fermer les paramètres",
        "Passer en plein écran",
        "Quitter le plein écran",
        "Plus d'options",
        "Page suivante",
        "Phrase suivante",
        "Notes",
        "Suspendre la lecture automatique",
        "Pause",
        "Lancer la lecture automatique",
        "Lecture",
        "Page précédente",
        "Phrase précédente",
        "Mode d'affichage",
        "Paramètres",
        "Sous-titres",
        "Afficher ou masquer les sous-titres",
        "Volume",
        "Écran",
        "Hors plein écran",
        "Plein écran",
        "Veuillez tourner votre écran pour une meilleure expérience",
      ]
    ),
    "zh-CN": createSlideLocaleTexts(
      "返回非全屏",
      ["正在等待当前页音频...", "正在加载音频", "正在等待音频"],
      ["提交下面的内容以继续", "提交", "复制", "已复制"],
      [
        "关闭设置",
        "进入全屏",
        "退出全屏",
        "更多选项",
        "下一页",
        "下一句",
        "笔记",
        "暂停自动播放",
        "暂停",
        "开始自动播放",
        "播放",
        "上一页",
        "上一句",
        "屏幕模式",
        "设置",
        "字幕",
        "切换字幕",
        "音量",
        "屏幕",
        "非全屏",
        "全屏",
        "请旋转屏幕以获得最佳体验",
      ]
    ),
  };

export const getSlideLocaleTexts = (locale?: string | null): SlideLocaleTexts =>
  SLIDE_LOCALE_TEXTS[normalizeMarkdownFlowLocale(locale)];

export const getSlidePlayerTexts = (
  locale?: string | null
): SlidePlayerLocaleTexts => getSlideLocaleTexts(locale).playerTexts;
