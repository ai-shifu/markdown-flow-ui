import { describe, expect, it } from "vitest";

import {
  getInteractionDefaultSelectedValues,
  getInteractionDefaultValues,
} from "./interaction-defaults";

const MULTI_SELECT_WITH_PLACEHOLDER_CONTENT =
  "?[%{{intro_teaching_problem}}不知道怎么提问，AI 回答经常太泛||担心 AI 不懂我的学生、课程或业务场景||...其他顾虑]";

describe("getInteractionDefaultValues", () => {
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
  // fallback for when that parser throws; it understands the same escapes, and nothing reachable
  // from here exercises it.)
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
