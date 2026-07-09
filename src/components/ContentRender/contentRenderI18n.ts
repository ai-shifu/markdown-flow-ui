import {
  normalizeMarkdownFlowLocale,
  type MarkdownFlowLocale,
} from "../../lib/locale";
import {
  buildLocaleTexts,
  type LocaleTextValues,
} from "../../lib/localeTextMap";

export interface ContentRenderLocaleTexts {
  confirmButtonText: string;
  copyButtonText: string;
  copiedButtonText: string;
  sandboxLoadingText: string;
  sandboxStyleLoadingText: string;
  sandboxScriptLoadingText: string;
  sandboxFullscreenButtonText: string;
  sandboxExitFullscreenButtonText: string;
  sendButtonLabel: string;
  scrollToBottomLabel: string;
}

const CONTENT_RENDER_TEXT_KEYS = [
  "confirmButtonText",
  "copyButtonText",
  "copiedButtonText",
  "sandboxLoadingText",
  "sandboxStyleLoadingText",
  "sandboxScriptLoadingText",
  "sandboxFullscreenButtonText",
  "sandboxExitFullscreenButtonText",
  "sendButtonLabel",
  "scrollToBottomLabel",
] as const satisfies readonly (keyof ContentRenderLocaleTexts)[];

const createContentRenderLocaleTexts = (
  values: LocaleTextValues<typeof CONTENT_RENDER_TEXT_KEYS>
): ContentRenderLocaleTexts =>
  buildLocaleTexts(
    CONTENT_RENDER_TEXT_KEYS,
    values
  ) as ContentRenderLocaleTexts;

export const CONTENT_RENDER_LOCALE_TEXTS: Record<
  MarkdownFlowLocale,
  ContentRenderLocaleTexts
> = {
  "en-US": createContentRenderLocaleTexts([
    "Submit",
    "Copy",
    "Copied",
    "Loading content...",
    "Building styles...",
    "Building scripts cache...",
    "Fullscreen",
    "Exit fullscreen",
    "Send",
    "Scroll to bottom",
  ]),
  "fr-FR": createContentRenderLocaleTexts([
    "Soumettre",
    "Copier",
    "Copié",
    "Chargement du contenu...",
    "Génération des styles...",
    "Génération du cache des scripts...",
    "Plein écran",
    "Quitter le plein écran",
    "Envoyer",
    "Faire défiler jusqu'en bas",
  ]),
  "zh-CN": createContentRenderLocaleTexts([
    "提交",
    "复制",
    "已复制",
    "正在加载内容...",
    "正在生成样式...",
    "正在生成脚本缓存...",
    "全屏浏览",
    "退出全屏",
    "发送",
    "滚动到底部",
  ]),
};

export const getContentRenderLocaleTexts = (
  locale?: string | null
): ContentRenderLocaleTexts =>
  CONTENT_RENDER_LOCALE_TEXTS[normalizeMarkdownFlowLocale(locale)];
