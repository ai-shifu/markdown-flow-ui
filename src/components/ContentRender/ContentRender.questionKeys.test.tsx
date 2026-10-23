// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ContentRender from "./ContentRender";

vi.mock("mermaid", () => ({ default: {} }));
vi.mock("./IframeSandbox", () => ({ default: () => null }));

afterEach(cleanup);

it.each([
  "你的性别是？",
  "Which-option?",
  "user_name",
  "école",
  "نام؟",
  "年齢🙂?",
  "\ufeffkey\ufeff",
])("renders and submits the exact question key %s", (name) => {
  const onSend = vi.fn();
  const { container } = render(
    <ContentRender
      content={`?[%{{ ${name} }} 男//male | 女//female | 秘密//secret]`}
      onSend={onSend}
    />
  );
  expect(
    Array.from(container.querySelectorAll("button"), (button) =>
      button.textContent?.trim()
    )
  ).toEqual(["男", "女", "秘密"]);
  expect(container.textContent).not.toContain(name);
  fireEvent.click(screen.getByRole("button", { name: "女" }));
  expect(onSend).toHaveBeenCalledWith({
    variableName: name,
    buttonText: "female",
  });
});

it("keeps the authored question text unchanged", () => {
  const { container } = render(
    <ContentRender
      content={"你的性别是？\n\n?[%{{你的性别是？}} 男 | 女 | 秘密]"}
    />
  );
  expect(container.textContent?.match(/你的性别是？/g)).toHaveLength(1);
  expect(screen.getByText("你的性别是？")).toBeTruthy();
});

it("submits multi-select values under a question key", () => {
  const onSend = vi.fn();
  render(
    <ContentRender
      content="?[%{{学过哪些？}} 数学//math || 英语//english]"
      confirmButtonText="Submit"
      onSend={onSend}
    />
  );
  fireEvent.click(screen.getByRole("checkbox", { name: "数学" }));
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
  expect(onSend).toHaveBeenCalledWith({
    variableName: "学过哪些？",
    selectedValues: ["math"],
    inputText: undefined,
  });
});

it("submits text input under a question key", () => {
  const onSend = vi.fn();
  render(
    <ContentRender content="?[%{{你的目标是？}} ...请回答]" onSend={onSend} />
  );
  const input = screen.getByPlaceholderText("请回答");
  fireEvent.change(input, { target: { value: "Learn" } });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(onSend).toHaveBeenCalledWith({
    variableName: "你的目标是？",
    inputText: "Learn",
  });
});

it("keeps a legal BOM-only key when deriving an assignment-only button", () => {
  const onSend = vi.fn();
  const { container } = render(
    <ContentRender content={"?[%{{\ufeff}}]"} onSend={onSend} />
  );
  const button = container.querySelector("button");
  expect(button?.textContent).toBe("\ufeff");
  fireEvent.click(button!);
  expect(onSend).toHaveBeenCalledWith({
    variableName: "\ufeff",
    buttonText: "\ufeff",
  });
});
