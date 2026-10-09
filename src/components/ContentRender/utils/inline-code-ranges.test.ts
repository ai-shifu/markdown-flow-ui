import { describe, expect, it } from "vitest";
import {
  getInlineCodeRanges,
  getMarkdownCodeRanges,
  getMarkdownLiteralRanges,
} from "./inline-code-ranges";

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

describe("Markdown code source ranges", () => {
  it.each([
    '$<iframe data-tag="video"></iframe>$',
    '$$\n<iframe data-tag="video"></iframe>\n$$',
  ])(
    "protects math literal offsets without classifying math as code: %s",
    (math) => {
      const prefix = "Intro\n\n";
      const source = `${prefix}${math}`;
      expect(getMarkdownLiteralRanges(source)).toEqual([
        { start: prefix.length, end: source.length },
      ]);
      expect(getMarkdownCodeRanges(source)).toEqual([]);
      expect(getInlineCodeRanges(source)).toEqual([]);
    }
  );

  it.each(["```", "~~~"])(
    "uses raw offsets for complete and unfinished quoted %s fences",
    (marker) => {
      const prefix = "Intro\r\n\r\n> ";
      const code = `${marker}html\r\n> <div>example</div>`;
      for (const ending of ["", `\r\n> ${marker}`]) {
        const raw = `${prefix}${code}${ending}`;
        expect(getMarkdownCodeRanges(raw)).toEqual([
          { start: prefix.length, end: raw.length },
        ]);
        expect(getInlineCodeRanges(raw)).toEqual([]);
      }
    }
  );

  it("returns code blocks and inline spans without changing their source positions", () => {
    const inline = "`<div>inline</div>`";
    const prefix = `Use ${inline}.\n\n`;
    const code = "    <style>code</style>";
    const raw = `${prefix}${code}\n\n<style>real</style>`;

    expect(getMarkdownCodeRanges(raw)).toEqual([
      { start: "Use ".length, end: "Use ".length + inline.length },
      { start: prefix.length, end: prefix.length + code.length },
    ]);
    expect(getInlineCodeRanges(raw)).toEqual([
      { start: "Use ".length, end: "Use ".length + inline.length },
    ]);
  });
});
