import { describe, expect, it } from "vitest";

import { getVisibleSubtitleText } from "./subtitleCue";

describe("getVisibleSubtitleText", () => {
  it("joins currently visible cues by visual order", () => {
    expect(
      getVisibleSubtitleText(
        [
          {
            text: "Second line",
            start_ms: 0,
            end_ms: 2_000,
            segment_index: 1,
            position: 1,
          },
          {
            text: "First line",
            start_ms: 0,
            end_ms: 2_000,
            segment_index: 0,
            position: 0,
          },
        ],
        1_000
      )
    ).toBe("First line\nSecond line");
  });

  it("returns an empty string when no cue is visible", () => {
    expect(
      getVisibleSubtitleText(
        [
          {
            text: "Hidden",
            start_ms: 0,
            end_ms: 1_000,
            segment_index: 0,
          },
        ],
        1_500
      )
    ).toBe("");
  });
});
