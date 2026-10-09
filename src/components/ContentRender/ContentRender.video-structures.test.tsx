// @vitest-environment jsdom
import React from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { revealNativeVideo } from "../../../tests/helpers/reveal-native-video";
import ContentRender from "./ContentRender";

vi.mock("mermaid", () => ({ default: {} }));
vi.mock("./plugins/CustomVariable", () => ({ default: () => null }));
vi.mock("./IframeSandbox", () => ({
  default: ({ content }: { content: string }) => (
    <div data-testid="iframe-sandbox" data-content={content} />
  ),
}));

const videoSource = '<iframe data-tag="video"></iframe>';
const structures = [
  {
    name: "ATX heading",
    selector: "h1",
    initial: `# Watch ${videoSource} now`,
    following: " After",
    completedText: "WatchnowAfter",
  },
  {
    name: "setext heading",
    selector: "h1",
    initial: `Watch ${videoSource} now\n====`,
    following: "\n\nAfter",
    completedText: "Watchnow",
  },
  {
    name: "emphasis",
    selector: "em",
    initial: `*Watch ${videoSource} now*`,
    following: " After",
    completedText: "Watchnow",
  },
  {
    name: "link",
    selector: "a",
    initial: `[Watch ${videoSource} now](/watch)`,
    following: " After",
    completedText: "Watchnow",
  },
];

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe.each([false, true])(
  "ContentRender native video structures (typewriter=%s)",
  (enableTypewriter) => {
    it.each(structures)(
      "preserves the revealed video's $name through typing and later HTML",
      ({ selector, initial, following, completedText }) => {
        const onState = vi.fn();
        const fixture = (content: string) => (
          <ContentRender
            content={content}
            enableTypewriter={enableTypewriter}
            typingSpeed={30}
            onTypewriterStateChange={onState}
          />
        );
        const { container, rerender } = render(fixture(initial));
        const video = revealNativeVideo(container, initial, enableTypewriter);
        const parent = video!.closest(selector);
        expect(parent).not.toBeNull();
        expect(container.querySelectorAll(selector)).toHaveLength(1);
        if (enableTypewriter) expect(parent!.textContent?.trim()).toBe("Watch");
        if (selector === "a")
          expect(parent!.getAttribute("href")).toBe("/watch");
        const videoWindow = video!.contentWindow as Window & {
          retainedState?: string;
        };
        videoWindow.retainedState = "playing";

        const expectStable = () => {
          expect(container.querySelector('iframe[data-tag="video"]')).toBe(
            video
          );
          expect(video!.closest(selector)).toBe(parent);
          expect(container.querySelectorAll(selector)).toHaveLength(1);
          expect(video!.contentWindow).toBe(videoWindow);
          expect(videoWindow.retainedState).toBe("playing");
          if (selector === "a")
            expect(parent!.getAttribute("href")).toBe("/watch");
        };
        const finishTyping = (content: string) => {
          for (
            let tick = 0;
            !onState.mock.lastCall?.[0].isComplete &&
            tick < content.length + 10;
            tick += 1
          ) {
            act(() => vi.advanceTimersByTime(30));
            expectStable();
          }
          expect(onState).toHaveBeenLastCalledWith(
            expect.objectContaining({ isComplete: true })
          );
        };

        const withAfter = `${initial}${following}`;
        rerender(fixture(withAfter));
        expectStable();
        finishTyping(withAfter);
        expect(parent!.textContent?.replace(/\s/g, "")).toBe(completedText);

        const html = "<div data-video-following>Card</div>";
        const content = `${withAfter}\n\n${html}`;
        rerender(fixture(content));
        const sandboxes = container.querySelectorAll(
          '[data-testid="iframe-sandbox"]'
        );
        expect(sandboxes).toHaveLength(enableTypewriter ? 0 : 1);
        if (!enableTypewriter)
          expect(sandboxes[0].getAttribute("data-content")).toBe(html);
        expectStable();
        finishTyping(content);
        expect(
          container
            .querySelector('[data-testid="iframe-sandbox"]')
            ?.getAttribute("data-content")
        ).toBe(html);
        expect(parent!.textContent?.replace(/\s/g, "")).toBe(completedText);
      }
    );

    it.each(["```", "~~~"])(
      "keeps video examples inside a %s code fence inert",
      (marker) => {
        const code = `# Watch ${videoSource} now`;
        const content = `${marker}html\n${code}\n${marker}`;
        const onState = vi.fn();
        const { container } = render(
          <ContentRender
            content={content}
            enableTypewriter={enableTypewriter}
            typingSpeed={30}
            onTypewriterStateChange={onState}
          />
        );
        const expectInert = () => {
          expect(container.querySelector("iframe, h1")).toBeNull();
          expect(
            container.querySelector('[data-testid="iframe-sandbox"]')
          ).toBeNull();
        };
        expectInert();
        for (
          let tick = 0;
          !onState.mock.lastCall?.[0].isComplete && tick < content.length + 10;
          tick += 1
        ) {
          act(() => vi.advanceTimersByTime(30));
          expectInert();
        }
        expect(onState).toHaveBeenLastCalledWith(
          expect.objectContaining({ isComplete: true })
        );
        expect(
          container.querySelector("pre code")?.textContent?.trimEnd()
        ).toBe(code);
      }
    );
  }
);
