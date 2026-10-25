export const DEFAULT_MARKDOWN_FLOW_LOCALE = "en-US";

export const MARKDOWN_FLOW_LOCALES = [
  "en-US",
  "es-ES",
  "fr-FR",
  "zh-CN",
  "ar-SA",
  "th-TH",
  "de-DE",
  "ja-JP",
  "ur-PK",
  "fil-PH",
  "vi-VN",
] as const;

export type MarkdownFlowLocale = (typeof MARKDOWN_FLOW_LOCALES)[number];

export type MarkdownFlowDirection = "ltr" | "rtl";

const localeAliasMap: Record<string, MarkdownFlowLocale> = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  zh: "zh-CN",
  ar: "ar-SA",
  th: "th-TH",
  de: "de-DE",
  ja: "ja-JP",
  ur: "ur-PK",
  fil: "fil-PH",
  tl: "fil-PH",
  vi: "vi-VN",
};

export const normalizeMarkdownFlowLocale = (
  locale?: string | null
): MarkdownFlowLocale => {
  if (!locale) {
    return DEFAULT_MARKDOWN_FLOW_LOCALE;
  }

  const normalizedLocale = locale.split("_").join("-");
  if (MARKDOWN_FLOW_LOCALES.includes(normalizedLocale as MarkdownFlowLocale)) {
    return normalizedLocale as MarkdownFlowLocale;
  }

  const baseLocale = normalizedLocale.split("-")[0]?.toLowerCase();
  return localeAliasMap[baseLocale] ?? DEFAULT_MARKDOWN_FLOW_LOCALE;
};

export const getMarkdownFlowDirection = (
  locale?: string | null
): MarkdownFlowDirection | undefined => {
  // An omitted locale must not override the embedding page's direction.
  if (!locale) return undefined;
  const resolvedLocale = normalizeMarkdownFlowLocale(locale);
  return resolvedLocale === "ar-SA" || resolvedLocale === "ur-PK"
    ? "rtl"
    : "ltr";
};

/** Omitted locales leave the host language in control. */
export const getMarkdownFlowLanguage = (
  locale?: string | null
): MarkdownFlowLocale | undefined =>
  locale ? normalizeMarkdownFlowLocale(locale) : undefined;
