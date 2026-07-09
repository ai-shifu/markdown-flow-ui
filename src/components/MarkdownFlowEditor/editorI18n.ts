import enUS from "./locales/en-US.json";
import frFR from "./locales/fr-FR.json";
import zhCN from "./locales/zh-CN.json";
import {
  DEFAULT_MARKDOWN_FLOW_LOCALE,
  normalizeMarkdownFlowLocale,
  type MarkdownFlowLocale,
} from "../../lib/locale";

export const DEFAULT_EDITOR_LOCALE = DEFAULT_MARKDOWN_FLOW_LOCALE;

export const editorLocaleResources = {
  "en-US": { translation: enUS },
  "fr-FR": { translation: frFR },
  "zh-CN": { translation: zhCN },
} as const;

export type EditorLocale = MarkdownFlowLocale;

export const normalizeEditorLocale = (locale?: string | null): EditorLocale => {
  const normalizedLocale = normalizeMarkdownFlowLocale(locale);
  return normalizedLocale in editorLocaleResources
    ? (normalizedLocale as EditorLocale)
    : DEFAULT_EDITOR_LOCALE;
};

export const getEditorLocaleMessages = (locale?: string | null) =>
  editorLocaleResources[normalizeEditorLocale(locale)].translation;
