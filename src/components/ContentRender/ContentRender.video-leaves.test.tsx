// @vitest-environment jsdom
import React from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ContentRender from "./ContentRender";

vi.mock("mermaid", () => ({ default: {} }));
vi.mock("./plugins/CustomVariable", () => ({ default: () => null }));
vi.mock("./IframeSandbox", () => ({
  default: ({ content }: { content: string }) => (
    <div data-testid="iframe-sandbox" data-content={content} />
  ),
}));

const videoSource = '<iframe data-tag="video"></iframe>';
const examples = [
  {
    name: "thematic break",
    after: "\n\n---\n\nLater",
    tag: "hr",
    end: 5,
    first: "",
    followingStart: 7,
  },
  {
    name: "soft break",
    after: "\n\nFirst\nLater",
    tag: "br",
    end: 8,
    first: "First",
    followingStart: 8,
  },
  {
    name: "CRLF soft break",
    after: "\r\n\r\nFirst\r\nLater",
    tag: "br",
    end: 11,
    first: "First",
    followingStart: 11,
  },
  {
    name: "spaces hard break",
    after: "\n\nFirst  \nLater",
    tag: "br",
    end: 10,
    first: "First",
    followingStart: 10,
  },
  {
    name: "backslash hard break",
    after: "\n\nFirst\\\nLater",
    tag: "br",
    end: 9,
    first: "First",
    followingStart: 9,
  },
];
beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe.each(["fixed", "content-aware"] as const)(
  "video leaf timing (%s pacing)",
  (typewriterPacing) => {
    it.each(examples)(
      "gates $name and keeps the video stable through ticks and append",
      ({ after, tag, end, first, followingStart }) => {
        const onState = vi.fn();
        const fixture = (content: string, enableTypewriter = true) => (
          <ContentRender
            content={content}
            enableTypewriter={enableTypewriter}
            typewriterPacing={typewriterPacing}
            typingSpeed={30}
            onTypewriterStateChange={onState}
          />
        );
        const content = `${videoSource}${after}`;
        const { container, rerender } = render(fixture(content));
        const video = container.querySelector<HTMLIFrameElement>(
          'iframe[data-tag="video"]'
        )!;
        const parent = video.parentElement;
        const videoWindow = video.contentWindow as Window & {
          retainedState?: string;
        };
        videoWindow.retainedState = "playing";
        const stable = () => {
          expect(container.querySelector('iframe[data-tag="video"]')).toBe(
            video
          );
          expect(video.parentElement).toBe(parent);
          expect(video.contentWindow).toBe(videoWindow);
          expect(videoWindow.retainedState).toBe("playing");
        };
        const timed = () => {
          const budget =
            onState.mock.lastCall![0].renderedLength - videoSource.length;
          expect(container.querySelectorAll(tag)).toHaveLength(
            budget >= end ? 1 : 0
          );
          const firstStart = after.indexOf(first || "Later");
          const visibleFirst = first.slice(0, Math.max(0, budget - firstStart));
          const visibleFollowing = "Later".slice(
            0,
            Math.max(0, budget - followingStart)
          );
          expect(
            container
              .querySelector(".content-render")
              ?.textContent?.replace(/\s/g, "")
          ).toBe(visibleFirst + visibleFollowing);
          stable();
        };
        timed();
        for (
          let iteration = 0;
          !onState.mock.lastCall![0].isComplete &&
          iteration <= content.length + 5;
          iteration += 1
        ) {
          act(() => vi.advanceTimersByTime(30));
          timed();
        }
        expect(onState.mock.lastCall![0].isComplete).toBe(true);
        const appended = `${content} More\n\n<div data-appended>Card</div>`;
        rerender(fixture(appended));
        stable();
        expect(
          container
            .querySelector('[data-testid="iframe-sandbox"]')
            ?.getAttribute("data-content")
        ).toBe("<div data-appended>Card</div>");
        for (
          let iteration = 0;
          !onState.mock.lastCall![0].isComplete &&
          iteration <= appended.length + 5;
          iteration += 1
        ) {
          act(() => vi.advanceTimersByTime(30));
          stable();
        }
        expect(onState.mock.lastCall![0].isComplete).toBe(true);
        rerender(fixture(content, false));
        expect(container.querySelectorAll(tag)).toHaveLength(1);
        stable();
      }
    );
  }
);
