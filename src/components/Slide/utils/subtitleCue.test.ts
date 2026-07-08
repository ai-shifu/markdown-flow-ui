import { describe, expect, it } from "vitest";

import { getSubtitleCueJumpTime, getVisibleSubtitleText } from "./subtitleCue";

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

describe("getSubtitleCueJumpTime", () => {
  const subtitleCues = [
    {
      text: "Third",
      start_ms: 4_000,
      end_ms: 6_000,
      segment_index: 2,
    },
    {
      text: "First",
      start_ms: 0,
      end_ms: 1_500,
      segment_index: 0,
    },
    {
      text: "Second",
      start_ms: 1_500,
      end_ms: 4_000,
      segment_index: 1,
    },
  ];

  it("returns the next subtitle start after the current time", () => {
    expect(
      getSubtitleCueJumpTime({
        subtitleCues,
        currentTimeMs: 1_500,
        direction: "next",
      })
    ).toBe(4_000);
  });

  it("replays the active subtitle after the replay threshold", () => {
    expect(
      getSubtitleCueJumpTime({
        subtitleCues,
        currentTimeMs: 2_400,
        direction: "previous",
      })
    ).toBe(1_500);
  });

  it("returns the previous subtitle before the replay threshold", () => {
    expect(
      getSubtitleCueJumpTime({
        subtitleCues,
        currentTimeMs: 2_000,
        direction: "previous",
      })
    ).toBe(0);
  });

  it("returns the previous subtitle when current time is between cues", () => {
    expect(
      getSubtitleCueJumpTime({
        subtitleCues,
        currentTimeMs: 6_500,
        direction: "previous",
      })
    ).toBe(4_000);
  });

  it("returns null when no subtitle target exists", () => {
    expect(
      getSubtitleCueJumpTime({
        subtitleCues: [],
        currentTimeMs: 1_000,
        direction: "next",
      })
    ).toBeNull();
    expect(
      getSubtitleCueJumpTime({
        subtitleCues,
        currentTimeMs: 0,
        direction: "previous",
      })
    ).toBeNull();
    expect(
      getSubtitleCueJumpTime({
        subtitleCues,
        currentTimeMs: 7_000,
        direction: "next",
      })
    ).toBeNull();
  });

  it("treats duplicate cue start times as one jump target", () => {
    expect(
      getSubtitleCueJumpTime({
        subtitleCues: [
          {
            text: "Top line",
            start_ms: 0,
            end_ms: 2_000,
            segment_index: 0,
            position: 0,
          },
          {
            text: "Bottom line",
            start_ms: 0,
            end_ms: 2_000,
            segment_index: 0,
            position: 1,
          },
          {
            text: "Next",
            start_ms: 2_000,
            end_ms: 3_000,
            segment_index: 1,
          },
        ],
        currentTimeMs: 300,
        direction: "previous",
      })
    ).toBeNull();
  });
});
