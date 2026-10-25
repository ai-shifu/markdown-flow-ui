import { describe, expect, it, vi } from "vitest";

import { resolveSlideInteractionState } from "./interactionResolution";

describe("resolveSlideInteractionState", () => {
  it("keeps resolved button-and-input interactions editable while preserving defaults", () => {
    const interactionState = resolveSlideInteractionState(
      {
        type: "interaction",
        content: "?[%{{nickname}} 老师 || 同学 || ...怎么称呼你？]",
        user_input: "老师, 小王",
        readonly: false,
      },
      {}
    );

    expect(interactionState.hasResolvedInteractionInput).toBe(true);
    expect(interactionState.isInteractionReadonly).toBe(false);
    expect(interactionState.shouldAutoContinueInteraction).toBe(false);
    expect(interactionState.interactionDefaults).toEqual(
      expect.objectContaining({
        inputText: "小王",
      })
    );
    expect(interactionState.interactionDefaultSelectedValues).toEqual(["老师"]);
  });

  it("keeps explicitly readonly resolved interactions passive", () => {
    const interactionState = resolveSlideInteractionState(
      {
        type: "interaction",
        content: "?[%{{level}} 完全不了解 | 略知一二 | 比较熟悉]",
        user_input: "比较熟悉",
        readonly: true,
      },
      {}
    );

    expect(interactionState.hasResolvedInteractionInput).toBe(true);
    expect(interactionState.isInteractionReadonly).toBe(true);
    expect(interactionState.shouldAutoContinueInteraction).toBe(true);
  });

  it("auto-continues resolved history interactions without forcing readonly", () => {
    const interactionState = resolveSlideInteractionState(
      {
        type: "interaction",
        content: "?[%{{level}} 完全不了解 | 略知一二 | 比较熟悉]",
        user_input: "略知一二",
        readonly: false,
      },
      {}
    );

    expect(interactionState.hasResolvedInteractionInput).toBe(true);
    expect(interactionState.isInteractionReadonly).toBe(false);
    expect(interactionState.shouldAutoContinueInteraction).toBe(false);
  });

  it("preserves structured history defaults without forcing readonly", () => {
    const interactionState = resolveSlideInteractionState(
      {
        type: "interaction",
        content: "?[%{{level}} 完全不了解 || 略知一二 || ...补充说明]",
        user_input: '{"selectedValues":["略知一二"],"inputText":"之前补充"}',
        readonly: false,
      },
      {}
    );

    expect(interactionState.hasResolvedInteractionInput).toBe(true);
    expect(interactionState.isInteractionReadonly).toBe(false);
    expect(interactionState.shouldAutoContinueInteraction).toBe(false);
    expect(interactionState.interactionDefaults).toEqual(
      expect.objectContaining({
        inputText: "之前补充",
        selectedValues: ["略知一二"],
      })
    );
    expect(interactionState.interactionDefaultSelectedValues).toEqual([
      "略知一二",
    ]);
  });

  it("ignores interaction default value options once history input exists", () => {
    const resolveDefaultValues = vi.fn().mockReturnValue({
      selectedValues: ["默认值"],
      inputText: "默认备注",
    });

    const interactionState = resolveSlideInteractionState(
      {
        type: "interaction",
        content: "?[%{{nickname}} 老师 || 同学 || ...怎么称呼你？]",
        user_input: "同学, 小李",
        readonly: false,
      },
      {
        interactionDefaultValueOptions: {
          resolveDefaultValues,
        },
      }
    );

    expect(resolveDefaultValues).not.toHaveBeenCalled();
    expect(interactionState.hasResolvedInteractionInput).toBe(true);
    expect(interactionState.isInteractionReadonly).toBe(false);
    expect(interactionState.shouldAutoContinueInteraction).toBe(false);
    expect(interactionState.interactionDefaults).toEqual(
      expect.objectContaining({
        inputText: "小李",
      })
    );
    expect(interactionState.interactionDefaultSelectedValues).toEqual(["同学"]);
  });
});
