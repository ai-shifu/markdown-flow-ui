// @vitest-environment jsdom
import React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
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
  "ContentRender HTML normalization (typewriter=%s)",
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

    it.each([
      {
        name: "custom button",
        body: "    <custom-button-after-content>Ask</custom-button-after-content>",
        selector: ".content-render-custom-button-after-content",
      },
      {
        name: "inline presentation",
        body: '    <span class="inline-note" lang="fr" dir="rtl">Note</span>',
        selector: ".inline-note",
      },
      {
        name: "inline image",
        body: '    <img alt="Diagram" src="/diagram.svg">',
        selector: 'img[alt="Diagram"]',
      },
    ])(
      "normalizes an indented $name beside video like the ordinary renderer",
      ({ body, selector, name }) => {
        const baselineState = vi.fn();
        const videoState = vi.fn();
        const baselineClick = vi.fn();
        const videoClick = vi.fn();
        const baseline = render(fixture(body, baselineState, baselineClick));
        const source = `${videoSource}\n\n${body}`;
        const media = render(fixture(source, videoState, videoClick));
        const video =
          media.container.querySelector<HTMLIFrameElement>("iframe");
        expect(video).not.toBeNull();
        const parent = video!.parentNode;
        const videoWindow = video!.contentWindow as Window & {
          retainedState?: string;
        };
        videoWindow.retainedState = "playing";
        const expectStable = () => {
          expectNoSandbox(baseline.container);
          expectNoSandbox(media.container);
          expect(media.container.querySelectorAll("iframe")).toHaveLength(1);
          expect(media.container.querySelector("iframe")).toBe(video);
          expect(video!.parentNode).toBe(parent);
          expect(video!.contentWindow).toBe(videoWindow);
          expect(videoWindow.retainedState).toBe("playing");
        };
        expectStable();
        expect(videoState).toHaveBeenLastCalledWith(
          expect.objectContaining({
            renderedLength: enableTypewriter
              ? videoSource.length
              : source.length,
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
        const original = baseline.container.querySelector(selector);
        const withVideo = media.container.querySelector(selector);
        expect(original).not.toBeNull();
        expect(withVideo).not.toBeNull();
        expect(withVideo!.outerHTML).toBe(original!.outerHTML);
        expect(media.container.querySelector("pre")).toBeNull();
        expect(baselineState).toHaveBeenLastCalledWith(
          expect.objectContaining({
            isComplete: true,
            renderedLength: body.length,
            totalLength: body.length,
          })
        );
        expect(videoState).toHaveBeenLastCalledWith(
          expect.objectContaining({
            isComplete: true,
            renderedLength: source.length,
            totalLength: source.length,
          })
        );
        if (name === "custom button") {
          fireEvent.click(original!);
          fireEvent.click(withVideo!);
          expect(baselineClick).toHaveBeenCalledTimes(1);
          expect(videoClick).toHaveBeenCalledTimes(1);
          expect(withVideo!.textContent).toBe("Ask");
        }

        const appended = `${source}\n\nAfter`;
        media.rerender(fixture(appended, videoState, videoClick));
        expectStable();
        for (
          let index = 0;
          !videoState.mock.lastCall?.[0].isComplete && index < 20;
          index += 1
        ) {
          tick();
          expectStable();
        }
        expect(media.container.querySelector(selector)).toBe(withVideo);
        expect(videoState).toHaveBeenLastCalledWith(
          expect.objectContaining({
            isComplete: true,
            renderedLength: appended.length,
            totalLength: appended.length,
          })
        );
      }
    );
  }
);
