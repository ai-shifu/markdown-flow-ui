import {
  normalizeMarkdownFlowLocale,
  type MarkdownFlowLocale,
} from "../../lib/locale";

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

export interface SlideLocaleTexts {
  bufferingText: Record<string, string>;
  fullscreenBackAriaLabel: string;
  interactionTexts: SlideInteractionLocaleTexts;
  playerTexts: SlidePlayerLocaleTexts;
}

export const DEFAULT_SLIDE_PLAYER_TEXTS: SlidePlayerLocaleTexts = {
  closeSettingsLabel: "Close settings",
  enterFullscreenLabel: "Enter fullscreen",
  exitFullscreenLabel: "Exit fullscreen",
  moreOptionsAriaLabel: "More options",
  nextLabel: "Next page",
  nextSubtitleLabel: "Next sentence",
  notesLabel: "Notes",
  pauseAutoplayLabel: "Pause autoplay",
  pauseLabel: "Pause",
  playAutoplayLabel: "Play autoplay",
  playLabel: "Play",
  previousLabel: "Previous page",
  previousSubtitleLabel: "Previous sentence",
  screenModeLabel: "Screen mode",
  settingsTitle: "Settings",
  subtitleLabel: "Subtitles",
  subtitleToggleAriaLabel: "Toggle subtitles",
  volumeAriaLabel: "Volume",
  screenLabel: "Screen",
  nonFullscreenLabel: "Non-fullscreen",
  fullscreenLabel: "Fullscreen",
  fullscreenHintText: "Rotate your screen for the best experience.",
};

export const DEFAULT_SLIDE_INTERACTION_TEXTS: SlideInteractionLocaleTexts = {
  title: "Submit the content below to continue.",
  confirmButtonText: "Submit",
  copyButtonText: "Copy",
  copiedButtonText: "Copied",
};

export const DEFAULT_SLIDE_BUFFERING_TEXTS = {
  waitingForAudio: "Waiting for current slide audio...",
  loadingAudio: "Loading current slide audio...",
  waitingForMoreAudio: "Waiting for more current slide audio...",
} as const;

export const SLIDE_LOCALE_TEXTS: Record<MarkdownFlowLocale, SlideLocaleTexts> =
  {
    "en-US": {
      bufferingText: DEFAULT_SLIDE_BUFFERING_TEXTS,
      fullscreenBackAriaLabel: "Back",
      interactionTexts: DEFAULT_SLIDE_INTERACTION_TEXTS,
      playerTexts: DEFAULT_SLIDE_PLAYER_TEXTS,
    },
    "fr-FR": {
      bufferingText: {
        waitingForAudio: "En attente de l'audio de la diapositive actuelle...",
        loadingAudio: "Chargement de l'audio de la diapositive actuelle...",
        waitingForMoreAudio:
          "En attente de la suite de l'audio de la diapositive actuelle...",
      },
      fullscreenBackAriaLabel: "Retour",
      interactionTexts: {
        title: "Soumettez le contenu ci-dessous pour continuer.",
        confirmButtonText: "Soumettre",
        copyButtonText: "Copier",
        copiedButtonText: "Copié",
      },
      playerTexts: {
        closeSettingsLabel: "Fermer les paramètres",
        enterFullscreenLabel: "Passer en plein écran",
        exitFullscreenLabel: "Quitter le plein écran",
        moreOptionsAriaLabel: "Plus d'options",
        nextLabel: "Page suivante",
        nextSubtitleLabel: "Phrase suivante",
        notesLabel: "Notes",
        pauseAutoplayLabel: "Suspendre la lecture automatique",
        pauseLabel: "Pause",
        playAutoplayLabel: "Lancer la lecture automatique",
        playLabel: "Lecture",
        previousLabel: "Page précédente",
        previousSubtitleLabel: "Phrase précédente",
        screenModeLabel: "Mode d'affichage",
        settingsTitle: "Paramètres",
        subtitleLabel: "Sous-titres",
        subtitleToggleAriaLabel: "Afficher ou masquer les sous-titres",
        volumeAriaLabel: "Volume",
        screenLabel: "Écran",
        nonFullscreenLabel: "Hors plein écran",
        fullscreenLabel: "Plein écran",
        fullscreenHintText:
          "Faites pivoter votre écran pour une meilleure expérience.",
      },
    },
    "zh-CN": {
      bufferingText: {
        waitingForAudio: "正在等待当前页音频...",
        loadingAudio: "正在加载当前页音频...",
        waitingForMoreAudio: "正在等待更多当前页音频...",
      },
      fullscreenBackAriaLabel: "返回",
      interactionTexts: {
        title: "提交下面的内容以继续",
        confirmButtonText: "提交",
        copyButtonText: "复制",
        copiedButtonText: "已复制",
      },
      playerTexts: {
        closeSettingsLabel: "关闭设置",
        enterFullscreenLabel: "进入全屏",
        exitFullscreenLabel: "退出全屏",
        moreOptionsAriaLabel: "更多选项",
        nextLabel: "下一页",
        nextSubtitleLabel: "下一句",
        notesLabel: "笔记",
        pauseAutoplayLabel: "暂停自动播放",
        pauseLabel: "暂停",
        playAutoplayLabel: "开始自动播放",
        playLabel: "播放",
        previousLabel: "上一页",
        previousSubtitleLabel: "上一句",
        screenModeLabel: "屏幕模式",
        settingsTitle: "设置",
        subtitleLabel: "字幕",
        subtitleToggleAriaLabel: "切换字幕",
        volumeAriaLabel: "音量",
        screenLabel: "屏幕",
        nonFullscreenLabel: "非全屏",
        fullscreenLabel: "全屏",
        fullscreenHintText: "旋转屏幕以获得更好的体验。",
      },
    },
  };

export const getSlideLocaleTexts = (locale?: string | null): SlideLocaleTexts =>
  SLIDE_LOCALE_TEXTS[normalizeMarkdownFlowLocale(locale)];

export const getSlidePlayerTexts = (
  locale?: string | null
): SlidePlayerLocaleTexts => getSlideLocaleTexts(locale).playerTexts;
