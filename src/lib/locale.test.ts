import { describe, expect, it } from "vitest";

import {
  DEFAULT_MARKDOWN_FLOW_LOCALE,
  MARKDOWN_FLOW_LOCALES,
  normalizeMarkdownFlowLocale,
} from "./locale";

describe("normalizeMarkdownFlowLocale", () => {
  it("includes Arabic and Thai in the public locale list", () => {
    expect(MARKDOWN_FLOW_LOCALES).toEqual([
      "en-US",
      "fr-FR",
      "zh-CN",
      "ar-SA",
      "th-TH",
    ]);
  });

  it.each([
    ["ar", "ar-SA"],
    ["ar-SA", "ar-SA"],
    ["ar_SA", "ar-SA"],
    ["AR-sa", "ar-SA"],
    ["th", "th-TH"],
    ["th-TH", "th-TH"],
    ["th_TH", "th-TH"],
    ["TH-th", "th-TH"],
  ])("normalizes %s to %s", (locale, expected) => {
    expect(normalizeMarkdownFlowLocale(locale)).toBe(expected);
  });

  it("falls back to the default locale for empty or unsupported input", () => {
    expect(normalizeMarkdownFlowLocale()).toBe(DEFAULT_MARKDOWN_FLOW_LOCALE);
    expect(normalizeMarkdownFlowLocale(null)).toBe(
      DEFAULT_MARKDOWN_FLOW_LOCALE
    );
    expect(normalizeMarkdownFlowLocale("es-ES")).toBe(
      DEFAULT_MARKDOWN_FLOW_LOCALE
    );
  });
});
