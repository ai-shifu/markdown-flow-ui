// @vitest-environment jsdom
import React from "react";
import {
  cleanup,
  createEvent,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import MarkdownFlowInput from "./MarkdownFlowInput";

afterEach(cleanup);

const renderInput = (sendShortcut?: "enter" | "none") => {
  const onSend = vi.fn();
  render(
    <MarkdownFlowInput
      value="Follow-up question"
      onSend={onSend}
      sendShortcut={sendShortcut}
    />
  );
  return { onSend, textarea: screen.getByRole("textbox") };
};

it("sends with Enter by default", () => {
  const { onSend, textarea } = renderInput();
  const event = createEvent.keyDown(textarea, { key: "Enter" });

  fireEvent(textarea, event);

  expect(event.defaultPrevented).toBe(true);
  expect(onSend).toHaveBeenCalledOnce();
});

it("hides image selection by default and puts an enabled picker inside the input group", () => {
  const onSelect = vi.fn();
  const props = { value: "Question", imageInput: { images: [], onSelect } };
  const { container, rerender } = render(<MarkdownFlowInput {...props} />);
  expect(container.querySelector('input[type="file"]')).toBeNull();
  rerender(<MarkdownFlowInput {...props} showImageInput />);
  const input =
    container.querySelector<HTMLInputElement>('input[type="file"]')!;
  const picker = screen.getByRole("button", { name: "Add image" });
  expect(picker.closest('[data-slot="input-group"]')).toBe(
    screen.getByRole("textbox").closest('[data-slot="input-group"]')
  );
  const click = vi.spyOn(input, "click");
  fireEvent.click(picker);
  expect(click).toHaveBeenCalledOnce();
  const file = new File(["image"], "photo.png", { type: "image/png" });
  fireEvent.change(input, { target: { files: [file] } });
  expect(onSelect).toHaveBeenCalledExactlyOnceWith([file]);
  expect(input.value).toBe("");
});

it("uses the existing send button and shortcut for image-only input", () => {
  const onSend = vi.fn();
  render(
    <MarkdownFlowInput
      showImageInput
      value=""
      imageInput={{ images: ["/photo.png"] }}
      onSend={onSend}
    />
  );
  const send = screen.getByRole<HTMLButtonElement>("button", { name: "Send" });
  expect(send.disabled).toBe(false);
  fireEvent.click(send);
  fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
  expect(onSend).toHaveBeenCalledTimes(2);
  expect(
    screen
      .getByRole("img", { name: "Attached image 1" })
      .closest('[data-slot="input-group"]')
  ).toBe(send.closest('[data-slot="input-group"]'));
});

it("keeps text intact and prevents sending or changing attachments during upload", () => {
  const onSend = vi.fn();
  const onRemove = vi.fn();
  render(
    <MarkdownFlowInput
      showImageInput
      value="Keep my text"
      imageInput={{
        images: ["/photo.png"],
        uploading: true,
        onSelect: vi.fn(),
        onRemove,
      }}
      onSend={onSend}
    />
  );
  expect(
    screen.getByRole<HTMLButtonElement>("button", { name: "Send" }).disabled
  ).toBe(true);
  expect(
    screen.getByRole<HTMLButtonElement>("button", { name: "Uploading image" })
      .disabled
  ).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Remove image 1" }));
  fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
  expect(onRemove).not.toHaveBeenCalled();
  expect(onSend).not.toHaveBeenCalled();
  expect(screen.getByRole<HTMLTextAreaElement>("textbox").value).toBe(
    "Keep my text"
  );
});

it("supports controlled removal, count limits and host-resolved display URLs", () => {
  const onRemove = vi.fn();
  render(
    <MarkdownFlowInput
      showImageInput
      imageInput={{
        images: ["/photo.png"],
        maxImages: 1,
        onSelect: vi.fn(),
        onRemove,
        resolvePreviewUrl: (url) => `https://example.com${url}`,
      }}
    />
  );
  expect(
    screen.getByRole<HTMLButtonElement>("button", { name: "Add image" })
      .disabled
  ).toBe(true);
  expect(
    screen.getByRole("img", { name: "Attached image 1" }).getAttribute("src")
  ).toBe("https://example.com/photo.png");
  fireEvent.click(screen.getByRole("button", { name: "Remove image 1" }));
  expect(onRemove).toHaveBeenCalledExactlyOnceWith(0);
});

it("retains readonly image previews without upload or remove controls", () => {
  render(
    <MarkdownFlowInput
      disabled
      showImageInput
      locale="zh-CN"
      imageInput={{
        images: ["/photo.png"],
        onSelect: vi.fn(),
        onRemove: vi.fn(),
      }}
    />
  );
  expect(screen.getByRole("img", { name: "已添加的图片 1" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "添加图片" })).toBeNull();
  expect(screen.queryByRole("button", { name: "移除图片 1" })).toBeNull();
  expect(
    screen.getByRole<HTMLButtonElement>("button", { name: "发送" }).disabled
  ).toBe(true);
});

it("can lock attachment changes while keeping text submission available", () => {
  render(
    <MarkdownFlowInput
      showImageInput
      value="Another question"
      imageInput={{
        images: ["/photo.png"],
        disabled: true,
        onSelect: vi.fn(),
        onRemove: vi.fn(),
      }}
    />
  );
  expect(
    screen.getByRole<HTMLButtonElement>("button", { name: "Add image" })
      .disabled
  ).toBe(true);
  expect(
    screen.getByRole<HTMLButtonElement>("button", { name: "Remove image 1" })
      .disabled
  ).toBe(true);
  expect(
    screen.getByRole<HTMLButtonElement>("button", { name: "Send" }).disabled
  ).toBe(false);
});

it("does not turn non-web preview URLs into executable links", () => {
  render(
    <MarkdownFlowInput
      showImageInput
      imageInput={{
        images: ["javascript:alert(1)", "data:image/png;base64,aGVsbG8="],
      }}
    />
  );
  expect(screen.queryAllByRole("link")).toHaveLength(0);
});

it("keeps Shift+Enter available for a newline", () => {
  const { onSend, textarea } = renderInput();
  const event = createEvent.keyDown(textarea, {
    key: "Enter",
    shiftKey: true,
  });

  fireEvent(textarea, event);

  expect(event.defaultPrevented).toBe(false);
  expect(onSend).not.toHaveBeenCalled();
});

it("does not send while an IME composition is active", () => {
  const { onSend, textarea } = renderInput();

  fireEvent.keyDown(textarea, { key: "Enter", keyCode: 229 });

  expect(onSend).not.toHaveBeenCalled();
});

it("leaves Enter untouched when the shortcut is disabled", () => {
  const { onSend, textarea } = renderInput("none");
  const event = createEvent.keyDown(textarea, { key: "Enter" });

  fireEvent(textarea, event);

  expect(event.defaultPrevented).toBe(false);
  expect(onSend).not.toHaveBeenCalled();
});

it("keeps the send button available when the shortcut is disabled", () => {
  const { onSend } = renderInput("none");

  fireEvent.click(screen.getByRole("button"));

  expect(onSend).toHaveBeenCalledOnce();
});
