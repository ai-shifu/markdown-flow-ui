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
const tick = () => act(() => vi.advanceTimersByTime(30));
const expectNoSandbox = (container: HTMLElement) =>
  expect(container.querySelector('[data-testid="iframe-sandbox"]')).toBeNull();

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe.each([true, false])(
  "ContentRender link metadata (typewriter=%s)",
  (enableTypewriter) => {
    const fixture = (content: string, onState = vi.fn(), onClick = vi.fn()) => (
      <ContentRender
        content={content}
        enableTypewriter={enableTypewriter}
        typewriterPacing="content-aware"
        typingSpeed={30}
        onTypewriterStateChange={onState}
        onClickCustomButtonAfterContent={onClick}
      />
    );

    describe.each([false, true])("real video in link label=%s", (hasVideo) => {
      it.each([
        { name: "figure", title: "<figure>Title</figure>" },
        { name: "details", title: "<details>Title</details>" },
        { name: "fake video", title: "<iframe data-tag='video'></iframe>" },
        { name: "SVG", title: "<svg><text>Title</text></svg>" },
      ])("keeps $name markup inert inside a legal link title", ({ title }) => {
        const label = hasVideo ? `Watch ${videoSource} now` : "Read";
        const source = `[${label}](/lesson "${title}")`;
        const onState = vi.fn();
        const { container, rerender } = render(fixture(source, onState));
        const video = container.querySelector<HTMLIFrameElement>("iframe");
        const parent = video?.parentNode;
        const videoWindow = video?.contentWindow as
          | (Window & { retainedState?: string })
          | undefined;
        if (hasVideo) {
          expect(video).not.toBeNull();
          expect(video!.closest("a")).not.toBeNull();
          videoWindow!.retainedState = "playing";
        }
        const expectStable = () => {
          const progress = onState.mock.lastCall?.[0].renderedLength ?? 0;
          const diagnostic = `processed=${progress}, source prefix=${JSON.stringify(source.slice(0, progress))}`;
          expectNoSandbox(container);
          expect(container.querySelectorAll("iframe"), diagnostic).toHaveLength(
            hasVideo ? 1 : 0
          );
          expect(
            container.querySelector("figure, details"),
            diagnostic
          ).toBeNull();
          expect(
            container.querySelector("svg, .content-render-svg"),
            diagnostic
          ).toBeNull();
          if (hasVideo) {
            expect(container.querySelector("iframe")).toBe(video);
            expect(video!.parentNode).toBe(parent);
            expect(video!.contentWindow).toBe(videoWindow);
            expect(videoWindow!.retainedState).toBe("playing");
            expect(video!.closest("a")?.getAttribute("href")).toBe("/lesson");
            expect(video!.closest("a")?.getAttribute("title")).toBe(title);
          }
        };
        expectStable();
        expect(onState).toHaveBeenLastCalledWith(
          expect.objectContaining({
            renderedLength: enableTypewriter
              ? hasVideo
                ? videoSource.length
                : 0
              : source.length,
            totalLength: source.length,
          })
        );
        if (enableTypewriter) {
          expect(
            container.querySelector(".content-render")?.textContent?.trim()
          ).toBe("");
        }
        for (
          let index = 0;
          !onState.mock.lastCall?.[0].isComplete && index < source.length + 10;
          index += 1
        ) {
          tick();
          expectStable();
        }
        const link = container.querySelector("a");
        expect(link?.getAttribute("href")).toBe("/lesson");
        expect(link?.getAttribute("title")).toBe(title);
        expect(link?.textContent?.replace(/\s/g, "")).toBe(
          hasVideo ? "Watchnow" : "Read"
        );

        const appended = `${source}\n\nAfter`;
        rerender(fixture(appended, onState));
        expectStable();
        for (
          let index = 0;
          !onState.mock.lastCall?.[0].isComplete && index < 20;
          index += 1
        ) {
          tick();
          expectStable();
        }
        expect(container.querySelector("a")).toBe(link);
        expect(onState).toHaveBeenLastCalledWith(
          expect.objectContaining({
            isComplete: true,
            renderedLength: appended.length,
            totalLength: appended.length,
          })
        );
      });
    });

    it("preserves SVG link metadata in an ordinary Markdown run after sandbox HTML", () => {
      const html = "<div>Card</div>";
      const title = "<svg><text>Title</text></svg>";
      const source = `${html}\n\n[Read](/lesson "${title}")`;
      const onState = vi.fn();
      const { container, rerender } = render(fixture(source, onState));
      const sandbox = container.querySelector('[data-testid="iframe-sandbox"]');
      expect(sandbox).not.toBeNull();
      const expectStable = () => {
        expect(
          container.querySelectorAll('[data-testid="iframe-sandbox"]')
        ).toHaveLength(1);
        expect(container.querySelector('[data-testid="iframe-sandbox"]')).toBe(
          sandbox
        );
        expect(sandbox!.getAttribute("data-content")).toBe(html);
        expect(
          container.querySelector("iframe, svg, .content-render-svg")
        ).toBeNull();
      };
      expectStable();
      expect(onState).toHaveBeenLastCalledWith(
        expect.objectContaining({
          renderedLength: enableTypewriter ? html.length : source.length,
          totalLength: source.length,
        })
      );
      for (
        let index = 0;
        !onState.mock.lastCall?.[0].isComplete && index < source.length + 10;
        index += 1
      ) {
        tick();
        expectStable();
      }
      const link = container.querySelector("a");
      expect(link?.getAttribute("href")).toBe("/lesson");
      expect(link?.getAttribute("title")).toBe(title);
      expect(link?.textContent).toBe("Read");

      const appended = `${source}\n\nAfter`;
      rerender(fixture(appended, onState));
      expectStable();
      for (
        let index = 0;
        !onState.mock.lastCall?.[0].isComplete && index < 20;
        index += 1
      ) {
        tick();
        expectStable();
      }
      expect(container.querySelector("a")).toBe(link);
      expect(onState).toHaveBeenLastCalledWith(
        expect.objectContaining({
          isComplete: true,
          renderedLength: appended.length,
          totalLength: appended.length,
        })
      );
    });

    it("keeps a pending link title inert after an existing immediate video", () => {
      const pending = "[Read](/lesson \"<iframe data-tag='video'></iframe>";
      const baselineState = vi.fn();
      const videoState = vi.fn();
      const baseline = render(fixture(pending, baselineState));
      const source = `${videoSource}\n\n${pending}`;
      const media = render(fixture(source, videoState));
      const video = media.container.querySelector<HTMLIFrameElement>("iframe");
      expect(video).not.toBeNull();
      const parent = video!.parentNode;
      const videoWindow = video!.contentWindow as Window & {
        retainedState?: string;
      };
      videoWindow.retainedState = "playing";
      const expectStable = () => {
        expectNoSandbox(baseline.container);
        expectNoSandbox(media.container);
        expect(baseline.container.querySelectorAll("iframe")).toHaveLength(0);
        expect(media.container.querySelectorAll("iframe")).toHaveLength(1);
        expect(media.container.querySelector("iframe")).toBe(video);
        expect(video!.parentNode).toBe(parent);
        expect(video!.contentWindow).toBe(videoWindow);
        expect(videoWindow.retainedState).toBe("playing");
      };
      expectStable();
      expect(videoState).toHaveBeenLastCalledWith(
        expect.objectContaining({
          renderedLength: enableTypewriter ? videoSource.length : source.length,
          totalLength: source.length,
        })
      );
      for (
        let index = 0;
        (!baselineState.mock.lastCall?.[0].isComplete ||
          !videoState.mock.lastCall?.[0].isComplete) &&
        index < source.length + 10;
        index += 1
      ) {
        tick();
        expectStable();
      }
      expect(
        baseline.container.querySelector(".content-render")?.textContent?.trim()
      ).toBe(pending);
      expect(
        media.container.querySelector(".content-render")?.textContent?.trim()
      ).toBe(pending);

      const completed = `${source}")`;
      media.rerender(fixture(completed, videoState));
      expectStable();
      for (
        let index = 0;
        !videoState.mock.lastCall?.[0].isComplete && index < 5;
        index += 1
      ) {
        tick();
        expectStable();
      }
      const link = media.container.querySelector("a");
      expect(link?.getAttribute("href")).toBe("/lesson");
      expect(link?.getAttribute("title")).toBe(
        "<iframe data-tag='video'></iframe>"
      );
      expect(link?.textContent).toBe("Read");
      expect(videoState).toHaveBeenLastCalledWith(
        expect.objectContaining({
          isComplete: true,
          renderedLength: completed.length,
          totalLength: completed.length,
        })
      );
    });
  }
);
