// @vitest-environment jsdom
import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import type { PlayerProps } from "./Player";
import Slide from "./Slide";

const playerPropsRef: { current: PlayerProps | null } = { current: null };

vi.mock("./Player", () => ({
  default: (props: PlayerProps) => {
    playerPropsRef.current = props;
    return (
      <button onClick={() => props.onPlaybackTimeChange?.(1_500)} type="button">
        Report playback time
      </button>
    );
  },
}));

afterEach(() => {
  cleanup();
  playerPropsRef.current = null;
});

const elementList = [
  {
    audio_url: "https://audio.example.com/lesson.mp3",
    blockBid: "audio-1",
    content: "Lesson audio",
    is_marker: true,
    is_speakable: true,
    type: "html",
  },
];

it("reports absolute playback time for the active logical audio item", async () => {
  const onPlaybackPositionChange = vi.fn();

  render(
    <Slide
      elementList={elementList}
      onPlaybackPositionChange={onPlaybackPositionChange}
      playerEnabled
    />
  );

  fireEvent.click(screen.getByRole("button", { name: "Report playback time" }));

  await waitFor(() => {
    expect(onPlaybackPositionChange).toHaveBeenCalledWith({
      audioKey: "audio-1",
      element: elementList[0],
      timeMs: 1_500,
    });
  });
});

it("maps a resume request to the existing player seek path without autoplay", async () => {
  render(
    <Slide
      elementList={elementList}
      playbackResumeRequest={{
        audioKey: "audio-1",
        id: "resume-1",
        timeMs: 1_500,
      }}
      playerEnabled
    />
  );

  await waitFor(() => {
    expect(playerPropsRef.current?.subtitleSeekRequest).toMatchObject({
      audioIndex: 0,
      timeMs: 1_500,
    });
    expect(playerPropsRef.current?.defaultPlaying).toBe(false);
  });
});
