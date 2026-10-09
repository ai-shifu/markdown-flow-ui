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
const contexts = [
  {
    name: "inline paragraph",
    selector: "p",
    initial: `Before ${videoSource}`,
    following: " After",
    quoteCount: 0,
    listCount: 0,
    orderedStart: null,
    htmlPrefix: " ",
  },
  {
    name: "blockquote",
    selector: "blockquote",
    initial: `> Before\n> ${videoSource}`,
    following: "\n> After",
    quoteCount: 1,
    listCount: 0,
    orderedStart: null,
    htmlPrefix: "\n> ",
  },
  {
    name: "list item",
    selector: "li",
    initial: `- Before ${videoSource}`,
    following: " After",
    quoteCount: 0,
    listCount: 1,
    orderedStart: null,
    htmlPrefix: " ",
  },
  {
    name: "ordered list item inside a blockquote",
    selector: "li",
    initial: `> 3. Before ${videoSource}`,
    following: " After",
    quoteCount: 1,
    listCount: 1,
    orderedStart: 3,
    htmlPrefix: " ",
  },
];

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe.each([false, true])(
  "ContentRender native video context (typewriter=%s)",
  (enableTypewriter) => {
    it.each(contexts)(
      "reveals video after preceding prose and keeps one $name",
      ({
        selector,
        initial,
        following,
        quoteCount,
        listCount,
        orderedStart,
      }) => {
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
        const context = video!.closest(selector);
        expect(context).not.toBeNull();
        expect(container.querySelectorAll(selector)).toHaveLength(1);
        expect(context!.textContent?.trim()).toBe("Before");
        const quote = video!.closest("blockquote");
        const orderedList = video!.closest("ol");
        if (orderedStart !== null) {
          expect(orderedList?.getAttribute("start")).toBe(String(orderedStart));
        }
        const videoWindow = video!.contentWindow as Window & {
          retainedState?: string;
        };
        videoWindow.retainedState = "playing";

        const expectStableContext = () => {
          expect(container.querySelector('iframe[data-tag="video"]')).toBe(
            video
          );
          expect(video!.closest(selector)).toBe(context);
          expect(video!.closest("blockquote")).toBe(quote);
          expect(video!.closest("ol")).toBe(orderedList);
          if (orderedStart !== null) {
            expect(orderedList?.getAttribute("start")).toBe(
              String(orderedStart)
            );
          }
          expect(container.querySelectorAll(selector)).toHaveLength(1);
          expect(video!.contentWindow).toBe(videoWindow);
          expect(videoWindow.retainedState).toBe("playing");
          expect(
            container.querySelector('[data-testid="iframe-sandbox"]')
          ).toBeNull();
        };

        const content = `${initial}${following}`;
        rerender(fixture(content));
        expectStableContext();
        for (
          let tick = 0;
          !onState.mock.lastCall?.[0].isComplete && tick < content.length + 10;
          tick += 1
        ) {
          act(() => {
            vi.advanceTimersByTime(30);
          });
          expectStableContext();
        }

        expect(onState).toHaveBeenLastCalledWith(
          expect.objectContaining({ isComplete: true })
        );
        expect(context!.textContent?.replace(/\s/g, "")).toBe("BeforeAfter");
        expect(container.querySelectorAll("blockquote")).toHaveLength(
          quoteCount
        );
        expect(container.querySelectorAll("li")).toHaveLength(listCount);
      }
    );

    it.each(contexts)(
      "keeps an existing native video in its $name when sandbox HTML arrives",
      ({ selector, initial, following, htmlPrefix, orderedStart }) => {
        const onState = vi.fn();
        const fixture = (content: string) => (
          <ContentRender
            content={content}
            enableTypewriter={enableTypewriter}
            typingSpeed={30}
            onTypewriterStateChange={onState}
          />
        );
        const initialContent = `${initial}${following}`;
        const { container, rerender } = render(fixture(initialContent));
        const video = revealNativeVideo(
          container,
          initialContent,
          enableTypewriter
        );
        const context = video!.closest(selector);
        expect(context).not.toBeNull();
        const quote = video!.closest("blockquote");
        const orderedList = video!.closest("ol");
        const videoWindow = video!.contentWindow as Window & {
          retainedState?: string;
        };
        videoWindow.retainedState = "playing";

        const html = "<div data-video-following>Card</div>";
        const content = `${initialContent}${htmlPrefix}${html}`;
        rerender(fixture(content));
        const sandboxes = container.querySelectorAll(
          '[data-testid="iframe-sandbox"]'
        );
        expect(sandboxes).toHaveLength(enableTypewriter ? 0 : 1);
        if (!enableTypewriter)
          expect(sandboxes[0].getAttribute("data-content")).toBe(html);

        const expectStableContext = () => {
          expect(container.querySelector('iframe[data-tag="video"]')).toBe(
            video
          );
          expect(video!.closest(selector)).toBe(context);
          expect(video!.closest("blockquote")).toBe(quote);
          expect(video!.closest("ol")).toBe(orderedList);
          if (orderedStart !== null) {
            expect(orderedList?.getAttribute("start")).toBe(
              String(orderedStart)
            );
          }
          expect(video!.contentWindow).toBe(videoWindow);
          expect(videoWindow.retainedState).toBe("playing");
        };
        expectStableContext();
        for (
          let tick = 0;
          !onState.mock.lastCall?.[0].isComplete && tick < content.length + 10;
          tick += 1
        ) {
          act(() => {
            vi.advanceTimersByTime(30);
          });
          expectStableContext();
        }

        expect(onState).toHaveBeenLastCalledWith(
          expect.objectContaining({ isComplete: true })
        );
        expect(context!.textContent?.replace(/\s/g, "")).toBe("BeforeAfter");
        expect(
          container
            .querySelector('[data-testid="iframe-sandbox"]')
            ?.getAttribute("data-content")
        ).toBe(html);
      }
    );
  }
);
