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
    name: "an earlier heading of the same level",
    selector: "h1",
    count: 2,
    content: `# Earlier\n\n# Watch ${videoSource} now`,
    following: " After",
    completedText: "WatchnowAfter",
  },
  {
    name: "an earlier separate blockquote",
    selector: "blockquote",
    count: 2,
    content: `> Earlier\n\nBetween\n\n> Watch ${videoSource} now`,
    following: " After",
    completedText: "WatchnowAfter",
  },
  {
    name: "an earlier separate list",
    selector: "li",
    count: 2,
    content: `- Earlier\n\nBetween\n\n- Watch ${videoSource} now`,
    following: " After",
    completedText: "WatchnowAfter",
  },
  {
    name: "a reference link with its definition later in the source",
    selector: "a",
    count: 1,
    content: `[Watch ${videoSource} now][watch]\n\n[watch]: /watch`,
    following: "\n\nAfter",
    completedText: "Watchnow",
  },
];

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe.each(["fixed", "content-aware"] as const)(
  "ContentRender received video tree stability (%s pacing)",
  (typewriterPacing) => {
    describe.each([false, true])("typewriter=%s", (enableTypewriter) => {
      it.each(examples)(
        "preserves video identity with $name through every tick and appended HTML",
        ({ selector, count, content, following, completedText }) => {
          const onState = vi.fn();
          const fixture = (source: string) => (
            <ContentRender
              content={source}
              enableTypewriter={enableTypewriter}
              typewriterPacing={typewriterPacing}
              typingSpeed={30}
              onTypewriterStateChange={onState}
            />
          );
          const { container, rerender } = render(fixture(content));
          if (enableTypewriter) {
            expect(
              container.querySelector('iframe[data-tag="video"]')
            ).toBeNull();
            expect(
              container.querySelector(".content-render")?.textContent?.trim()
            ).toBe("");
            expect(onState).toHaveBeenLastCalledWith(
              expect.objectContaining({
                isTyping: true,
                isComplete: false,
                renderedLength: 0,
              })
            );
            for (
              let iteration = 0;
              !container.querySelector('iframe[data-tag="video"]') &&
              iteration < content.length + 10;
              iteration += 1
            ) {
              act(() => vi.advanceTimersByTime(30));
            }
          }
          const video = container.querySelector<HTMLIFrameElement>(
            'iframe[data-tag="video"]'
          );
          expect(video).not.toBeNull();
          const parent = video!.closest(selector);
          expect(parent).not.toBeNull();
          expect(container.querySelectorAll(selector)).toHaveLength(count);
          if (selector === "a") {
            expect(parent!.getAttribute("href")).toBe("/watch");
          }
          const videoWindow = video!.contentWindow as Window & {
            retainedState?: string;
          };
          videoWindow.retainedState = "playing";
          let htmlLength = 0;
          let earlierStructure: Element | undefined;

          const expectStable = () => {
            expect(container.querySelector('iframe[data-tag="video"]')).toBe(
              video
            );
            expect(
              container.querySelectorAll('iframe[data-tag="video"]')
            ).toHaveLength(1);
            expect(video!.closest(selector)).toBe(parent);
            const proseBudget =
              onState.mock.lastCall![0].renderedLength -
              videoSource.length -
              (container.querySelector('[data-testid="iframe-sandbox"]')
                ? htmlLength
                : 0);
            const expectedCount =
              !enableTypewriter || proseBudget > 0 ? count : 1;
            const current = Array.from(container.querySelectorAll(selector));
            expect(current).toHaveLength(expectedCount);
            const earlier = current.find((node) => node !== parent);
            if (earlierStructure) expect(earlier).toBe(earlierStructure);
            else if (earlier) earlierStructure = earlier;
            expect(video!.contentWindow).toBe(videoWindow);
            expect(videoWindow.retainedState).toBe("playing");
            if (selector === "a") {
              expect(parent!.getAttribute("href")).toBe("/watch");
            }
          };
          const tick = () => {
            act(() => vi.advanceTimersByTime(30));
            expectStable();
          };

          tick();
          const withProse = `${content}${following}`;
          rerender(fixture(withProse));
          expectStable();
          tick();
          tick();

          const html = "<div data-video-following>Card</div>";
          const finalContent = `${withProse}\n\n${html}`;
          htmlLength = html.length;
          rerender(fixture(finalContent));
          const sandboxes = container.querySelectorAll(
            '[data-testid="iframe-sandbox"]'
          );
          expect(sandboxes).toHaveLength(enableTypewriter ? 0 : 1);
          if (!enableTypewriter)
            expect(sandboxes[0].getAttribute("data-content")).toBe(html);
          expectStable();
          for (
            let iteration = 0;
            !onState.mock.lastCall?.[0].isComplete &&
            iteration < finalContent.length + 10;
            iteration += 1
          ) {
            tick();
          }

          expect(onState).toHaveBeenLastCalledWith(
            expect.objectContaining({
              isComplete: true,
              renderedLength: finalContent.length,
              totalLength: finalContent.length,
            })
          );
          expect(
            container
              .querySelector('[data-testid="iframe-sandbox"]')
              ?.getAttribute("data-content")
          ).toBe(html);
          expect(parent!.textContent?.replace(/\s/g, "")).toBe(completedText);
          expect(container.querySelectorAll(selector)).toHaveLength(count);
        }
      );
    });
  }
);

describe.each(["fixed", "content-aware"] as const)(
  "ContentRender decoded text pacing beside video (%s pacing)",
  (typewriterPacing) => {
    it.each([false, true])(
      "paces unknown entity spellings as literal text (typewriter=%s)",
      (enableTypewriter) => {
        const before = "&bogus; ";
        const after = " After";
        const content = `${before}${videoSource}${after}`;
        const onState = vi.fn();
        const { container } = render(
          <ContentRender
            content={content}
            enableTypewriter={enableTypewriter}
            typewriterPacing={typewriterPacing}
            typingSpeed={30}
            onTypewriterStateChange={onState}
          />
        );
        const expectLiteralText = () => {
          const proseUnits =
            onState.mock.lastCall![0].renderedLength -
            (container.querySelector('iframe[data-tag="video"]')
              ? videoSource.length
              : 0);
          expect(
            container.querySelector("p")?.textContent?.replace(/\s/g, "") ?? ""
          ).toBe(`${before}${after}`.slice(0, proseUnits).replace(/\s/g, ""));
        };
        expectLiteralText();
        for (
          let tick = 0;
          !onState.mock.lastCall?.[0].isComplete && tick < content.length + 10;
          tick += 1
        ) {
          act(() => vi.advanceTimersByTime(30));
          expectLiteralText();
        }
        expect(onState).toHaveBeenLastCalledWith(
          expect.objectContaining({ isComplete: true })
        );
      }
    );

    it.each([false, true])(
      "paces entities, escapes, and Chinese by their source boundaries (typewriter=%s)",
      (enableTypewriter) => {
        const content = `甲&amp;乙\\*丙 ${videoSource} 丁`;
        const onState = vi.fn();
        const { container } = render(
          <ContentRender
            content={content}
            enableTypewriter={enableTypewriter}
            typewriterPacing={typewriterPacing}
            typingSpeed={30}
            onTypewriterStateChange={onState}
          />
        );
        let video: HTMLIFrameElement | null = null;
        let parent: Element | null = null;
        let videoWindow: (Window & { retainedState?: string }) | null = null;
        // Source units include the complete entity and backslash escape.
        const visibleBoundaries = [
          { end: 1, text: "甲" },
          { end: 6, text: "&" },
          { end: 7, text: "乙" },
          { end: 9, text: "*" },
          { end: 10, text: "丙" },
          { end: 13, text: "丁" },
        ];
        const expectPacedText = () => {
          const proseUnits =
            onState.mock.lastCall![0].renderedLength -
            (container.querySelector('iframe[data-tag="video"]')
              ? videoSource.length
              : 0);
          const expected = visibleBoundaries
            .filter(({ end }) => end <= proseUnits)
            .map(({ text }) => text)
            .join("");
          expect(
            container.querySelector("p")?.textContent?.replace(/\s/g, "") ?? ""
          ).toBe(expected);
          const currentVideo = container.querySelector<HTMLIFrameElement>(
            'iframe[data-tag="video"]'
          );
          if (!video && currentVideo) {
            video = currentVideo;
            parent = video.closest("p");
            expect(parent).not.toBeNull();
            videoWindow = video.contentWindow as Window & {
              retainedState?: string;
            };
            videoWindow.retainedState = "playing";
          }
          if (video) {
            expect(currentVideo).toBe(video);
            expect(video.closest("p")).toBe(parent);
            expect(video.contentWindow).toBe(videoWindow);
            expect(videoWindow!.retainedState).toBe("playing");
          } else {
            expect(onState.mock.lastCall![0].renderedLength).toBeLessThan(
              content.indexOf(videoSource)
            );
          }
        };
        expectPacedText();
        for (
          let tick = 0;
          !onState.mock.lastCall?.[0].isComplete && tick < content.length + 10;
          tick += 1
        ) {
          act(() => vi.advanceTimersByTime(30));
          expectPacedText();
        }
        expect(onState).toHaveBeenLastCalledWith(
          expect.objectContaining({ isComplete: true })
        );
        expect(parent!.textContent?.replace(/\s/g, "")).toBe("甲&乙*丙丁");
      }
    );
  }
);
