import enUS from "./locales/en-US.json";
import esES from "./locales/es-ES.json";
import frFR from "./locales/fr-FR.json";
import zhCN from "./locales/zh-CN.json";
import arSA from "./locales/ar-SA.json";
import thTH from "./locales/th-TH.json";
import deDE from "./locales/de-DE.json";
import jaJP from "./locales/ja-JP.json";
import urPK from "./locales/ur-PK.json";
import filPH from "./locales/fil-PH.json";
import viVN from "./locales/vi-VN.json";
import {
  DEFAULT_MARKDOWN_FLOW_LOCALE,
  normalizeMarkdownFlowLocale,
} from "../../lib/locale";
import type { MarkdownFlowLocale } from "../../lib/locale";

export const DEFAULT_EDITOR_LOCALE = DEFAULT_MARKDOWN_FLOW_LOCALE;

export const editorLocaleResources = {
  "en-US": { translation: enUS },
  "es-ES": { translation: esES },
  "fr-FR": { translation: frFR },
  "zh-CN": { translation: zhCN },
  "ar-SA": { translation: arSA },
  "th-TH": { translation: thTH },
  "de-DE": { translation: deDE },
  "ja-JP": { translation: jaJP },
  "ur-PK": { translation: urPK },
  "fil-PH": { translation: filPH },
  "vi-VN": { translation: viVN },
} as const satisfies Record<MarkdownFlowLocale, { translation: typeof enUS }>;

export const getEditorLocaleMessages = (locale?: string | null) =>
  editorLocaleResources[normalizeMarkdownFlowLocale(locale)].translation;
