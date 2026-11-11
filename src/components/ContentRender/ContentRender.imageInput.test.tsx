// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ContentRender from "./ContentRender";
import MarkdownFlow from "../MarkdownFlow";

vi.mock("mermaid", () => ({ default: {} }));
vi.mock("./IframeSandbox", () => ({ default: () => null }));
afterEach(cleanup);

it("forwards an image-only submission without encoding URLs into text", () => {
  const onSend = vi.fn();
  render(
    <ContentRender
      content="?[...Explain]"
      showImageInput
      imageInput={{ images: ["/image.png"] }}
      onSend={onSend}
    />
  );
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  expect(onSend).toHaveBeenCalledExactlyOnceWith({
    variableName: "",
    inputText: "",
    images: ["/image.png"],
  });
});

it("preserves typed text when controlled upload state changes and exposes images to beforeSend", () => {
  const onSend = vi.fn();
  const beforeSend = vi.fn(() => true);
  const content = "?[...Explain]";
  const { rerender } = render(
    <ContentRender
      content={content}
      showImageInput
      imageInput={{ images: [] }}
      onSend={onSend}
      beforeSend={beforeSend}
    />
  );
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "My draft" },
  });
  rerender(
    <ContentRender
      content={content}
      showImageInput
      imageInput={{ images: ["/image.png"], uploading: true }}
      onSend={onSend}
      beforeSend={beforeSend}
    />
  );
  fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
  expect(onSend).not.toHaveBeenCalled();
  rerender(
    <ContentRender
      content={content}
      showImageInput
      imageInput={{ images: ["/image.png"] }}
      onSend={onSend}
      beforeSend={beforeSend}
    />
  );
  expect(screen.getByRole<HTMLTextAreaElement>("textbox").value).toBe(
    "My draft"
  );
  fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
  expect(beforeSend).toHaveBeenLastCalledWith({
    variableName: "",
    inputText: "My draft",
    images: ["/image.png"],
  });
  expect(onSend).toHaveBeenCalledWith(beforeSend.mock.calls.at(-1)?.[0]);
});

it("includes typed text and images when a mixed single-choice option is submitted", () => {
  const onSend = vi.fn();
  render(
    <ContentRender
      content="?[A//a | ...Other]"
      showImageInput
      imageInput={{ images: ["/image.png"] }}
      onSend={onSend}
    />
  );
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "My note" },
  });
  fireEvent.click(screen.getByRole("button", { name: "A" }));
  expect(onSend).toHaveBeenCalledExactlyOnceWith({
    variableName: "",
    buttonText: "a",
    inputText: "My note",
    images: ["/image.png"],
  });
});

it("allows image-only multi-select confirmation and retains choices beside images", () => {
  const onSend = vi.fn();
  render(
    <ContentRender
      content="?[A//a || B//b || ...Other]"
      showImageInput
      imageInput={{ images: ["/image.png"] }}
      onSend={onSend}
    />
  );
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
  expect(onSend).toHaveBeenLastCalledWith({
    variableName: "",
    selectedValues: [],
    inputText: undefined,
    images: ["/image.png"],
  });
  fireEvent.click(screen.getByRole("checkbox", { name: "A" }));
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "My note" },
  });
  fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
  expect(onSend).toHaveBeenLastCalledWith({
    variableName: "",
    selectedValues: ["a"],
    inputText: "My note",
    images: ["/image.png"],
  });
});

it("restores native structured image history without showing JSON in the input", () => {
  render(
    <ContentRender
      content="?[...Explain]"
      readonly
      showImageInput
      userInput={JSON.stringify({ inputText: "", images: ["/image.png"] })}
    />
  );
  expect(screen.getByRole<HTMLTextAreaElement>("textbox").value).toBe("");
  expect(screen.getByRole("img", { name: "Attached image 1" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Add image" })).toBeNull();
});

it("does not add image controls or image payload fields to legacy text input", () => {
  const onSend = vi.fn();
  render(<ContentRender content="?[...Explain]" onSend={onSend} />);
  expect(screen.queryByRole("button", { name: "Add image" })).toBeNull();
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "Plain answer" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  expect(onSend).toHaveBeenCalledExactlyOnceWith({
    variableName: "",
    inputText: "Plain answer",
  });
});

it("keeps a plain JSON answer intact when image input is not enabled", () => {
  const raw = JSON.stringify({ images: ["/image.png"] });
  render(<ContentRender content="?[...Explain]" userInput={raw} />);
  expect(screen.getByRole<HTMLTextAreaElement>("textbox").value).toBe(raw);
  expect(screen.queryByRole("img", { name: "Attached image 1" })).toBeNull();
});

it("does not copy the active flow's attachments into finished history", () => {
  render(
    <MarkdownFlow
      showImageInput
      imageInput={{ images: ["/current.png"], onSelect: vi.fn() }}
      initialContentList={[
        {
          content: "?[...Earlier]",
          isFinished: true,
          readonly: true,
          userInput: JSON.stringify({ images: ["/earlier.png"] }),
        },
        { content: "?[...Current]" },
      ]}
    />
  );
  expect(
    screen
      .getAllByRole("img", { name: "Attached image 1" })
      .map((image) => image.getAttribute("src"))
  ).toEqual(["/earlier.png", "/current.png"]);
  expect(screen.getAllByRole("button", { name: "Add image" })).toHaveLength(1);
});
