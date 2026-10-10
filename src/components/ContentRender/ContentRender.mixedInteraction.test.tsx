// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ContentRender from "./ContentRender";

vi.mock("mermaid", () => ({ default: {} }));
vi.mock("./IframeSandbox", () => ({ default: () => null }));

afterEach(cleanup);

it("keeps a button's stored value out of the mixed interaction input after replay", () => {
  const content =
    "?[Ready, I can paste an answer//ready|Not yet//later|...Explain]";
  const onSend = vi.fn();
  const { getByText, getByRole, rerender } = render(
    <ContentRender content={content} onSend={onSend} />
  );

  fireEvent.click(getByText("Ready, I can paste an answer"));
  expect(onSend).toHaveBeenCalledWith(
    expect.objectContaining({ buttonText: "ready" })
  );

  // Hosts store the submitted value and pass it back as userInput on rerender/history load.
  rerender(
    <ContentRender content={content} onSend={onSend} userInput="ready" />
  );
  expect((getByRole("textbox") as HTMLTextAreaElement).value).toBe("");
  expect(
    getByText("Ready, I can paste an answer").classList.contains("select")
  ).toBe(true);

  rerender(
    <ContentRender
      content={content}
      onSend={onSend}
      userInput="My own explanation"
    />
  );
  expect((getByRole("textbox") as HTMLTextAreaElement).value).toBe(
    "My own explanation"
  );
});
