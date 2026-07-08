import { describe, expect, it } from "vitest";

import type { SlideAudioItem } from "../useSlide";
import { getSortedAudioSegments } from "./audioSegments";

type SlideAudioSegments = NonNullable<SlideAudioItem["audioSegments"]>;

describe("getSortedAudioSegments", () => {
  it("sorts segments by segment index", () => {
    expect(
      getSortedAudioSegments({
        audioSegments: [
          {
            segment_index: 2,
            audio_data: "third",
            duration_ms: 300,
            is_final: true,
          },
          {
            segment_index: 0,
            audio_data: "first",
            duration_ms: 100,
            is_final: false,
          },
          {
            segment_index: 1,
            audio_data: "second",
            duration_ms: 200,
            is_final: false,
          },
        ],
      }).map((segment) => segment.audio_data)
    ).toEqual(["first", "second", "third"]);
  });

  it("filters nullish segments and handles missing segment indexes defensively", () => {
    const audioSegments = [
      {
        segment_index: 2,
        audio_data: "third",
        duration_ms: 300,
        is_final: true,
      },
      null,
      {
        audio_data: "missing-index",
        duration_ms: 100,
        is_final: false,
      },
      undefined,
      {
        segment_index: 1,
        audio_data: "second",
        duration_ms: 200,
        is_final: false,
      },
    ] as unknown as SlideAudioSegments;

    expect(() => getSortedAudioSegments({ audioSegments })).not.toThrow();
    expect(
      getSortedAudioSegments({ audioSegments }).map(
        (segment) => segment.audio_data
      )
    ).toEqual(["missing-index", "second", "third"]);
  });

  it("refreshes the cached sort when a streaming segment array mutates", () => {
    const audioSegments = [
      {
        segment_index: 1,
        audio_data: "second",
        duration_ms: 200,
        is_final: false,
      },
    ];

    expect(getSortedAudioSegments({ audioSegments })).toHaveLength(1);

    audioSegments.push({
      segment_index: 0,
      audio_data: "first",
      duration_ms: 100,
      is_final: false,
    });

    expect(
      getSortedAudioSegments({ audioSegments }).map(
        (segment) => segment.audio_data
      )
    ).toEqual(["first", "second"]);
  });

  it("refreshes the cached sort when a streaming segment object is replaced", () => {
    const originalSegment = {
      segment_index: 0,
      audio_data: "original",
      duration_ms: 100,
      is_final: false,
    };
    const replacementSegment = {
      segment_index: 0,
      audio_data: "updated",
      duration_ms: 100,
      is_final: false,
    };
    const audioSegments = [originalSegment];

    expect(getSortedAudioSegments({ audioSegments })[0]).toBe(originalSegment);

    audioSegments[0] = replacementSegment;

    expect(getSortedAudioSegments({ audioSegments })[0]).toBe(
      replacementSegment
    );
  });
});
