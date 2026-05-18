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
