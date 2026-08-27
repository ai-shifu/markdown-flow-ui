import enUS from "./locales/en-US.json";
import frFR from "./locales/fr-FR.json";
import zhCN from "./locales/zh-CN.json";
import arSA from "./locales/ar-SA.json";
import thTH from "./locales/th-TH.json";
import {
  DEFAULT_MARKDOWN_FLOW_LOCALE,
  normalizeMarkdownFlowLocale,
} from "../../lib/locale";

export const DEFAULT_EDITOR_LOCALE = DEFAULT_MARKDOWN_FLOW_LOCALE;

export const editorLocaleResources = {
  "en-US": { translation: enUS },
  "fr-FR": { translation: frFR },
  "zh-CN": { translation: zhCN },
  "ar-SA": { translation: arSA },
  "th-TH": { translation: thTH },
} as const;

export const getEditorLocaleMessages = (locale?: string | null) =>
  editorLocaleResources[normalizeMarkdownFlowLocale(locale)].translation;
