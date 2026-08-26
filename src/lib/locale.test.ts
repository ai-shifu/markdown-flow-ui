import { describe, expect, it } from "vitest";

import {
  DEFAULT_MARKDOWN_FLOW_LOCALE,
  getMarkdownFlowDirection,
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

describe("getMarkdownFlowDirection", () => {
  it.each([undefined, null, ""])(
    "preserves inherited direction when locale is %s",
    (locale) => {
      expect(getMarkdownFlowDirection(locale)).toBeUndefined();
    }
  );

  it("uses RTL for Arabic and LTR for all other supported locales", () => {
    expect(getMarkdownFlowDirection("ar-SA")).toBe("rtl");
    expect(getMarkdownFlowDirection("ar_SA")).toBe("rtl");
    expect(getMarkdownFlowDirection("en-US")).toBe("ltr");
    expect(getMarkdownFlowDirection("th-TH")).toBe("ltr");
  });
});
