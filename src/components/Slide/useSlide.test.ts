import { describe, expect, it } from "vitest";

import { resolveSlideAudioItemSource } from "./useSlide";
import type { Element } from "./types";

const createSpeakableElement = (overrides: Partial<Element> = {}): Element => ({
  content: "hello",
  type: "text",
  is_speakable: true,
  ...overrides,
});

describe("resolveSlideAudioItemSource", () => {
  it("keeps the completed audio URL when streaming segments are also present", () => {
    const source = resolveSlideAudioItemSource(
      createSpeakableElement({
        audio_url: "https://example.com/audio.mp3",
        audio_segments: [
          {
            segment_index: 0,
            audio_data: "aaa",
            duration_ms: 120,
            is_final: false,
          },
        ],
      })
    );

    expect(source).toEqual({
      audioUrl: "https://example.com/audio.mp3",
      audioSegments: [
        expect.objectContaining({
          segment_index: 0,
          is_final: false,
        }),
      ],
      isAudioStreaming: false,
    });
  });

  it("keeps waiting for more segments when no completed audio URL exists", () => {
    const source = resolveSlideAudioItemSource(
      createSpeakableElement({
        audio_segments: [
          {
            segment_index: 0,
            audio_data: "aaa",
            duration_ms: 120,
            is_final: false,
          },
        ],
      })
    );

    expect(source.audioUrl).toBe("");
    expect(source.isAudioStreaming).toBe(true);
  });
});
