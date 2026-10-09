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
const guard = (container: HTMLElement, hasVideo = false) => {
  const video = container.querySelector<HTMLIFrameElement>("iframe");
  const parent = video?.parentNode;
  const videoWindow = video?.contentWindow as
    | (Window & { retainedState?: string })
    | undefined;
  if (hasVideo) {
    expect(video).not.toBeNull();
    videoWindow!.retainedState = "playing";
  }
  return () => {
    expect(
      container.querySelector('[data-testid="iframe-sandbox"]')
    ).toBeNull();
    expect(
      container.querySelector("figure, svg, .content-render-svg")
    ).toBeNull();
    expect(container.querySelectorAll("iframe")).toHaveLength(hasVideo ? 1 : 0);
    if (hasVideo) {
      expect(container.querySelector("iframe")).toBe(video);
      expect(video!.parentNode).toBe(parent);
      expect(video!.contentWindow).toBe(videoWindow);
      expect(videoWindow!.retainedState).toBe("playing");
    }
  };
};
const settle = (
  onState: ReturnType<typeof vi.fn>,
  check: () => void,
  limit: number
) => {
  check();
  for (
    let count = 0;
    !onState.mock.lastCall?.[0].isComplete && count < limit + 10;
    count += 1
  ) {
    tick();
    check();
  }
  expect(onState).toHaveBeenLastCalledWith(
    expect.objectContaining({ isComplete: true })
  );
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe.each([true, false])(
  "ContentRender image alt literals (typewriter=%s)",
  (enableTypewriter) => {
    const fixture = (content: string, onState: ReturnType<typeof vi.fn>) => (
      <ContentRender
        content={content}
        enableTypewriter={enableTypewriter}
        typewriterPacing="content-aware"
        typingSpeed={30}
        onTypewriterStateChange={onState}
      />
    );

    it.each([
      {
        name: "reference figure",
        body: "![<figure>Example</figure>][asset]\n\n[asset]: /image.png",
        alt: "<figure>Example</figure>",
        hasVideo: false,
      },
      {
        name: "reference SVG",
        body: "![<svg><text>Example</text></svg>][asset]\n\n[asset]: /image.png",
        alt: "<svg><text>Example</text></svg>",
        hasVideo: false,
      },
      {
        name: "reference fake video",
        body: "![<iframe data-tag='video'></iframe>][asset]\n\n[asset]: /image.png",
        alt: "<iframe data-tag='video'></iframe>",
        hasVideo: false,
      },
      {
        name: "nested inline label",
        body: "![Outer [<iframe data-tag='video'></iframe>] tail](/image.png)",
        alt: "Outer [<iframe data-tag='video'></iframe>] tail",
        hasVideo: false,
      },
      {
        name: "escaped tags and an entity",
        body: "![\\<figure>Fish &amp; Chips\\</figure>](/image.png)",
        alt: "<figure>Fish & Chips</figure>",
        hasVideo: false,
      },
      {
        name: "reference SVG after a real video",
        body: "![<svg><text>Example</text></svg>][asset]\n\n[asset]: /image.png",
        alt: "<svg><text>Example</text></svg>",
        hasVideo: true,
      },
    ])(
      "keeps $name inert through every tick and preserves the exact alt",
      ({ body, alt, hasVideo }) => {
        const source = (hasVideo ? `${videoSource}\n\n` : "") + body;
        const onState = vi.fn();
        const { container, rerender } = render(fixture(source, onState));
        const check = guard(container, hasVideo);
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
        settle(onState, check, source.length);
        const image = container.querySelector("img");
        expect(container.querySelectorAll("img")).toHaveLength(1);
        expect(image?.getAttribute("alt")).toBe(alt);
        expect(image?.getAttribute("src")).toBe("/image.png");

        const appended = `${source}\n\nAfter`;
        rerender(fixture(appended, onState));
        settle(onState, check, appended.length);
        expect(container.querySelector("img")).toBe(image);
        expect(image?.getAttribute("alt")).toBe(alt);
        expect(onState).toHaveBeenLastCalledWith(
          expect.objectContaining({
            renderedLength: appended.length,
            totalLength: appended.length,
          })
        );
      }
    );

    it.each([
      {
        name: "figure",
        pending: "![<figure>Example",
        closed: "![<figure>Example</figure>]",
        alt: "<figure>Example</figure>",
        hasVideo: false,
      },
      {
        name: "SVG after real video",
        pending: "![<svg><text>Example",
        closed: "![<svg><text>Example</text></svg>]",
        alt: "<svg><text>Example</text></svg>",
        hasVideo: true,
      },
    ])(
      "protects unfinished $name alt snapshots until the image suffix arrives",
      ({ pending, closed, alt, hasVideo }) => {
        const prefix = hasVideo ? `${videoSource}\n\n` : "";
        const onState = vi.fn();
        const { container, rerender } = render(
          fixture(prefix + pending, onState)
        );
        const check = guard(container, hasVideo);
        settle(onState, check, (prefix + pending).length);
        expect(container.querySelector("img")).toBeNull();
        expect(
          container.querySelector(".content-render")?.textContent?.trim()
        ).toBe(pending);

        rerender(fixture(prefix + closed, onState));
        settle(onState, check, (prefix + closed).length);
        expect(container.querySelector("img")).toBeNull();
        expect(
          container.querySelector(".content-render")?.textContent?.trim()
        ).toBe(closed);

        const completed = `${prefix}${closed}(/image.png)`;
        rerender(fixture(completed, onState));
        settle(onState, check, completed.length);
        expect(container.querySelectorAll("img")).toHaveLength(1);
        expect(container.querySelector("img")?.getAttribute("alt")).toBe(alt);
        expect(onState).toHaveBeenLastCalledWith(
          expect.objectContaining({
            renderedLength: completed.length,
            totalLength: completed.length,
          })
        );
      }
    );

    it.each(["blank line", "invalid suffix"])(
      "releases actual HTML after a definite %s boundary",
      (boundary) => {
        const pending = "![<figure>Actual";
        const onState = vi.fn();
        const { container, rerender } = render(fixture(pending, onState));
        settle(onState, guard(container), pending.length);
        const html = "<figure>Actual</figure>";
        const source =
          boundary === "blank line"
            ? `${pending}\n \t\n${html}`
            : `![${html}]broken`;
        rerender(fixture(source, onState));
        if (enableTypewriter && boundary === "blank line") {
          expect(
            container.querySelector('[data-testid="iframe-sandbox"]')
          ).toBeNull();
        }
        for (
          let tick = 0;
          !container.querySelector('[data-testid="iframe-sandbox"]') &&
          tick < source.length;
          tick += 1
        ) {
          act(() => vi.advanceTimersByTime(30));
          expect(
            container.querySelector("figure, iframe, svg, .content-render-svg")
          ).toBeNull();
        }
        const sandbox = container.querySelector(
          '[data-testid="iframe-sandbox"]'
        );
        expect(
          container.querySelectorAll('[data-testid="iframe-sandbox"]')
        ).toHaveLength(1);
        expect(sandbox?.getAttribute("data-content")).toBe(html);
        expect(
          container.querySelector("figure, iframe, svg, .content-render-svg")
        ).toBeNull();
        settle(
          onState,
          () =>
            expect(
              container.querySelector('[data-testid="iframe-sandbox"]')
            ).toBe(sandbox),
          source.length
        );
        expect(onState).toHaveBeenLastCalledWith(
          expect.objectContaining({
            renderedLength: source.length,
            totalLength: source.length,
          })
        );
      }
    );
  }
);
