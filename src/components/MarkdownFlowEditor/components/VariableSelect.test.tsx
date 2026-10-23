// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import VariableSelect from "./VariableSelect";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));

afterEach(cleanup);

const enterNewVariable = (
  name: string,
  variables: React.ComponentProps<typeof VariableSelect>["variables"] = []
) => {
  const handlers = { onAddVariable: vi.fn(), onSelect: vi.fn() };
  render(<VariableSelect variables={variables} {...handlers} />);
  fireEvent.click(screen.getByRole("button", { name: "Add new variable" }));
  fireEvent.change(screen.getByPlaceholderText("Variable name"), {
    target: { value: name },
  });
  fireEvent.keyDown(screen.getByPlaceholderText("Variable name"), {
    key: "Enter",
  });
  return handlers;
};

it.each([
  "你的性别是？",
  "Which-option?",
  "user_name",
  "नाम🙂?",
  "\ufeffkey\ufeff",
  "first  name",
  "Which [path] | level//hint...?",
  "a{b",
  "a}",
  "{{inner",
])(
  "adds a backend-compatible name %s and trims its outer whitespace",
  (name) => {
    const { onAddVariable, onSelect } = enterNewVariable(` ${name} `);
    expect(onAddVariable).toHaveBeenCalledWith({ name });
    expect(onSelect).toHaveBeenCalledWith({ name });
  }
);

it.each([" ", "a}}b", "a\u0085b", "a\u2028b", "a\u0000b"])(
  "rejects the invalid name %j",
  (name) => {
    const { onAddVariable } = enterNewVariable(name);
    expect(onAddVariable).not.toHaveBeenCalled();
    expect(
      screen.getByText(
        "Use a non-empty name without control characters, line breaks, or }}"
      )
    ).toBeTruthy();
  }
);

it("detects a duplicate after trimming the new name", () => {
  const { onAddVariable } = enterNewVariable(" 你的性别是？ ", [
    { name: "你的性别是？" },
  ]);
  expect(onAddVariable).not.toHaveBeenCalled();
  expect(screen.getByText("Variable already exists")).toBeTruthy();
});

it("preserves case-sensitive key identity while creating variables", () => {
  const { onAddVariable } = enterNewVariable(" name ", [{ name: "Name" }]);
  expect(onAddVariable).toHaveBeenCalledWith({ name: "name" });
});

it("compares existing names after applying the same boundary trim", () => {
  const { onAddVariable } = enterNewVariable("name", [{ name: " name " }]);
  expect(onAddVariable).not.toHaveBeenCalled();
  expect(screen.getByText("Variable already exists")).toBeTruthy();
});
