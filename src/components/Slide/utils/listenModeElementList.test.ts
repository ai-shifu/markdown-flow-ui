import { describe, expect, it } from "vitest";

import {
  buildRunStreamElementListFromEvents,
  normalizeRunStreamElement,
  upsertRunStreamElementList,
  type RunStreamFixtureEvent,
} from "./listenModeElementList";

describe("listenModeElementList", () => {
  it("promotes duplicated audio segments to final when a later chunk completes", () => {
    const elementList = buildRunStreamElementListFromEvents({
      events: [
        {
          type: "element",
          run_event_seq: 1,
          content: {
            element_bid: "text-1",
            element_type: "text",
            content: "hello",
            audio_segments: [
              {
                segment_index: 0,
                audio_data: "aaa",
                duration_ms: 120,
                is_final: false,
                position: 0,
                element_id: "seg-1",
              },
            ],
          },
        },
        {
          type: "element",
          run_event_seq: 2,
          content: {
            element_bid: "text-1",
            element_type: "text",
            content: "hello",
            audio_segments: [
              {
                segment_index: 0,
                audio_data: "aaa",
                duration_ms: 120,
                is_final: true,
                position: 0,
                element_id: "seg-1",
              },
            ],
          },
        },
      ] satisfies RunStreamFixtureEvent[],
    });

    expect(elementList).toHaveLength(1);
    expect(elementList[0]?.audio_segments).toEqual([
      expect.objectContaining({
        segment_index: 0,
        is_final: true,
      }),
    ]);
  });

  it("keeps a stable render sequence when incoming sequence numbers collide", () => {
    const sequenceMap = new Map<string, number>();
    const firstElement = normalizeRunStreamElement(
      {
        element_bid: "interaction-1",
        element_type: "interaction",
        content: "?[pick one]",
        sequence_number: 1,
      },
      1
    );
    const secondElement = normalizeRunStreamElement(
      {
        element_bid: "text-1",
        element_type: "text",
        content: "follow up",
        sequence_number: 1,
      },
      2
    );
    const secondElementUpdate = normalizeRunStreamElement(
      {
        element_bid: "text-1",
        element_type: "text",
        content: "follow up updated",
        sequence_number: 1,
      },
      3
    );

    expect(firstElement).not.toBeNull();
    expect(secondElement).not.toBeNull();
    expect(secondElementUpdate).not.toBeNull();

    const firstPassList = upsertRunStreamElementList({
      currentList: [],
      nextElement: firstElement!,
      sequenceMap,
    });
    const secondPassList = upsertRunStreamElementList({
      currentList: firstPassList,
      nextElement: secondElement!,
      sequenceMap,
    });
    const updatedList = upsertRunStreamElementList({
      currentList: secondPassList,
      nextElement: secondElementUpdate!,
      sequenceMap,
    });

    expect(secondPassList.map((element) => element.sequence_number)).toEqual([
      1, 2,
    ]);
    expect(
      updatedList.find((element) => element.element_bid === "text-1")
        ?.sequence_number
    ).toBe(2);
  });

  it("prefers audioTracks over legacy audio fields like ai-shifu listen mode", () => {
    const normalizedElement = normalizeRunStreamElement(
      {
        element_bid: "text-1",
        element_type: "text",
        content: "hello",
        audio_url: "legacy-audio-url",
        audio_segments: [
          {
            segment_index: 0,
            audio_data: "legacy-segment",
            duration_ms: 100,
            is_final: true,
            position: 0,
            element_id: "legacy-1",
          },
        ],
        audioTracks: [
          {
            position: 0,
            audioUrl: "track-audio-url",
            isAudioStreaming: true,
            audioSegments: [
              {
                segment_index: 1,
                audio_data: "track-segment",
                duration_ms: 150,
                is_final: false,
                position: 0,
                element_id: "track-1",
              },
            ],
          },
        ],
      },
      1
    );

    expect(normalizedElement).toEqual(
      expect.objectContaining({
        audio_url: "track-audio-url",
        is_audio_streaming: true,
        isAudioStreaming: true,
        audio_segments: [
          expect.objectContaining({
            segment_index: 1,
            audio_data: "track-segment",
          }),
        ],
      })
    );
  });
});
