import { describe, expect, it } from "vitest";

import {
  getSubtitleCueJumpTarget,
  getSubtitleCueJumpTime,
  getVisibleSubtitleText,
  shouldClearSubtitleCueJumpTarget,
} from "./subtitleCue";

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

  it("defaults non-finite playback time to zero", () => {
    expect(
      getVisibleSubtitleText(
        [
          {
            text: "Opening",
            start_ms: 0,
            end_ms: 1_000,
            segment_index: 0,
          },
        ],
        Number.NaN
      )
    ).toBe("Opening");
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

  it("returns the previous subtitle even after the active subtitle has played for a while", () => {
    expect(
      getSubtitleCueJumpTime({
        subtitleCues,
        currentTimeMs: 2_400,
        direction: "previous",
      })
    ).toBe(0);
  });

  it("returns the previous subtitle near the active subtitle start", () => {
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

  it("defaults non-finite playback time to zero", () => {
    expect(
      getSubtitleCueJumpTime({
        subtitleCues,
        currentTimeMs: Number.NaN,
        direction: "next",
      })
    ).toBe(1_500);
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

describe("getSubtitleCueJumpTarget", () => {
  const tracks = [
    {
      subtitleCues: [
        {
          text: "First track opening",
          start_ms: 0,
          end_ms: 1_000,
          segment_index: 0,
        },
        {
          text: "First track closing",
          start_ms: 2_000,
          end_ms: 3_000,
          segment_index: 1,
        },
      ],
    },
    {
      subtitleCues: [
        {
          text: "Second track opening",
          start_ms: 0,
          end_ms: 1_000,
          segment_index: 0,
        },
        {
          text: "Second track closing",
          start_ms: 4_000,
          end_ms: 5_000,
          segment_index: 1,
        },
      ],
    },
    {
      subtitleCues: [],
    },
    {
      subtitleCues: [
        {
          text: "Fourth track opening",
          start_ms: 0,
          end_ms: 1_000,
          segment_index: 0,
        },
      ],
    },
  ];

  it("returns a next target inside the current audio track", () => {
    expect(
      getSubtitleCueJumpTarget({
        tracks,
        currentAudioIndex: 0,
        currentTimeMs: 500,
        direction: "next",
      })
    ).toEqual({
      audioIndex: 0,
      timeMs: 2_000,
    });
  });

  it("returns the first cue in the next audio track when current audio has no next target", () => {
    expect(
      getSubtitleCueJumpTarget({
        tracks,
        currentAudioIndex: 0,
        currentTimeMs: 2_500,
        direction: "next",
      })
    ).toEqual({
      audioIndex: 1,
      timeMs: 0,
    });
  });

  it("skips audio tracks without subtitle cues when moving forward", () => {
    expect(
      getSubtitleCueJumpTarget({
        tracks,
        currentAudioIndex: 1,
        currentTimeMs: 4_500,
        direction: "next",
      })
    ).toEqual({
      audioIndex: 3,
      timeMs: 0,
    });
  });

  it("returns a previous target inside the current audio track", () => {
    expect(
      getSubtitleCueJumpTarget({
        tracks,
        currentAudioIndex: 1,
        currentTimeMs: 4_500,
        direction: "previous",
      })
    ).toEqual({
      audioIndex: 1,
      timeMs: 0,
    });
  });

  it("returns the last cue in the previous audio track when current audio has no previous target", () => {
    expect(
      getSubtitleCueJumpTarget({
        tracks,
        currentAudioIndex: 1,
        currentTimeMs: 0,
        direction: "previous",
      })
    ).toEqual({
      audioIndex: 0,
      timeMs: 2_000,
    });
  });

  it("continues to the previous audio track when the previous target was already selected", () => {
    expect(
      getSubtitleCueJumpTarget({
        tracks,
        currentAudioIndex: 1,
        currentTimeMs: 1_200,
        direction: "previous",
        excludeTarget: {
          audioIndex: 1,
          timeMs: 0,
        },
      })
    ).toEqual({
      audioIndex: 0,
      timeMs: 2_000,
    });
  });

  it("continues to the previous cue in the same audio track when a repeated target is excluded", () => {
    expect(
      getSubtitleCueJumpTarget({
        tracks: [
          {
            subtitleCues: [
              {
                text: "Opening",
                start_ms: 0,
                end_ms: 1_000,
                segment_index: 0,
              },
              {
                text: "Middle",
                start_ms: 2_000,
                end_ms: 3_000,
                segment_index: 1,
              },
              {
                text: "Closing",
                start_ms: 4_000,
                end_ms: 5_000,
                segment_index: 2,
              },
            ],
          },
        ],
        currentAudioIndex: 0,
        currentTimeMs: 4_500,
        direction: "previous",
        excludeTarget: {
          audioIndex: 0,
          timeMs: 2_000,
        },
      })
    ).toEqual({
      audioIndex: 0,
      timeMs: 0,
    });
  });

  it("returns null when no subtitle target exists across tracks", () => {
    expect(
      getSubtitleCueJumpTarget({
        tracks,
        currentAudioIndex: 0,
        currentTimeMs: 0,
        direction: "previous",
      })
    ).toBeNull();
    expect(
      getSubtitleCueJumpTarget({
        tracks,
        currentAudioIndex: 3,
        currentTimeMs: 100,
        direction: "next",
      })
    ).toBeNull();
    expect(
      getSubtitleCueJumpTarget({
        tracks,
        currentAudioIndex: -1,
        currentTimeMs: 100,
        direction: "next",
      })
    ).toBeNull();
  });

  it("defaults non-finite current time to zero for cross-track targets", () => {
    expect(
      getSubtitleCueJumpTarget({
        tracks,
        currentAudioIndex: 1,
        currentTimeMs: Number.NaN,
        direction: "next",
      })
    ).toEqual({
      audioIndex: 1,
      timeMs: 4_000,
    });
  });
});

describe("shouldClearSubtitleCueJumpTarget", () => {
  it("keeps the target while playback is still at the subtitle jump target", () => {
    expect(
      shouldClearSubtitleCueJumpTarget({
        currentAudioIndex: 0,
        currentTimeMs: 2_000,
        target: {
          audioIndex: 0,
          timeMs: 2_000,
        },
      })
    ).toBe(false);
  });

  it("clears the target after playback advances away from it on the same audio", () => {
    expect(
      shouldClearSubtitleCueJumpTarget({
        currentAudioIndex: 0,
        currentTimeMs: 4_500,
        target: {
          audioIndex: 0,
          timeMs: 2_000,
        },
      })
    ).toBe(true);
  });

  it("keeps the target while a cross-audio subtitle jump is waiting for the target audio", () => {
    expect(
      shouldClearSubtitleCueJumpTarget({
        currentAudioIndex: 1,
        currentTimeMs: 0,
        target: {
          audioIndex: 0,
          timeMs: 2_000,
        },
      })
    ).toBe(false);
  });

  it("ignores missing targets", () => {
    expect(
      shouldClearSubtitleCueJumpTarget({
        currentAudioIndex: 0,
        currentTimeMs: 4_500,
        target: null,
      })
    ).toBe(false);
  });
});
