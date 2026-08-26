import {
  normalizeMarkdownFlowLocale,
  type MarkdownFlowLocale,
} from "../../lib/locale";
import localeTexts from "./locales/contentRender.json";

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
  mermaidLoadingText: string;
  mermaidEmptyChartText: string;
}

export const CONTENT_RENDER_LOCALE_TEXTS: Record<
  MarkdownFlowLocale,
  ContentRenderLocaleTexts
> = localeTexts;

export const getContentRenderLocaleTexts = (
  locale?: string | null
): ContentRenderLocaleTexts =>
  CONTENT_RENDER_LOCALE_TEXTS[normalizeMarkdownFlowLocale(locale)];
