export const DEFAULT_MARKDOWN_FLOW_LOCALE = "en-US";

export const MARKDOWN_FLOW_LOCALES = ["en-US", "fr-FR", "zh-CN"] as const;

export type MarkdownFlowLocale = (typeof MARKDOWN_FLOW_LOCALES)[number];

const localeAliasMap: Record<string, MarkdownFlowLocale> = {
  en: "en-US",
  fr: "fr-FR",
  zh: "zh-CN",
};

export const normalizeMarkdownFlowLocale = (
  locale?: string | null
): MarkdownFlowLocale => {
  if (!locale) {
    return DEFAULT_MARKDOWN_FLOW_LOCALE;
  }

  const normalizedLocale = locale.replace(/_/g, "-");
  if (MARKDOWN_FLOW_LOCALES.includes(normalizedLocale as MarkdownFlowLocale)) {
    return normalizedLocale as MarkdownFlowLocale;
  }

  const baseLocale = normalizedLocale.split("-")[0]?.toLowerCase();
  return localeAliasMap[baseLocale] ?? DEFAULT_MARKDOWN_FLOW_LOCALE;
};
