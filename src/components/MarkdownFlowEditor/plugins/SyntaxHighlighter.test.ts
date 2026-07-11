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
