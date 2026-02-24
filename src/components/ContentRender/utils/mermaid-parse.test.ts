import { describe, expect, it } from "vitest";

import { parseMarkdownSegments } from "./mermaid-parse";

describe("parseMarkdownSegments", () => {
  it("keeps svg syntax inside markdown table code span as text", () => {
    const markdown = `### Markdown Table Example
| Feature | Syntax | Supported |
| --- | --- | --- |
| SVG | \`<svg>...</svg>\` | Yes |`;

    const segments = parseMarkdownSegments(markdown);

    expect(segments.every((segment) => segment.type !== "svg")).toBe(true);
    expect(segments.map((segment) => segment.value).join("")).toContain(
      "| SVG | `"
    );
    expect(segments.map((segment) => segment.value).join("")).toContain(
      "<svg>...</svg>` | Yes |"
    );
  });

  it("keeps inline svg text inside markdown table row as text", () => {
    const markdown = `| Feature | Syntax | Supported |
| --- | --- | --- |
| SVG | <svg>...</svg> | Yes |`;

    const segments = parseMarkdownSegments(markdown);

    expect(segments.every((segment) => segment.type !== "svg")).toBe(true);
    expect(segments.map((segment) => segment.value).join("")).toContain(
      "| SVG | <svg>...</svg> | Yes |"
    );
  });

  it("still extracts standalone svg blocks", () => {
    const markdown = `Intro

<svg width="100" height="100"><circle cx="50" cy="50" r="30" /></svg>

Outro`;

    const segments = parseMarkdownSegments(markdown);

    expect(segments.map((segment) => segment.type)).toEqual([
      "text",
      "svg",
      "text",
    ]);
  });
});
