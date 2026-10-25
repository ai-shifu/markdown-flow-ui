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
