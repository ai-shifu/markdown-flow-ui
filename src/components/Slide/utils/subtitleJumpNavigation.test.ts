import { describe, expect, it } from "vitest";

import type { Element } from "../types";
import { canReachSubtitleJumpTarget } from "./subtitleJumpNavigation";

const marker = (overrides: Partial<Element> = {}): Element => ({
  type: "html",
  content: "",
  is_marker: true,
  ...overrides,
});

const unresolvedInteraction = marker({
  type: "interaction",
  user_input: "",
});

const resolvedInteraction = marker({
  type: "interaction",
  user_input: "Done",
});

describe("canReachSubtitleJumpTarget", () => {
  it("blocks subtitle jumps that cross an unresolved interaction", () => {
    expect(
      canReachSubtitleJumpTarget({
        currentIndex: 0,
        targetSlideIndex: 2,
        slideElementList: [marker(), unresolvedInteraction, marker()],
      })
    ).toBe(false);
  });

  it("blocks subtitle jumps from an unresolved interaction slide", () => {
    expect(
      canReachSubtitleJumpTarget({
        currentIndex: 1,
        targetSlideIndex: 1,
        slideElementList: [marker(), unresolvedInteraction],
      })
    ).toBe(false);
  });

  it("allows subtitle jumps across resolved interactions", () => {
    expect(
      canReachSubtitleJumpTarget({
        currentIndex: 0,
        targetSlideIndex: 2,
        slideElementList: [marker(), resolvedInteraction, marker()],
      })
    ).toBe(true);
  });

  it("allows subtitle jumps after the current interaction is resolved locally", () => {
    expect(
      canReachSubtitleJumpTarget({
        currentIndex: 1,
        targetSlideIndex: 2,
        resolvedCurrentInteractionElement: resolvedInteraction,
        slideElementList: [marker(), unresolvedInteraction, marker()],
      })
    ).toBe(true);
  });

  it("allows backward subtitle jumps without applying forward interaction gates", () => {
    expect(
      canReachSubtitleJumpTarget({
        currentIndex: 2,
        targetSlideIndex: 0,
        slideElementList: [marker(), unresolvedInteraction, marker()],
      })
    ).toBe(true);
  });

  it("rejects missing target slide indexes", () => {
    expect(
      canReachSubtitleJumpTarget({
        currentIndex: 0,
        targetSlideIndex: undefined,
        slideElementList: [marker()],
      })
    ).toBe(false);
  });
});
