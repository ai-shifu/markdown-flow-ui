// @vitest-environment jsdom
import React from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ContentRender from "./ContentRender";

vi.mock("mermaid", () => ({ default: {} }));
vi.mock("./plugins/CustomVariable", () => ({ default: () => null }));
vi.mock("./IframeSandbox", () => ({
  default: () => <div data-testid="iframe-sandbox" />,
}));

const videoSource = '<iframe data-tag="video"></iframe>';
const html = "<figure data-code-example>Example</figure>";
const containers = [
  { name: "bullet", opening: "- ", continuation: "  ", sandbox: true },
  { name: "ordered", opening: "12. ", continuation: "    ", sandbox: true },
  {
    name: "nested lists",
    opening: "- - ",
    continuation: "    ",
    sandbox: true,
  },
  { name: "mixed", opening: "> - ", continuation: ">   ", sandbox: true },
  {
    name: "stable native run",
    opening: "- ",
    continuation: "  ",
    sandbox: false,
  },
];

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("container code fences after received HTML", () => {
  it.each(
    containers.flatMap((container) =>
      ["```", "~~~"].flatMap((marker) =>
        [false, true].flatMap((enabled) =>
          (["fixed", "content-aware"] as const).map((pacing) => ({
            ...container,
            marker,
            enabled,
            pacing,
          }))
        )
      )
    )
  )(
    "keeps $name $marker code inert (typing=$enabled, pacing=$pacing)",
    ({ opening, continuation, sandbox, marker, enabled, pacing }) => {
      const code = `${opening}${marker}html\n${continuation}${html}\n${continuation}${marker}${marker[0]}`;
      const content = sandbox
        ? `${videoSource}\n<div>Card</div>\n${code}`
        : `${videoSource}\n\n${code}`;
      const onState = vi.fn();
      const { container } = render(
        <ContentRender
          content={content}
          enableTypewriter={enabled}
          typewriterPacing={pacing}
          typingSpeed={30}
          onTypewriterStateChange={onState}
        />
      );
      const video = container.querySelector("iframe")!;
      const parent = video.parentNode;
      const videoWindow = video.contentWindow!;
      const expectSafe = () => {
        const progress = onState.mock.lastCall?.[0].renderedLength;
        expect(
          container.querySelector("figure"),
          `processed=${progress}`
        ).toBeNull();
        expect(
          container.querySelectorAll('[data-testid="iframe-sandbox"]')
        ).toHaveLength(sandbox ? 1 : 0);
        expect(container.querySelectorAll("iframe")).toHaveLength(1);
        expect(container.querySelector("iframe")).toBe(video);
        expect(video.parentNode).toBe(parent);
        expect(video.contentWindow).toBe(videoWindow);
      };
      expectSafe();
      for (
        let tick = 0;
        enabled &&
        !onState.mock.lastCall?.[0].isComplete &&
        tick < content.length * 4;
        tick += 1
      ) {
        act(() => vi.advanceTimersByTime(30));
        expectSafe();
      }
      expect(onState).toHaveBeenLastCalledWith(
        expect.objectContaining({
          isComplete: true,
          renderedLength: content.length,
          totalLength: content.length,
        })
      );
      const codeBlocks = container.querySelectorAll("pre code");
      expect(codeBlocks).toHaveLength(1);
      expect(codeBlocks[0].textContent?.trimEnd()).toBe(html);
    }
  );
});
