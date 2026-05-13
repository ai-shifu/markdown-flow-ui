import enUS from "./locales/en-US.json";
import frFR from "./locales/fr-FR.json";
import zhCN from "./locales/zh-CN.json";

export const DEFAULT_EDITOR_LOCALE = "en-US";

export const editorLocaleResources = {
  "en-US": { translation: enUS },
  "fr-FR": { translation: frFR },
  "zh-CN": { translation: zhCN },
} as const;

export type EditorLocale = keyof typeof editorLocaleResources;

const localeAliasMap: Record<string, EditorLocale> = {
  en: "en-US",
  fr: "fr-FR",
  zh: "zh-CN",
};

export const normalizeEditorLocale = (locale?: string | null): EditorLocale => {
  if (!locale) {
    return DEFAULT_EDITOR_LOCALE;
  }

  const normalizedLocale = locale.replace("_", "-");
  if (normalizedLocale in editorLocaleResources) {
    return normalizedLocale as EditorLocale;
  }

  const baseLocale = normalizedLocale.split("-")[0]?.toLowerCase();
  return localeAliasMap[baseLocale] ?? DEFAULT_EDITOR_LOCALE;
};

export const getEditorLocaleMessages = (locale?: string | null) =>
  editorLocaleResources[normalizeEditorLocale(locale)].translation;
