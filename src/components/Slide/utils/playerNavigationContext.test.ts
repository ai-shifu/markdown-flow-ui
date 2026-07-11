import { describe, expect, it } from "vitest";

import {
  shouldWakePlayerControlsAfterNavigation,
  suppressPlayerControlsWakeAfterNavigation,
} from "./playerNavigationContext";

describe("playerNavigationContext", () => {
  it("wakes player controls by default", () => {
    expect(shouldWakePlayerControlsAfterNavigation()).toBe(true);
    expect(shouldWakePlayerControlsAfterNavigation({})).toBe(true);
  });

  it("does not wake player controls when navigation disables it", () => {
    expect(
      shouldWakePlayerControlsAfterNavigation({ shouldWakeControls: false })
    ).toBe(false);
  });

  it("preserves navigation context while suppressing player controls wake", () => {
    const context = suppressPlayerControlsWakeAfterNavigation({
      shouldContinuePlayback: true,
    });

    expect(context).toEqual({
      shouldContinuePlayback: true,
      shouldWakeControls: false,
    });
    expect(shouldWakePlayerControlsAfterNavigation(context)).toBe(false);
  });
});
