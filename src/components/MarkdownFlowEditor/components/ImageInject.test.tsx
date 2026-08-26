// @vitest-environment jsdom
import React from "react";
import { act, cleanup, render } from "@testing-library/react";
import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { afterEach, expect, it, vi } from "vitest";
import { editorLocaleResources, getEditorLocaleMessages } from "../editorI18n";
import ImageInject from "./ImageInject";

afterEach(cleanup);

it.each([undefined, "", "My authored image title"])(
  "localizes existing image preview alt text while preserving its title (%s)",
  async (resourceTitle) => {
    const i18n = createInstance();
    await i18n.use(initReactI18next).init({
      resources: editorLocaleResources,
      lng: "zh-CN",
      fallbackLng: "en-US",
      interpolation: { escapeValue: false },
    });
    const resourceUrl = "https://example.com/authored-image.png";
    const onSelect = vi.fn();
    const view = render(
      <I18nextProvider i18n={i18n}>
        <ImageInject
          value={{ resourceUrl, resourceTitle }}
          onSelect={onSelect}
        />
      </I18nextProvider>
    );
    const image = view.getByRole("img");
    for (const [locale, title] of [
      ["zh-CN", "图片名称"],
      ["ar-SA", "اسم الصورة"],
      ["th-TH", "ชื่อรูปภาพ"],
      ["fr-FR", "Nom de l'image"],
      ["en-US", "Image name"],
    ]) {
      await act(() => i18n.changeLanguage(locale));
      expect(view.getByRole("img", { name: resourceTitle || title })).toBe(
        image
      );
      expect(image.getAttribute("src")).toBe(resourceUrl);
      expect(view.getByDisplayValue(resourceUrl)).toBeTruthy();
      const titleInput = view.getByPlaceholderText(
        getEditorLocaleMessages(locale).imageTitlePlaceholder
      ) as HTMLInputElement;
      expect(titleInput.value).toBe(resourceTitle ?? "");
    }
    expect(onSelect).not.toHaveBeenCalled();
  }
);
