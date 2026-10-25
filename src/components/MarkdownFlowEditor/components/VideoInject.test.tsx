// @vitest-environment jsdom
import React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { afterEach, expect, it, vi } from "vitest";
import { editorLocaleResources, getEditorLocaleMessages } from "../editorI18n";
import VideoInject from "./VideoInject";

afterEach(cleanup);

it("localizes a loaded preview without changing the authored video", async () => {
  const i18n = createInstance();
  await i18n.use(initReactI18next).init({
    resources: editorLocaleResources,
    lng: "zh-CN",
    fallbackLng: "en-US",
    interpolation: { escapeValue: false },
  });
  const onSelect = vi.fn();
  const resourceUrl = "https://www.youtube.com/watch?v=abcdefghijk";
  const resourceTitle = "My authored video title";
  const view = render(
    <I18nextProvider i18n={i18n}>
      <VideoInject value={{ resourceUrl, resourceTitle }} onSelect={onSelect} />
    </I18nextProvider>
  );
  fireEvent.click(
    view.getByRole("button", {
      name: getEditorLocaleMessages("zh-CN").videoRunButton,
    })
  );
  const iframe = view.container.querySelector("iframe")!;
  expect(iframe).not.toBeNull();
  for (const [locale, title] of [
    ["zh-CN", "视频预览"],
    ["ar-SA", "معاينة الفيديو"],
    ["th-TH", "ตัวอย่างวิดีโอ"],
    ["fr-FR", "Aperçu de la vidéo"],
    ["en-US", "Video preview"],
  ]) {
    await act(() => i18n.changeLanguage(locale));
    expect(view.getByTitle(title)).toBe(iframe);
    expect(iframe.getAttribute("src")).toBe(
      "https://www.youtube.com/embed/abcdefghijk"
    );
    expect(view.getByDisplayValue(resourceTitle)).toBeTruthy();
    expect(view.getByDisplayValue(resourceUrl)).toBeTruthy();
  }
  fireEvent.click(
    view.getByRole("button", {
      name: getEditorLocaleMessages("en-US").videoUseVideoButton,
    })
  );
  expect(onSelect).toHaveBeenCalledExactlyOnceWith({
    resourceUrl,
    resourceTitle,
  });
});
