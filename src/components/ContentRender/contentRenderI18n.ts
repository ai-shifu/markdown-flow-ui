import {
  normalizeMarkdownFlowLocale,
  type MarkdownFlowLocale,
} from "../../lib/locale";

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

export const CONTENT_RENDER_LOCALE_TEXTS: Record<
  MarkdownFlowLocale,
  ContentRenderLocaleTexts
> = {
  "en-US": {
    confirmButtonText: "Submit",
    copyButtonText: "Copy",
    copiedButtonText: "Copied",
    sandboxLoadingText: "Loading content...",
    sandboxStyleLoadingText: "Building styles...",
    sandboxScriptLoadingText: "Building scripts cache...",
    sandboxFullscreenButtonText: "Fullscreen",
    sandboxExitFullscreenButtonText: "Exit fullscreen",
    sendButtonLabel: "Send",
    scrollToBottomLabel: "Scroll to bottom",
  },
  "fr-FR": {
    confirmButtonText: "Soumettre",
    copyButtonText: "Copier",
    copiedButtonText: "Copié",
    sandboxLoadingText: "Chargement du contenu...",
    sandboxStyleLoadingText: "Génération des styles...",
    sandboxScriptLoadingText: "Génération du cache des scripts...",
    sandboxFullscreenButtonText: "Plein écran",
    sandboxExitFullscreenButtonText: "Quitter le plein écran",
    sendButtonLabel: "Envoyer",
    scrollToBottomLabel: "Faire défiler jusqu'en bas",
  },
  "zh-CN": {
    confirmButtonText: "提交",
    copyButtonText: "复制",
    copiedButtonText: "已复制",
    sandboxLoadingText: "正在加载内容...",
    sandboxStyleLoadingText: "正在生成样式...",
    sandboxScriptLoadingText: "正在生成脚本缓存...",
    sandboxFullscreenButtonText: "全屏浏览",
    sandboxExitFullscreenButtonText: "退出全屏",
    sendButtonLabel: "发送",
    scrollToBottomLabel: "滚动到底部",
  },
};

export const getContentRenderLocaleTexts = (
  locale?: string | null
): ContentRenderLocaleTexts =>
  CONTENT_RENDER_LOCALE_TEXTS[normalizeMarkdownFlowLocale(locale)];
