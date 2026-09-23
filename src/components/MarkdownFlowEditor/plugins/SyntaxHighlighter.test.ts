import { describe, expect, it } from "vitest";

import { collectSyntaxHighlightRanges } from "./SyntaxHighlighter";

function rangeTextsByClass(docText: string, className: string) {
  return collectSyntaxHighlightRanges(docText)
    .filter((range) => range.className === className)
    .map((range) => docText.slice(range.from, range.to));
}

describe("collectSyntaxHighlightRanges", () => {
  it("uses a multiline fixed output block as the outer highlight", () => {
    const docText = [
      "!===",
      "Fixed output",
      "<!--- ignored comment --->",
      "!===",
    ].join("\n");

    const fixedTexts = rangeTextsByClass(docText, "syntax-fixed");
    const commentTexts = rangeTextsByClass(docText, "syntax-comment");

    expect(fixedTexts).toEqual([docText]);
    expect(commentTexts).toEqual([]);
  });

  it("uses an HTML comment as the outer highlight", () => {
    const docText = [
      "<!---",
      "!===",
      "Ignored fixed output",
      "!===",
      "--->",
    ].join("\n");

    const fixedTexts = rangeTextsByClass(docText, "syntax-fixed");
    const commentTexts = rangeTextsByClass(docText, "syntax-comment");

    expect(commentTexts).toEqual([docText]);
    expect(fixedTexts).toEqual([]);
  });

  it("keeps standalone comments and fixed output blocks highlighted", () => {
    const docText = [
      "<!--- note --->",
      "",
      "!===",
      "Fixed output",
      "!===",
    ].join("\n");

    const fixedTexts = rangeTextsByClass(docText, "syntax-fixed");
    const commentTexts = rangeTextsByClass(docText, "syntax-comment");

    expect(commentTexts).toEqual(["<!--- note --->"]);
    expect(fixedTexts).toEqual(["!===" + "\nFixed output\n" + "!==="]);
  });

  it("keeps syntax after an outer block highlighted", () => {
    const docText = [
      "!===",
      "<!--- ignored comment --->",
      "!===",
      "{{user_name}} ?[%{{choice}}Yes|No]",
    ].join("\n");

    const variableTexts = rangeTextsByClass(docText, "syntax-variable");
    const keywordTexts = rangeTextsByClass(docText, "syntax-keyword");
    const commentTexts = rangeTextsByClass(docText, "syntax-comment");

    expect(commentTexts).toEqual([]);
    expect(variableTexts).toEqual(["{{user_name}}", "{{choice}}"]);
    expect(keywordTexts).toContain("?");
    expect(keywordTexts).toContain("|");
  });

  it("uses single-line fixed output as the outer highlight", () => {
    const docText = "=== <!--- ignored comment ---> ===";

    const fixedTexts = rangeTextsByClass(docText, "syntax-fixed");
    const commentTexts = rangeTextsByClass(docText, "syntax-comment");

    expect(fixedTexts).toEqual([docText]);
    expect(commentTexts).toEqual([]);
  });

  it("ignores fixed output markers inside inner comments", () => {
    const docText = "=== <!--- ignored === marker ---> ===";

    const fixedTexts = rangeTextsByClass(docText, "syntax-fixed");
    const commentTexts = rangeTextsByClass(docText, "syntax-comment");

    expect(fixedTexts).toEqual([docText]);
    expect(commentTexts).toEqual([]);
  });
});

describe("interactions whose options escape a bracket", () => {
  it("highlights to the interaction's real end, not the first bracket inside it", () => {
    // `\]` is option text, so the closing bracket is the last one. Cut short, the highlight
    // ended mid-option and the rest of the line was painted as prose.
    const docText = "?[%{{pattern}}^[a-z\\]+$|array[0\\]]";

    const brackets = rangeTextsByClass(docText, "syntax-bracket");

    expect(brackets).toEqual(["[", "]"]);
    const closing = collectSyntaxHighlightRanges(docText).filter(
      (range) => range.className === "syntax-bracket"
    );
    expect(closing[closing.length - 1].to).toBe(docText.length);
  });
});

describe("escaped delimiters inside an interaction", () => {
  it("does not paint an escaped bar as a separator", () => {
    // The parser reads `a\|b` as one option. Painted as a separator, the highlight told the
    // author the grammar had split an option it had in fact left whole.
    const docText = "?[%{{choice}}a\\|b|c]";

    const separators = rangeTextsByClass(docText, "syntax-keyword");

    // The `?` is a keyword too; what matters is that only the real separator joins it.
    expect(separators.filter((text) => text !== "?")).toEqual(["|"]);
  });

  it("does not paint an escaped ellipsis as a text-input marker", () => {
    // `\...` is the minimal escape: the first dot is escaped, so the run can no longer be read
    // as the marker. A scan that does not know about escapes still sees three dots in a row.
    const docText = "?[%{{choice}}wait\\...|go]";

    const separators = rangeTextsByClass(docText, "syntax-keyword");

    expect(separators.filter((text) => text !== "?")).toEqual(["|"]);
  });

  it("leaves a markdown link alone, as the parser does", () => {
    // `?[text](url)` is a link, not an interaction; remark-flow rejects it with `(?!\()`.
    const docText = "?[label](https://example.com)";

    expect(rangeTextsByClass(docText, "syntax-bracket")).toEqual([]);
  });
});
