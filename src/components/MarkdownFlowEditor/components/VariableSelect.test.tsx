// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import VariableSelect from "./VariableSelect";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));

afterEach(cleanup);

it.each([
  "你的性别是？",
  "Which-option?",
  "user_name",
  "नाम🙂?",
  "\ufeffkey\ufeff",
])(
  "adds a backend-compatible name %s and trims its outer whitespace",
  (name) => {
    const onAddVariable = vi.fn();
    const onSelect = vi.fn();
    render(
      <VariableSelect onAddVariable={onAddVariable} onSelect={onSelect} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Add new variable" }));
    const input = screen.getByPlaceholderText("Variable name");
    fireEvent.change(input, { target: { value: ` ${name} ` } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onAddVariable).toHaveBeenCalledWith({ name });
    expect(onSelect).toHaveBeenCalledWith({ name });
  }
);

it.each([" ", "first name", "a{b", "a}b"])(
  "rejects the invalid name %j",
  (name) => {
    const onAddVariable = vi.fn();
    render(<VariableSelect onAddVariable={onAddVariable} />);
    fireEvent.click(screen.getByRole("button", { name: "Add new variable" }));
    const input = screen.getByPlaceholderText("Variable name");
    fireEvent.change(input, { target: { value: name } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onAddVariable).not.toHaveBeenCalled();
    expect(
      screen.getByText("Use a non-empty name without spaces or braces")
    ).toBeTruthy();
  }
);

it("detects a duplicate after trimming the new name", () => {
  const onAddVariable = vi.fn();
  render(
    <VariableSelect
      variables={[{ name: "你的性别是？" }]}
      onAddVariable={onAddVariable}
    />
  );
  fireEvent.click(screen.getByRole("button", { name: "Add new variable" }));
  const input = screen.getByPlaceholderText("Variable name");
  fireEvent.change(input, { target: { value: " 你的性别是？ " } });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(onAddVariable).not.toHaveBeenCalled();
  expect(screen.getByText("Variable already exists")).toBeTruthy();
});
