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
const mathExamples = [
  { name: "inline math", content: `$${videoSource}$` },
  { name: "block math", content: `$$\n${videoSource}\n$$` },
];

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe.each([false, true])(
  "ContentRender video literals in math (typewriter=%s)",
  (enableTypewriter) => {
    it.each(mathExamples)(
      "keeps an iframe inside $name inert before and after typing",
      ({ content }) => {
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
          expect(container.querySelector("iframe")).toBeNull();
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
        }
        expect(onState).toHaveBeenLastCalledWith(
          expect.objectContaining({ isComplete: true })
        );
        expectInert();
      }
    );
  }
);
