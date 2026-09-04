import { describe, expect, it } from "vitest";

import { resolveRequestedStepNavigation } from "./requestedStepNavigation";

describe("resolveRequestedStepNavigation", () => {
  it("keeps a requested streamed step pending until it becomes available", () => {
    expect(
      resolveRequestedStepNavigation({
        currentStepIndex: 0,
        requestedStepIndex: 2,
        slideStepCount: 1,
      })
    ).toEqual({
      isAvailable: false,
      isPending: true,
      targetStepIndex: 2,
    });

    expect(
      resolveRequestedStepNavigation({
        currentStepIndex: 0,
        requestedStepIndex: 2,
        slideStepCount: 3,
      })
    ).toEqual({
      isAvailable: true,
      isPending: true,
      targetStepIndex: 2,
    });
  });

  it("reports the request as settled only after the target step is active", () => {
    expect(
      resolveRequestedStepNavigation({
        currentStepIndex: 2,
        requestedStepIndex: 2,
        slideStepCount: 3,
      })
    ).toEqual({
      isAvailable: true,
      isPending: false,
      targetStepIndex: 2,
    });
  });

  it("ignores invalid requests", () => {
    expect(
      resolveRequestedStepNavigation({
        currentStepIndex: 0,
        requestedStepIndex: undefined,
        slideStepCount: 3,
      })
    ).toBeNull();
  });
});
