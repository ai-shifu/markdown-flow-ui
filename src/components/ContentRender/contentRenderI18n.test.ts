import { describe, expect, it } from "vitest";

import {
  CONTENT_RENDER_LOCALE_TEXTS,
  getContentRenderLocaleTexts,
} from "./contentRenderI18n";

describe("getContentRenderLocaleTexts", () => {
  it("provides complete Arabic and Thai content-renderer text bundles", () => {
    const englishKeys = Object.keys(CONTENT_RENDER_LOCALE_TEXTS["en-US"]);

    for (const locale of ["ar-SA", "th-TH"] as const) {
      const texts = getContentRenderLocaleTexts(locale);

      expect(Object.keys(texts)).toEqual(englishKeys);
      expect(Object.values(texts).every((text) => text.length > 0)).toBe(true);
      expect(texts).not.toEqual(getContentRenderLocaleTexts("en-US"));
    }
  });

  it("normalizes short Arabic and Thai locale aliases", () => {
    expect(getContentRenderLocaleTexts("ar")).toEqual(
      getContentRenderLocaleTexts("ar-SA")
    );
    expect(getContentRenderLocaleTexts("th_TH")).toEqual(
      getContentRenderLocaleTexts("th-TH")
    );
  });
});
