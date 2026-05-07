import { describe, expect, it } from "vitest";

import { hasReachedAudioEnd } from "./audioCompletion";

describe("hasReachedAudioEnd", () => {
  it("treats seek positions at the duration boundary as ended", () => {
    expect(
      hasReachedAudioEnd({
        currentTimeSeconds: 2,
        durationSeconds: 2,
      })
    ).toBe(true);
  });

  it("treats seek positions within the tolerance window as ended", () => {
    expect(
      hasReachedAudioEnd({
        currentTimeSeconds: 1.96,
        durationSeconds: 2,
      })
    ).toBe(true);
  });

  it("does not treat earlier seek positions as ended", () => {
    expect(
      hasReachedAudioEnd({
        currentTimeSeconds: 1.8,
        durationSeconds: 2,
      })
    ).toBe(false);
  });

  it("ignores invalid duration values", () => {
    expect(
      hasReachedAudioEnd({
        currentTimeSeconds: 2,
        durationSeconds: Number.NaN,
      })
    ).toBe(false);
  });
});
