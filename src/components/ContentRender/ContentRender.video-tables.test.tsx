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
const tableSource = `| Name | Demo |\n| --- | --- |\n| Before | ${videoSource} After |`;

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("ContentRender native video in GFM tables", () => {
  it.each([false, true])(
    "keeps an immediate video and table structure stable (typewriter=%s)",
    (enableTypewriter) => {
      const onState = vi.fn();
      const fixture = (content: string) => (
        <ContentRender
          content={content}
          enableTypewriter={enableTypewriter}
          typingSpeed={30}
          onTypewriterStateChange={onState}
        />
      );
      const { container, rerender } = render(fixture(tableSource));
      const video = container.querySelector<HTMLIFrameElement>(
        'iframe[data-tag="video"]'
      );
      expect(video).not.toBeNull();
      const cell = video!.closest("td");
      const table = video!.closest("table");
      expect(cell).not.toBeNull();
      expect(table).not.toBeNull();
      const seenStructure = new Set(
        table!.querySelectorAll("thead, tbody, tr, th, td")
      );
      expect(table!.querySelectorAll("tr")).toHaveLength(
        enableTypewriter ? 1 : 2
      );
      expect(table!.querySelectorAll("th")).toHaveLength(
        enableTypewriter ? 0 : 2
      );
      expect(table!.querySelectorAll("td")).toHaveLength(
        enableTypewriter ? 1 : 2
      );
      if (enableTypewriter) {
        for (const textCell of table!.querySelectorAll("th, td")) {
          expect(textCell.textContent?.trim()).toBe("");
        }
      }
      const videoWindow = video!.contentWindow as Window & {
        retainedState?: string;
      };
      videoWindow.retainedState = "playing";
      let htmlLength = 0;

      const expectStable = () => {
        expect(container.querySelector('iframe[data-tag="video"]')).toBe(video);
        expect(video!.closest("td")).toBe(cell);
        expect(video!.closest("table")).toBe(table);
        expect(container.querySelectorAll("table")).toHaveLength(1);
        const current = Array.from(
          table!.querySelectorAll("thead, tbody, tr, th, td")
        );
        const proseBudget =
          onState.mock.lastCall![0].renderedLength -
          videoSource.length -
          htmlLength;
        expect(table!.querySelectorAll("tr")).toHaveLength(
          !enableTypewriter || proseBudget > 0 ? 2 : 1
        );
        expect(table!.querySelectorAll("th")).toHaveLength(
          [0, tableSource.indexOf("| Demo")].filter(
            (start) => !enableTypewriter || proseBudget > start
          ).length
        );
        expect(table!.querySelectorAll("td")).toHaveLength(
          !enableTypewriter || proseBudget > tableSource.indexOf("| Before")
            ? 2
            : 1
        );
        for (const node of seenStructure)
          expect(table!.contains(node)).toBe(true);
        for (const node of current) seenStructure.add(node);
        expect(video!.contentWindow).toBe(videoWindow);
        expect(videoWindow.retainedState).toBe("playing");
      };
      const finishTyping = (content: string) => {
        for (
          let tick = 0;
          !onState.mock.lastCall?.[0].isComplete && tick < content.length + 10;
          tick += 1
        ) {
          act(() => vi.advanceTimersByTime(30));
          expectStable();
        }
        expect(onState).toHaveBeenLastCalledWith(
          expect.objectContaining({ isComplete: true })
        );
      };

      const withAfter = `${tableSource}\n\nAfter`;
      rerender(fixture(withAfter));
      expectStable();
      finishTyping(withAfter);
      expect(
        Array.from(table!.querySelectorAll("th, td")).map((node) =>
          node.textContent?.trim()
        )
      ).toEqual(["Name", "Demo", "Before", "After"]);

      const html = "<div data-video-following>Card</div>";
      const content = `${withAfter}\n\n${html}`;
      htmlLength = html.length;
      rerender(fixture(content));
      const sandboxes = container.querySelectorAll(
        '[data-testid="iframe-sandbox"]'
      );
      expect(sandboxes).toHaveLength(1);
      expect(sandboxes[0].getAttribute("data-content")).toBe(html);
      expectStable();
      finishTyping(content);
      expect(cell!.textContent?.trim()).toBe("After");
    }
  );
});
