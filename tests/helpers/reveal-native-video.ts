import { act } from "@testing-library/react";
import { expect, vi } from "vitest";

/** Verify that preceding prose delays video, then advance to its first reveal. */
export function revealNativeVideo(
  container: HTMLElement,
  source: string,
  enableTypewriter: boolean
): HTMLIFrameElement {
  const selector = 'iframe[data-tag="video"]';
  if (enableTypewriter) {
    expect(container.querySelector(selector)).toBeNull();
    for (
      let tick = 0;
      !container.querySelector(selector) && tick < source.length + 10;
      tick += 1
    ) {
      act(() => vi.advanceTimersByTime(30));
    }
  }

  const video = container.querySelector<HTMLIFrameElement>(selector);
  expect(video).not.toBeNull();
  return video!;
}
