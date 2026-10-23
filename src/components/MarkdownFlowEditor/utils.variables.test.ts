import { describe, expect, it } from "vitest";
import {
  createVariableExpressionRegexp,
  extractVariableNames,
  isValidVariableName,
  normalizeVariableName,
} from "./utils";

describe("variable names shared with the interaction parser", () => {
  it.each([
    "gender",
    "user_name_2",
    "\ufeffkey\ufeff",
    "你的性别是？",
    "Which-option?",
    "école",
    "نام؟",
    "年齢🙂?",
  ])("accepts the existing backend name %s", (name) => {
    expect(isValidVariableName(name)).toBe(true);
    expect(normalizeVariableName(` ${name} `)).toBe(name);
    expect(`{{ ${name} }}`.match(createVariableExpressionRegexp())?.[0]).toBe(
      `{{ ${name} }}`
    );
  });

  it.each([
    "",
    " ",
    "first name",
    "first\tname",
    "first\nname",
    "a\u00a0b",
    "a\u0085b",
    "a\u001cb",
    "a{b",
    "a}b",
  ])("rejects the backend's invalid name %j", (name) => {
    expect(isValidVariableName(name)).toBe(false);
    expect(normalizeVariableName(name)).toBeNull();
  });

  it("uses Python whitespace boundaries without stripping legal BOM characters", () => {
    expect(normalizeVariableName("\u0085\u001c\ufeffkey\ufeff\u001f")).toBe(
      "\ufeffkey\ufeff"
    );
    expect(extractVariableNames("{{\u0085\ufeffkey\ufeff\u001f}}")).toEqual([
      "\ufeffkey\ufeff",
    ]);
  });

  it("extracts trimmed question keys and old identifiers without changing their text", () => {
    expect(
      extractVariableNames(
        "{{ user_name }} ?[%{{ 你的性别是？ }} 男 | 女] {{你的性别是？}} {{Which-option?}} {{first name}}"
      )
    ).toEqual(["user_name", "你的性别是？", "Which-option?"]);
  });
});
