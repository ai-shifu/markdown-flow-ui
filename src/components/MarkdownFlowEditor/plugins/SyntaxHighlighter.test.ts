import { describe, expect, it } from "vitest";

import { collectSyntaxHighlightRanges } from "./SyntaxHighlighter";

function rangeTextsByClass(docText: string, className: string) {
  return collectSyntaxHighlightRanges(docText)
    .filter((range) => range.className === className)
    .map((range) => docText.slice(range.from, range.to));
}

describe("collectSyntaxHighlightRanges", () => {
  it("uses a multiline preserved output block as the outer highlight", () => {
    const docText = [
      "!===",
      "Preserved output",
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
      "Ignored preserved output",
      "!===",
      "--->",
    ].join("\n");

    const fixedTexts = rangeTextsByClass(docText, "syntax-fixed");
    const commentTexts = rangeTextsByClass(docText, "syntax-comment");

    expect(commentTexts).toEqual([docText]);
    expect(fixedTexts).toEqual([]);
  });

  it("keeps standalone comments and preserved output blocks highlighted", () => {
    const docText = [
      "<!--- note --->",
      "",
      "!===",
      "Preserved output",
      "!===",
    ].join("\n");

    const fixedTexts = rangeTextsByClass(docText, "syntax-fixed");
    const commentTexts = rangeTextsByClass(docText, "syntax-comment");

    expect(commentTexts).toEqual(["<!--- note --->"]);
    expect(fixedTexts).toEqual(["!===" + "\nPreserved output\n" + "!==="]);
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

  it("uses single-line preserved output as the outer highlight", () => {
    const docText = "=== <!--- ignored comment ---> ===";

    const fixedTexts = rangeTextsByClass(docText, "syntax-fixed");
    const commentTexts = rangeTextsByClass(docText, "syntax-comment");

    expect(fixedTexts).toEqual([docText]);
    expect(commentTexts).toEqual([]);
  });

  it("ignores preserved output markers inside inner comments", () => {
    const docText = "=== <!--- ignored === marker ---> ===";

    const fixedTexts = rangeTextsByClass(docText, "syntax-fixed");
    const commentTexts = rangeTextsByClass(docText, "syntax-comment");

    expect(fixedTexts).toEqual([docText]);
    expect(commentTexts).toEqual([]);
  });
});

describe.each(["", "%"])("named interactions with prefix %j", (prefix) => {
  it.each([
    {
      content: "{{choice}} Yes | No",
      operators: ["|"],
      strings: [" Yes ", " No"],
    },
    {
      content:
        "{{对 AI 的观点}} AI 是一种工具 || 每种 AI 产品都需要学习使用方法 || 打造 AI 产品是技术高手的事情 || 都不同意\n",
      operators: ["||", "||", "||"],
    },
    {
      content: "{{answer}}... Your answer",
      operators: ["..."],
      strings: [" Your answer"],
    },
    {
      content: "{{skills}} React||Vue||... Other",
      operators: ["||", "||", "..."],
    },
    {
      content: "{{a|b...c?}} Yes | No",
      operators: ["|"],
    },
    {
      content: "{{choice}} a\\|b|wait\\...|go",
      operators: ["|", "|"],
    },
  ])("highlights operators in $content", ({ content, operators, strings }) => {
    const source = `?[${prefix}${content}]`;

    expect(rangeTextsByClass(source, "syntax-keyword")).toEqual([
      "?",
      ...operators,
    ]);
    expect(rangeTextsByClass(source, "syntax-variable")).toEqual([
      content.slice(0, content.indexOf("}}") + 2),
    ]);
    expect(rangeTextsByClass(source, "syntax-bracket")).toEqual(["[", "]"]);
    expect(rangeTextsByClass(source, "syntax-percent-valid")).toEqual(
      prefix ? ["%"] : []
    );
    expect(rangeTextsByClass(source, "syntax-button-text")).toEqual([]);
    if (strings) {
      expect(rangeTextsByClass(source, "syntax-string")).toEqual(strings);
    }
  });

  it("recognizes an assignment after whitespace padding", () => {
    const source = `?[ \t${prefix}{{ choice }} A||B]`;
    expect(rangeTextsByClass(source, "syntax-keyword")).toEqual(["?", "||"]);
    expect(rangeTextsByClass(source, "syntax-variable")).toEqual([
      "{{ choice }}",
    ]);
  });

  it("keeps operators highlighted while editing the variable", () => {
    const source = `?[${prefix}{{choice}} A||B]`;
    const ranges = collectSyntaxHighlightRanges(
      source,
      (from, to) =>
        from <= source.indexOf("choice") && to > source.indexOf("choice")
    );
    expect(
      ranges.filter((range) => range.className === "syntax-variable")
    ).toEqual([]);
    expect(
      ranges
        .filter((range) => range.className === "syntax-keyword")
        .map((range) => source.slice(range.from, range.to))
    ).toEqual(["?", "||"]);
  });

  it("keeps an invalid leading marker atomic", () => {
    const source = `?[${prefix}{{ }} A|B]`;
    expect(rangeTextsByClass(source, "syntax-variable-invalid")).toEqual([
      "{{ }}",
    ]);
    expect(rangeTextsByClass(source, "syntax-keyword")).toEqual(["?", "|"]);
    expect(rangeTextsByClass(source, "syntax-percent-invalid")).toEqual(
      prefix ? ["%"] : []
    );
  });
});

it.each([
  "Continue",
  "Hello {{name}} | ...",
  "\\{{choice}} A|B",
  "\ufeff{{choice}} A|B",
])("keeps ordinary button text highlighted: %s", (content) => {
  const source = `?[${content}]`;
  expect(rangeTextsByClass(source, "syntax-keyword")).toEqual(["?"]);
  expect(rangeTextsByClass(source, "syntax-string")).toEqual([]);
  expect(
    rangeTextsByClass(source, "syntax-button-text").length
  ).toBeGreaterThan(0);
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

it.each([
  "你的性别是？",
  "Which-option?",
  "user_name",
  "年齢🙂?",
  "\ufeffkey\ufeff",
])("highlights %s consistently inside and outside an interaction", (name) => {
  const content = `{{ ${name} }} ?[%{{${name}}} Yes | No]`;
  expect(rangeTextsByClass(content, "syntax-variable")).toEqual([
    `{{ ${name} }}`,
    `{{${name}}}`,
  ]);
  expect(rangeTextsByClass(content, "syntax-percent-valid")).toEqual(["%"]);
});

it("does not decorate punctuation inside a key as option operators", () => {
  const content = "?[%{{a|b...c?}} Yes | No]";
  expect(rangeTextsByClass(content, "syntax-variable")).toEqual([
    "{{a|b...c?}}",
  ]);
  expect(rangeTextsByClass(content, "syntax-keyword")).toEqual(["?", "|"]);
});

it.each([
  "first  name",
  "Which [path] | level//hint...?",
  "a{b",
  "a}",
  "{{inner",
  "<!-- key --> === value",
])("treats the entire opaque key %s as one highlighted token", (name) => {
  const marker = `{{ ${name} }}`;
  const source = `?[%${marker} A | B]`;
  expect(rangeTextsByClass(source, "syntax-variable")).toEqual([marker]);
  expect(rangeTextsByClass(source, "syntax-keyword")).toEqual(["?", "|"]);
  expect(rangeTextsByClass(source, "syntax-percent-valid")).toEqual(["%"]);
  expect(rangeTextsByClass(source, "syntax-comment")).toEqual([]);
  expect(rangeTextsByClass(source, "syntax-fixed")).toEqual([]);
});

it("does not recognize an inner opening brace as a separate variable", () => {
  const source = "{{ invalid\u0000{{inner }} after";
  expect(rangeTextsByClass(source, "syntax-variable")).toEqual([]);
});

it("does not highlight a question nested in a standalone opaque variable", () => {
  const source = "{{ key ?[A|B] }}";
  expect(rangeTextsByClass(source, "syntax-variable")).toEqual([source]);
  expect(rangeTextsByClass(source, "syntax-keyword")).toEqual([]);
});

it("highlights an assignment after Python whitespace padding without skipping BOM", () => {
  const source = "?[ \t%{{ x]y }} A | B]";
  expect(rangeTextsByClass(source, "syntax-percent-valid")).toEqual(["%"]);
  expect(
    rangeTextsByClass("?[\ufeff%{{ x]y }} A | B]", "syntax-percent-valid")
  ).toEqual([]);
});

it.each([
  "{{ unterminated ?[Go]",
  "?[%{{unterminated ?[Go]",
  "?[A {{unterminated ?[Go]",
])("leaves nested syntax literal inside an unfinished marker: %s", (source) => {
  expect(rangeTextsByClass(source, "syntax-keyword")).toEqual([]);
});

import contract from "../../../../tests/fixtures/variable-name-contract.json";
import { readVariableMarker } from "remark-flow";

it.each(contract.document_context_cases)(
  "highlights names without crossing document context $id",
  ({ source, names }) => {
    expect(
      rangeTextsByClass(source, "syntax-variable").map(
        (marker) => readVariableMarker(marker)?.name
      )
    ).toEqual(names);
    expect(
      rangeTextsByClass(source, "syntax-keyword").filter(
        (token) => token === "?"
      )
    ).toHaveLength(1);
  }
);

import documentBoundaries from "../../../../tests/fixtures/document-boundary-cases.json";

it.each(documentBoundaries)(
  "does not invent a control across $id",
  ({ source, names, interaction_count }) => {
    expect(
      rangeTextsByClass(source, "syntax-variable").map(
        (marker) => readVariableMarker(marker)?.name
      )
    ).toEqual(names);
    expect(
      rangeTextsByClass(source, "syntax-keyword").filter(
        (token) => token === "?"
      )
    ).toHaveLength(interaction_count);
  }
);

it.each(["\n", "\r\n", "\r"])(
  "highlights the real control after an unfinished interaction with %j line endings",
  (eol) => {
    const source = [
      "?[ unfinished",
      "~~~",
      "{{ x",
      "~~~",
      "?[%{{ real }} A|B]",
    ].join(eol);
    const questions = collectSyntaxHighlightRanges(source).filter(
      (range) =>
        range.className === "syntax-keyword" &&
        source.slice(range.from, range.to) === "?"
    );
    expect(questions.map((range) => range.from)).toEqual([
      source.lastIndexOf("?["),
    ]);
  }
);
