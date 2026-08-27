import { describe, expect, it } from "vitest";

import { editorLocaleResources, getEditorLocaleMessages } from "./editorI18n";

describe("getEditorLocaleMessages", () => {
  it("provides the same editor keys for every supported locale", () => {
    const englishKeys = Object.keys(editorLocaleResources["en-US"].translation);

    for (const locale of ["ar-SA", "th-TH"] as const) {
      const messages = getEditorLocaleMessages(locale);

      expect(Object.keys(messages)).toEqual(englishKeys);
      expect(
        Object.values(messages).every((message) => message.length > 0)
      ).toBe(true);
      expect(messages).not.toEqual(getEditorLocaleMessages("en-US"));
    }
  });

  it("normalizes short Arabic and Thai locale aliases", () => {
    expect(getEditorLocaleMessages("ar")).toEqual(
      getEditorLocaleMessages("ar-SA")
    );
    expect(getEditorLocaleMessages("th_TH")).toEqual(
      getEditorLocaleMessages("th-TH")
    );
  });
});
