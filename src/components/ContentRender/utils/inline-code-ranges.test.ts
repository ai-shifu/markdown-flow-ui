import { describe, expect, it } from "vitest";
import { getInlineCodeRanges } from "./inline-code-ranges";

describe("inline code paragraph boundaries", () => {
  it.each(["style", "div"])(
    "does not hide a line-start %s block inside a preceding code marker",
    (tag) => {
      const raw = `Use \`value\n<${tag}>Card</${tag}>\n\``;
      expect(getInlineCodeRanges(raw)).toEqual([]);
    }
  );

  it.each([
    "Use `<div>\nLiteral</div>` after.",
    "Use `value\n<meta>\n` after.",
    "Use `value\n<template>\n` after.",
    "```x`<style>Code</style>```",
  ])("preserves a valid code span in %s", (raw) => {
    const ranges = getInlineCodeRanges(raw);
    expect(ranges).toHaveLength(1);
    const code = raw.slice(ranges[0].start, ranges[0].end);
    expect(code.startsWith("`")).toBe(true);
    expect(code.endsWith("`")).toBe(true);
    expect(code).toContain("<");
  });
});
