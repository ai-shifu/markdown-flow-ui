// @vitest-environment jsdom
import React from "react";
import {
  cleanup,
  createEvent,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ContentRender from "./ContentRender";
import MarkdownFlow from "../MarkdownFlow/MarkdownFlow";
import MarkdownFlowInput from "./MarkdownFlowInput";

vi.mock("mermaid", () => ({ default: {} }));
vi.mock("./IframeSandbox", () => ({ default: () => null }));
afterEach(cleanup);

it.each([
  ["text", "?[{{answer}}...Describe your work]"],
  ["single", "?[{{answer}}First|Second|...Describe your work]"],
  ["multi", "?[{{answer}}First||Second||...Describe your work]"],
])(
  "accepts, edits and submits a %s hint without losing focus or selections",
  async (mode, content) => {
    const onSend = vi.fn();
    const onPlaceholderAccepted = vi.fn();
    const view = render(
      <ContentRender
        content={content}
        onSend={onSend}
        onPlaceholderAccepted={onPlaceholderAccepted}
      />
    );
    if (mode === "multi") fireEvent.click(screen.getByLabelText("First"));
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    textarea.focus();
    const tab = createEvent.keyDown(textarea, { key: "Tab" });
    fireEvent(textarea, tab);
    expect(tab.defaultPrevented).toBe(true);
    expect(textarea.value).toBe("Describe your work");
    expect(document.activeElement).toBe(textarea);
    await waitFor(() =>
      expect(textarea.selectionStart).toBe(textarea.value.length)
    );
    expect(textarea.selectionEnd).toBe(textarea.value.length);
    expect(onSend).not.toHaveBeenCalled();
    expect(onPlaceholderAccepted.mock.calls).toEqual([[]]);
    view.rerender(
      <ContentRender
        content={content}
        onSend={onSend}
        onPlaceholderAccepted={onPlaceholderAccepted}
      />
    );
    expect(screen.getByRole("textbox")).toBe(textarea);
    expect(textarea.value).toBe("Describe your work");
    const nextTab = createEvent.keyDown(textarea, { key: "Tab" });
    fireEvent(textarea, nextTab);
    expect(nextTab.defaultPrevented).toBe(false);
    expect(onPlaceholderAccepted).toHaveBeenCalledOnce();
    fireEvent.change(textarea, { target: { value: "My edited answer" } });
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(onSend).toHaveBeenCalledWith(
      expect.objectContaining({
        variableName: "answer",
        inputText: "My edited answer",
        ...(mode === "multi" ? { selectedValues: ["First"] } : {}),
      })
    );
  }
);

it.each([
  { shiftKey: true },
  { ctrlKey: true },
  { altKey: true },
  { metaKey: true },
  { repeat: true },
  { isComposing: true },
  { keyCode: 229 },
])("preserves native Tab for guarded keyboard input %j", (options) => {
  const observer = vi.fn();
  render(
    <ContentRender content="?[...Hint]" onPlaceholderAccepted={observer} />
  );
  const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
  textarea.focus();
  const tab = createEvent.keyDown(textarea, { key: "Tab", ...options });
  fireEvent(textarea, tab);
  expect(tab.defaultPrevented).toBe(false);
  expect(textarea.value).toBe("");
  expect(observer).not.toHaveBeenCalled();
});

it.each([" ", "Existing answer"])(
  "does not overwrite existing input %j",
  (value) => {
    const observer = vi.fn();
    render(
      <ContentRender
        content="?[...Hint]"
        defaultInputText={value}
        onPlaceholderAccepted={observer}
      />
    );
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value } });
    textarea.focus();
    const tab = createEvent.keyDown(textarea, { key: "Tab" });
    fireEvent(textarea, tab);
    expect(tab.defaultPrevented).toBe(false);
    expect(textarea.value).toBe(value);
    expect(observer).not.toHaveBeenCalled();
  }
);

it("resets on a different question, accepts a new hint and restores saved answers", () => {
  const observer = vi.fn();
  const view = render(
    <ContentRender
      content="?[{{one}}...First hint]"
      onPlaceholderAccepted={observer}
    />
  );
  let textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
  textarea.focus();
  fireEvent.keyDown(textarea, { key: "Tab" });
  view.rerender(
    <ContentRender
      content="?[{{two}}...Second hint]"
      onPlaceholderAccepted={observer}
    />
  );
  textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
  expect(textarea.value).toBe("");
  textarea.focus();
  fireEvent.keyDown(textarea, { key: "Tab" });
  expect(textarea.value).toBe("Second hint");
  view.rerender(
    <ContentRender
      content="?[{{two}}...Second hint]"
      userInput="Saved answer"
      readonly
      onPlaceholderAccepted={observer}
    />
  );
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe(
    "Saved answer"
  );
  expect(observer).toHaveBeenCalledTimes(2);
});

it.each(["throw", "reject"])(
  "keeps accepted state and submission when an observer fails: %s",
  async (failure) => {
    const onSend = vi.fn();
    const observer = vi.fn(() => {
      if (failure === "throw") throw new Error("observer unavailable");
      return Promise.reject(new Error("observer unavailable"));
    });
    render(
      <ContentRender
        content="?[...Hint]"
        onSend={onSend}
        onPlaceholderAccepted={observer}
      />
    );
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    textarea.focus();
    fireEvent.keyDown(textarea, { key: "Tab" });
    await Promise.resolve();
    expect(textarea.value).toBe("Hint");
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(onSend).toHaveBeenCalledWith({
      variableName: "",
      inputText: "Hint",
    });
  }
);

it("forwards the observer through MarkdownFlow and counts deliberate refill separately", () => {
  const observer = vi.fn();
  render(
    <MarkdownFlow
      initialContentList={[{ content: "?[...Hint]" }]}
      onPlaceholderAccepted={observer}
    />
  );
  const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
  textarea.focus();
  fireEvent.keyDown(textarea, { key: "Tab" });
  fireEvent.change(textarea, { target: { value: "" } });
  fireEvent.keyDown(textarea, { key: "Tab" });
  expect(textarea.value).toBe("Hint");
  expect(observer.mock.calls).toEqual([[], []]);
});

it.each([
  { disabled: true },
  { placeholder: "   " },
  { placeholder: "" },
  { onAcceptPlaceholder: undefined },
  { value: " " },
])("leaves standalone inputs unchanged for %j", (overrides) => {
  const onAcceptPlaceholder = vi.fn();
  render(
    <MarkdownFlowInput
      value=""
      placeholder="Hint"
      onAcceptPlaceholder={onAcceptPlaceholder}
      {...overrides}
    />
  );
  const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
  textarea.focus();
  const tab = createEvent.keyDown(textarea, { key: "Tab" });
  fireEvent(textarea, tab);
  expect(tab.defaultPrevented).toBe(false);
  expect(onAcceptPlaceholder).not.toHaveBeenCalled();
});

it("accepts standalone hints without requiring Enter submission or an onSend callback", () => {
  const onAcceptPlaceholder = vi.fn();
  render(
    <MarkdownFlowInput
      value=""
      placeholder="  Hint  "
      sendShortcut="none"
      onAcceptPlaceholder={onAcceptPlaceholder}
    />
  );
  const textarea = screen.getByRole("textbox");
  textarea.focus();
  fireEvent.keyDown(textarea, { key: "Tab" });
  expect(onAcceptPlaceholder).toHaveBeenCalledWith("  Hint  ");
});

it("ignores unfocused and readonly inputs", () => {
  const observer = vi.fn();
  const view = render(
    <ContentRender content="?[...Hint]" onPlaceholderAccepted={observer} />
  );
  fireEvent.keyDown(screen.getByRole("textbox"), { key: "Tab" });
  expect(observer).not.toHaveBeenCalled();
  view.rerender(
    <ContentRender
      content="?[...Hint]"
      readonly
      onPlaceholderAccepted={observer}
    />
  );
  fireEvent.keyDown(screen.getByRole("textbox"), { key: "Tab" });
  expect(observer).not.toHaveBeenCalled();
});
