import { describe, expect, it } from "vitest";

import type { Element, SlidePlayerCustomActionContext } from "../types";
import {
  getPlayerCustomActionCount,
  resolvePlayerCustomActionElement,
  toPlayerCustomActionList,
} from "./playerCustomActions";

const mockElement: Element = {
  content: "Hello custom action",
  type: "text",
};

const mockContext: SlidePlayerCustomActionContext = {
  currentElement: mockElement,
  currentIndex: 2,
  currentStepElement: mockElement,
};

describe("playerCustomActions", () => {
  it("resolves custom actions from the current slide context", () => {
    const customActionList = toPlayerCustomActionList(
      ({ currentElement, currentIndex }) => [
        `index:${String(currentIndex)}`,
        currentElement?.type ?? "none",
      ],
      mockContext
    );

    expect(customActionList).toEqual(["index:2", "text"]);
  });

  it("counts render-function custom actions after context resolution", () => {
    expect(
      getPlayerCustomActionCount(
        ({ currentElement }) => [
          currentElement?.type ?? "none",
          currentElement?.content ?? "empty",
        ],
        mockContext
      )
    ).toBe(2);
  });

  it("prefers the currently playing audio element over the visible step element", () => {
    const currentStepElement: Element = {
      content: "Visible marker",
      type: "html",
      is_marker: true,
    };
    const currentAudioElement: Element = {
      content: "Hidden speakable text",
      type: "text",
      is_speakable: true,
      audio_url: "https://example.com/audio.mp3",
    };

    expect(
      resolvePlayerCustomActionElement({
        currentAudioIndex: 1,
        currentAudioSequenceIndexes: [1],
        audioList: [{}, { element: currentAudioElement }],
        currentStepElement,
      })
    ).toBe(currentAudioElement);
  });

  it("falls back to the first queued step audio element before playback starts", () => {
    const currentStepElement: Element = {
      content: "Visible marker",
      type: "html",
      is_marker: true,
    };
    const queuedAudioElement: Element = {
      content: "Queued speakable text",
      type: "text",
      is_speakable: true,
    };

    expect(
      resolvePlayerCustomActionElement({
        currentAudioIndex: -1,
        currentAudioSequenceIndexes: [0],
        audioList: [{ element: queuedAudioElement }],
        currentStepElement,
      })
    ).toBe(queuedAudioElement);
  });
});
