import { describe, expect, it } from "vitest";

import { editorLocaleResources, getEditorLocaleMessages } from "./editorI18n";
import { MARKDOWN_FLOW_LOCALES } from "../../lib/locale";

describe("getEditorLocaleMessages", () => {
  it("provides the same editor keys for every supported locale", () => {
    const englishKeys = Object.keys(editorLocaleResources["en-US"].translation);

    for (const locale of MARKDOWN_FLOW_LOCALES) {
      const messages = getEditorLocaleMessages(locale);

      expect(Object.keys(messages)).toEqual(englishKeys);
      expect(
        Object.values(messages).every((message) => message.length > 0)
      ).toBe(true);
      if (locale !== "en-US") {
        expect(messages).not.toEqual(getEditorLocaleMessages("en-US"));
      }
    }
  });

  it.each([
    ["es_ES", "es-ES"],
    ["ar", "ar-SA"],
    ["th_TH", "th-TH"],
    ["de", "de-DE"],
    ["ja_JP", "ja-JP"],
    ["ur", "ur-PK"],
    ["fil_PH", "fil-PH"],
    ["tl", "fil-PH"],
    ["vi", "vi-VN"],
  ])("normalizes editor locale alias %s", (alias, expected) => {
    expect(getEditorLocaleMessages(alias)).toEqual(
      getEditorLocaleMessages(expected)
    );
  });

  it.each([
    ["de-DE", "Gib '/' ein, um Inhalte einzufügen", "Bild einfügen"],
    ["ja-JP", "「/」を入力してコンテンツを挿入", "画像を挿入"],
    ["ur-PK", "مواد شامل کرنے کے لیے '/' ٹائپ کریں", "تصویر شامل کریں"],
    [
      "fil-PH",
      "I-type ang '/' para maglagay ng nilalaman",
      "Maglagay ng larawan",
    ],
    ["vi-VN", "Nhập '/' để chèn nội dung", "Chèn hình ảnh"],
  ])(
    "uses translated prompts and slash actions for %s",
    (locale, placeholder, insertImage) => {
      const messages = getEditorLocaleMessages(locale);

      expect(messages.placeholder).toBe(placeholder);
      expect(messages.toolbarInsertImage).toBe(insertImage);
    }
  );
});
