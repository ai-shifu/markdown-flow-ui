import { describe, expect, it } from "vitest";

import {
  getInteractionDefaultSelectedValues,
  getInteractionDefaultValues,
} from "./interaction-defaults";

const MULTI_SELECT_WITH_PLACEHOLDER_CONTENT =
  "?[%{{intro_teaching_problem}}不知道怎么提问，AI 回答经常太泛||担心 AI 不懂我的学生、课程或业务场景||...其他顾虑]";

describe("getInteractionDefaultValues", () => {
  it.each([
    ["?[%{{answer}}Ready//ready|Not yet//later|...Explain]", "ready"],
    ["?[Ready//ready|Not yet//later|...Explain]", "ready"],
    ["?[Ready//ready|Not yet//later|...Explain]", "Ready"],
  ])("restores only the selected button for %s", (content, rawValue) => {
    expect(getInteractionDefaultValues(content, rawValue)).toEqual({
      buttonText: "ready",
    });
  });

  it("preserves custom input without a variable declaration", () => {
    expect(
      getInteractionDefaultValues(
        "?[Ready//ready|...Explain]",
        "My explanation"
      )
    ).toEqual({ inputText: "My explanation" });
  });

  it("separates variable-free multi-select values from trailing custom input", () => {
    expect(
      getInteractionDefaultValues(
        "?[Ready, with a sample//ready||Written//written||...Explain]",
        "ready, written, My explanation"
      )
    ).toEqual({
      selectedValues: ["ready", "written"],
      inputText: "My explanation",
    });
  });

  it("restores variable-free options containing escaped closing brackets", () => {
    expect(
      getInteractionDefaultValues(
        String.raw`?[Array[0\]//array|...Explain]`,
        "array"
      )
    ).toEqual({ buttonText: "array" });
  });

  it("retains the plain-content fallback", () => {
    expect(getInteractionDefaultValues("A plain paragraph", "answer")).toEqual({
      buttonText: "answer",
      inputText: "answer",
    });
  });

  it("restores multi-select options when option labels contain commas", () => {
    const result = getInteractionDefaultValues(
      MULTI_SELECT_WITH_PLACEHOLDER_CONTENT,
      "不知道怎么提问，AI 回答经常太泛, 担心 AI 不懂我的学生、课程或业务场景"
    );

    expect(result).toEqual({
      selectedValues: [
        "不知道怎么提问，AI 回答经常太泛",
        "担心 AI 不懂我的学生、课程或业务场景",
      ],
      inputText: undefined,
    });
  });

  it("keeps unmatched trailing text as custom input for multi-select interactions", () => {
    const result = getInteractionDefaultValues(
      MULTI_SELECT_WITH_PLACEHOLDER_CONTENT,
      "担心 AI 不懂我的学生、课程或业务场景, 需要更多真实案例, 课堂活动"
    );

    expect(result).toEqual({
      selectedValues: ["担心 AI 不懂我的学生、课程或业务场景"],
      inputText: "需要更多真实案例, 课堂活动",
    });
  });
});

describe("getInteractionDefaultSelectedValues", () => {
  it("returns only restored option values for multi-select history payloads", () => {
    const result = getInteractionDefaultSelectedValues(
      MULTI_SELECT_WITH_PLACEHOLDER_CONTENT,
      "不知道怎么提问，AI 回答经常太泛, 其他顾虑"
    );

    expect(result).toEqual(["不知道怎么提问，AI 回答经常太泛"]);
  });
});

describe("options that escape the grammar's delimiters", () => {
  // `?[…]` gives `|`, `//`, `...` and `]` structural meaning, and an option carrying one escapes
  // it with a backslash. These go through remark-flow's parser, which is where an interaction is
  // normally read: they pin that this library actually resolves the escapes rather than showing
  // a learner the backslashes or losing half an option. (The shortcode regex in this file is the
  // gate only detects candidates; parser failures retain plain replay behavior.)
  const ESCAPED_BRACKET_CONTENT =
    "?[%{{pattern}}^[a-z\\]+$||array[0\\]||...something else]";

  it("reads an option containing an escaped bracket whole", () => {
    const result = getInteractionDefaultValues(
      ESCAPED_BRACKET_CONTENT,
      "^[a-z]+$"
    );

    // A multi-select restores its chosen options; `?[…]` no longer ends at the `]` inside one.
    expect(result.selectedValues).toEqual(["^[a-z]+$"]);
  });

  it("restores a URL option whose slashes are escaped", () => {
    const result = getInteractionDefaultValues(
      "?[%{{link}}https:\\/\\/a\\.com\\/x|https:\\/\\/b\\.com\\/y]",
      "https://b.com/y"
    );

    expect(result.buttonText).toBe("https://b.com/y");
  });
});

describe("question memory keys", () => {
  it.each(["你的性别是？", "Which-option?", "user_name"])(
    "restores option values for %s",
    (name) => {
      expect(
        getInteractionDefaultValues(
          `?[%{{ ${name} }} 男//male | 女//female]`,
          "female"
        )
      ).toEqual({ buttonText: "female" });
    }
  );
});

import contract from "../../tests/fixtures/variable-name-contract.json";

it.each(contract.interactions)(
  "restores defaults for opaque key $name",
  ({ source, values }) => {
    expect(
      getInteractionDefaultValues(source, values[values.length - 1])
    ).toEqual({ buttonText: values[values.length - 1] });
  }
);

it.each(contract.boundary_cases.filter((example) => example.interaction_count))(
  "restores exact boundary option values for $source",
  (example) => {
    const value = example.values![0];
    expect(getInteractionDefaultValues(example.source, value)).toEqual({
      buttonText: value,
    });
  }
);

it("restores a BOM-prefixed multi-select option without treating BOM as a separator", () => {
  const content = "?[%{{ key }} \ufeffA || B]";
  expect(getInteractionDefaultValues(content, "\ufeffA, B")).toEqual({
    selectedValues: ["\ufeffA", "B"],
    inputText: undefined,
  });
  expect(
    getInteractionDefaultValues(
      content,
      JSON.stringify({ selectedValues: ["\ufeffA"] })
    )
  ).toEqual({
    selectedValues: ["\ufeffA"],
    buttonText: undefined,
    inputText: undefined,
  });
});

it.each(
  contract.boundary_cases.filter((example) => !example.interaction_count)
)("keeps non-interaction replay plain for $source", (example) => {
  expect(getInteractionDefaultValues(example.source, "Go")).toEqual({
    buttonText: "Go",
    inputText: "Go",
  });
});

it.each(contract.document_context_cases)(
  "restores actual interaction defaults after $id",
  ({ source, values }) => {
    const value = values[values.length - 1];
    expect(getInteractionDefaultValues(source, value)).toEqual({
      buttonText: value,
    });
  }
);

import documentBoundaries from "../../tests/fixtures/document-boundary-cases.json";

it.each(documentBoundaries)(
  "does not invent replay controls across $id",
  ({ source, interaction_count }) => {
    expect(getInteractionDefaultValues(source, "B")).toEqual(
      interaction_count
        ? { buttonText: "B" }
        : { buttonText: "B", inputText: "B" }
    );
  }
);
