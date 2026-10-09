// @vitest-environment jsdom
import React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ContentRender, { type ContentRenderProps } from "./ContentRender";

vi.mock("mermaid", () => ({ default: {} }));
vi.mock("./plugins/CustomVariable", () => ({ default: () => null }));
vi.mock("./IframeSandbox", () => ({
  default: ({ content }: { content: string }) => (
    <div data-testid="iframe-sandbox" data-content={content} />
  ),
}));

type BarProps = React.ComponentProps<
  NonNullable<ContentRenderProps["customRenderBar"]>
>;

const advanceTime = (milliseconds: number) => {
  act(() => {
    vi.advanceTimersByTime(milliseconds);
  });
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("ContentRender custom bar with progressive video", () => {
  it.each([false, true])(
    "preserves one bar and its content contract across video chunks (typewriter=%s)",
    (enableTypewriter) => {
      const onSend = vi.fn();
      const sendPayload = { inputText: "Continue" };
      const CustomBar = vi.fn(({ onSend: send }: BarProps) => (
        <button
          data-testid="custom-render-bar"
          onClick={() => send?.(sendPayload)}
        >
          Continue
        </button>
      ));
      const prose = "甲乙丙丁\n";
      const pendingHeader = '<iframe title="a >';
      const openingHeader = "<iframe title=\"a > b\" data-tag='video'>";
      const fixture = (content: string) => (
        <ContentRender
          content={content}
          enableTypewriter={enableTypewriter}
          typewriterPacing="content-aware"
          typingSpeed={30}
          customRenderBar={CustomBar}
          onSend={onSend}
        />
      );
      const initialContent = `${prose}${pendingHeader}`;
      const { container, rerender } = render(fixture(initialContent));

      const expectBar = (content: string, displayContent: string) => {
        const bars = container.querySelectorAll<HTMLButtonElement>(
          '[data-testid="custom-render-bar"]'
        );
        expect(bars).toHaveLength(1);
        expect(
          container.querySelectorAll(".content-render-custom-bar")
        ).toHaveLength(1);
        expect(CustomBar.mock.calls.at(-1)?.[0]).toEqual({
          content,
          displayContent,
          onSend,
        });
        return bars[0];
      };

      const bar = expectBar(
        initialContent,
        `${enableTypewriter ? "" : prose}${pendingHeader}`
      );
      expect(container.querySelector("iframe")).toBeNull();
      expect(
        container.querySelector('[data-testid="iframe-sandbox"]')
      ).toBeNull();

      advanceTime(30);
      const typedProse = enableTypewriter ? "甲乙" : prose;
      expect(expectBar(initialContent, `${typedProse}${pendingHeader}`)).toBe(
        bar
      );

      const openingContent = `${prose}${openingHeader}`;
      rerender(fixture(openingContent));
      expect(expectBar(openingContent, `${typedProse}${openingHeader}`)).toBe(
        bar
      );
      const video = container.querySelector<HTMLIFrameElement>(
        'iframe[data-tag="video"]'
      );
      expect(video).not.toBeNull();
      const videoWindow = video!.contentWindow as Window & {
        retainedState?: string;
      };
      videoWindow.retainedState = "playing";

      const closedVideo = `${openingHeader}</iframe>`;
      const closedContent = `${prose}${closedVideo}`;
      rerender(fixture(closedContent));
      expect(expectBar(closedContent, `${typedProse}${closedVideo}`)).toBe(bar);
      expect(container.querySelector('iframe[data-tag="video"]')).toBe(video);
      expect(video!.contentWindow).toBe(videoWindow);
      expect(videoWindow.retainedState).toBe("playing");

      const followingProse = "\n戊己庚辛";
      const finalContent = `${closedContent}${followingProse}`;
      rerender(fixture(finalContent));
      expect(
        expectBar(
          finalContent,
          enableTypewriter ? `${typedProse}${closedVideo}` : finalContent
        )
      ).toBe(bar);
      expect(container.querySelector('iframe[data-tag="video"]')).toBe(video);
      expect(video!.contentWindow).toBe(videoWindow);
      expect(videoWindow.retainedState).toBe("playing");

      for (let tick = 0; tick < 6; tick += 1) advanceTime(30);
      expect(expectBar(finalContent, finalContent)).toBe(bar);
      expect(container.querySelector('iframe[data-tag="video"]')).toBe(video);
      expect(video!.contentWindow).toBe(videoWindow);
      expect(videoWindow.retainedState).toBe("playing");
      fireEvent.click(bar);
      expect(onSend).toHaveBeenCalledExactlyOnceWith(sendPayload);
    }
  );
});
