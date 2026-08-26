import { describe, expect, it } from "vitest";
import { MARKDOWN_FLOW_LOCALES } from "../../lib/locale";

import {
  CONTENT_RENDER_LOCALE_TEXTS,
  getContentRenderLocaleTexts,
} from "./contentRenderI18n";

describe("getContentRenderLocaleTexts", () => {
  it("provides complete content-renderer text bundles matching the Chinese source", () => {
    const chineseKeys = Object.keys(CONTENT_RENDER_LOCALE_TEXTS["zh-CN"]);

    for (const locale of MARKDOWN_FLOW_LOCALES) {
      const texts = getContentRenderLocaleTexts(locale);

      expect(Object.keys(texts)).toEqual(chineseKeys);
      expect(Object.values(texts).every((text) => text.length > 0)).toBe(true);
      if (locale !== "en-US") {
        expect(texts).not.toEqual(getContentRenderLocaleTexts("en-US"));
      }
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
