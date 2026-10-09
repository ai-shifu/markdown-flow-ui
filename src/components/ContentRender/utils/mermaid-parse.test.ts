import { describe, expect, it } from "vitest";
import { parseMarkdownSegments } from "./mermaid-parse";

describe("parseMarkdownSegments code protection", () => {
  it.each([
    "> ```html\n> <div>example</div>\n> ```",
    "- ```html\n  <div>example</div>\n  ```",
    "Use ```<div>example</div>``` carefully.",
    "> ```html\n> <svg><text>Code</text></svg>",
    "> ~~~html\n> <svg><text>Code</text></svg>",
    "> ~~~html\n> <svg><text>Code</text></svg>\n> ~~~",
    "    <svg><text>Code</text></svg>",
    "Use `<svg><text>Code</text></svg>` carefully.",
    "> ```html\n> <svg><text>Code</text>",
    "> ~~~html\n> <sv",
    "> ```mermaid\n> graph TD\n> A --> B",
    "Use ```mermaid graph TD``` carefully.",
  ])("keeps protected code intact: %s", (raw) => {
    expect(parseMarkdownSegments(raw)).toEqual([{ type: "text", value: raw }]);
  });

  it("extracts an actual SVG after quoted code without splitting the quote", () => {
    const code = "> ```html\n> <svg>Code</svg>\n> ```\n\n";
    const svg = "<svg><text>Diagram</text></svg>";
    expect(parseMarkdownSegments(`${code}${svg}`)).toEqual([
      { type: "text", value: code },
      { type: "svg", value: svg, complete: true },
    ]);
  });

  it("preserves top-level generic fence segmentation", () => {
    const code = "```html\n<div>example</div>\n```";
    expect(parseMarkdownSegments(`Before\n${code}\nAfter`)).toEqual([
      { type: "text", value: "Before\n" },
      { type: "text", value: code },
      { type: "text", value: "\nAfter" },
    ]);
  });

  it.each([false, true])(
    "preserves top-level mermaid segmentation (complete=%s)",
    (complete) => {
      const diagram = "graph TD\nA --> B";
      const raw = `\`\`\`mermaid\n${diagram}${complete ? "\n```" : ""}`;
      expect(parseMarkdownSegments(raw)).toEqual([
        { type: "mermaid", value: diagram, complete },
      ]);
    }
  );

  it.each([false, true])(
    "preserves top-level SVG segmentation (complete=%s)",
    (complete) => {
      const svg = `<svg><text>Diagram</text>${complete ? "</svg>" : ""}`;
      expect(parseMarkdownSegments(`Before\n${svg}`)).toEqual([
        { type: "text", value: "Before\n" },
        { type: "svg", value: svg, complete },
      ]);
    }
  );
});
