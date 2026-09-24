import { describe, expect, it } from "vitest";

import {
  DEFAULT_MARKDOWN_FLOW_LOCALE,
  getMarkdownFlowDirection,
  getMarkdownFlowLanguage,
  MARKDOWN_FLOW_LOCALES,
  normalizeMarkdownFlowLocale,
} from "./locale";

describe("normalizeMarkdownFlowLocale", () => {
  it("includes every supported language in the public locale list", () => {
    expect(MARKDOWN_FLOW_LOCALES).toEqual([
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
    ]);
  });

  it.each([
    ["es", "es-ES"],
    ["es-ES", "es-ES"],
    ["es_ES", "es-ES"],
    ["ES-es", "es-ES"],
    ["ar", "ar-SA"],
    ["ar-SA", "ar-SA"],
    ["ar_SA", "ar-SA"],
    ["AR-sa", "ar-SA"],
    ["th", "th-TH"],
    ["th-TH", "th-TH"],
    ["th_TH", "th-TH"],
    ["TH-th", "th-TH"],
    ["de", "de-DE"],
    ["de-DE", "de-DE"],
    ["de_CH", "de-DE"],
    ["ja", "ja-JP"],
    ["ja_JP", "ja-JP"],
    ["ur", "ur-PK"],
    ["ur_PK", "ur-PK"],
    ["fil", "fil-PH"],
    ["fil_PH", "fil-PH"],
    ["tl", "fil-PH"],
    ["vi", "vi-VN"],
    ["vi_VN", "vi-VN"],
  ])("normalizes %s to %s", (locale, expected) => {
    expect(normalizeMarkdownFlowLocale(locale)).toBe(expected);
  });

  it("falls back to the default locale for empty or unsupported input", () => {
    expect(normalizeMarkdownFlowLocale()).toBe(DEFAULT_MARKDOWN_FLOW_LOCALE);
    expect(normalizeMarkdownFlowLocale(null)).toBe(
      DEFAULT_MARKDOWN_FLOW_LOCALE
    );
    expect(normalizeMarkdownFlowLocale("unsupported")).toBe(
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

  it("uses RTL for Arabic and Urdu, and LTR for the other supported locales", () => {
    expect(getMarkdownFlowDirection("ar-SA")).toBe("rtl");
    expect(getMarkdownFlowDirection("ar_SA")).toBe("rtl");
    expect(getMarkdownFlowDirection("ur-PK")).toBe("rtl");
    expect(getMarkdownFlowDirection("ur_IN")).toBe("rtl");
    expect(getMarkdownFlowDirection("en-US")).toBe("ltr");
    expect(getMarkdownFlowDirection("es-ES")).toBe("ltr");
    expect(getMarkdownFlowDirection("th-TH")).toBe("ltr");
    expect(getMarkdownFlowDirection("de-DE")).toBe("ltr");
    expect(getMarkdownFlowDirection("ja-JP")).toBe("ltr");
    expect(getMarkdownFlowDirection("fil-PH")).toBe("ltr");
    expect(getMarkdownFlowDirection("vi-VN")).toBe("ltr");
  });
});

describe("getMarkdownFlowLanguage", () => {
  it.each([undefined, null, ""])("preserves inheritance for %s", (locale) => {
    expect(getMarkdownFlowLanguage(locale)).toBeUndefined();
  });
  it.each([
    ["es_ES", "es-ES"],
    ["ar_SA", "ar-SA"],
    ["TH-th", "th-TH"],
    ["fr", "fr-FR"],
    ["de", "de-DE"],
    ["ja_JP", "ja-JP"],
    ["ur", "ur-PK"],
    ["fil", "fil-PH"],
    ["vi", "vi-VN"],
    ["unknown", "en-US"],
  ])("normalizes %s to %s", (locale, expected) => {
    expect(getMarkdownFlowLanguage(locale)).toBe(expected);
  });
});
