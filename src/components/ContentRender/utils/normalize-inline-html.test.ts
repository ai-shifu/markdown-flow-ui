import { describe, expect, it } from "vitest";
import { normalizeInlineHtml } from "./normalize-inline-html";

describe("normalizeInlineHtml inline code boundaries", () => {
  it.each(["    ", "\t", "\t  "])(
    "preserves HTML indentation inside matched inline code: %j",
    (indentation) => {
      const raw = `Use \`value\n${indentation}<style>body { color: red; }</style>\n\``;

      expect(normalizeInlineHtml(raw)).toBe(raw);
    }
  );

  it("uses original CRLF offsets while preserving inline code indentation", () => {
    const intro = Array.from(
      { length: 20 },
      (_value, index) => `Line ${index}`
    ).join("\r\n");
    const raw = `${intro}\r\n\r\nUse \`value\r\n    <style>body { color: red; }</style>\r\n\`\r\n    <div>Outside</div>`;
    const expected = `${intro.replace(/\r\n/g, "\n")}\n\nUse \`value\n    <style>body { color: red; }</style>\n\`\n<div>Outside</div>`;

    expect(normalizeInlineHtml(raw)).toBe(expected);
  });

  it("does not treat valid inline triple backticks as a code fence", () => {
    const raw = "```x`<style>Code</style>```\n    <div>Outside</div>";

    expect(normalizeInlineHtml(raw)).toBe(
      "```x`<style>Code</style>```\n<div>Outside</div>"
    );
  });

  it.each([
    { opening: "- ", continuation: "  " },
    { opening: "12. ", continuation: "    " },
    { opening: "- - ", continuation: "    " },
  ])(
    "preserves HTML indentation in container fences: $opening",
    (container) => {
      for (const marker of ["```", "~~~"]) {
        for (const newline of ["\n", "\r\n"]) {
          const code = `${container.opening}${marker}html${newline}${container.continuation}<figure>Example</figure>${newline}${container.continuation}${marker}`;
          const raw = `${code}${newline}${newline}    <div>Outside</div>`;
          expect(normalizeInlineHtml(raw)).toBe(
            `${code.replace(/\r\n/g, "\n")}\n\n<div>Outside</div>`
          );
        }
      }
    }
  );

  it.each([
    ["    <div>Outside</div>", "<div>Outside</div>"],
    [
      "Use `value\n    <style>Outside</style>",
      "Use `value\n<style>Outside</style>",
    ],
    ["```html\n    <div>Code</div>\n```", "```html\n    <div>Code</div>\n```"],
  ])(
    "keeps existing normalization outside inline code: %s",
    (raw, expected) => {
      expect(normalizeInlineHtml(raw)).toBe(expected);
    }
  );
});
