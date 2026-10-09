// @vitest-environment jsdom
import React from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ContentRender from "./ContentRender";

vi.mock("mermaid", () => ({ default: {} }));
vi.mock("./plugins/CustomVariable", () => ({ default: () => null }));
vi.mock("./IframeSandbox", () => ({
  default: () => <div data-testid="sandbox" />,
}));

const videoSource = '<iframe data-tag="video"></iframe>';
const pending = { marker: "[ ]", checked: false };
const finished = { marker: "[x]", checked: true };
const examples = [
  {
    name: "checked and unchecked tight items",
    body: "- [ ] Pending task with a deliberately long description\n- [x] Finished task with another long description",
    markers: [pending, finished],
  },
  {
    name: "nested task items",
    body: "- Parent item\n  - [x] Nested finished task with a long description\n  - [ ] Nested pending task with a long description",
    markers: [finished, pending],
  },
  {
    name: "quoted task items with CRLF",
    body: "> - [X] Quoted finished task with a long description\r\n> - [ ] Quoted pending task with a long description",
    markers: [{ marker: "[X]", checked: true }, pending],
  },
  {
    name: "loose task items with another paragraph",
    body: "- [ ] Loose pending task with a long description\n\n  Another paragraph belongs to this task.\n\n- [x] Loose finished task with a long description",
    markers: [pending, finished],
  },
  {
    name: "a tab inside the task marker",
    body: "- [\t] Pending task with a deliberately long description",
    markers: [{ marker: "[\t]", checked: false }],
  },
  {
    name: "a marker spanning quoted CRLF lines",
    body: "> - [\r\n>   ] Pending task with a deliberately long description",
    markers: [{ marker: "[\r\n>   ]", checked: false }],
  },
  {
    name: "a marker after a quoted list continuation",
    body: "> -\r\n>   [x] Finished task with a deliberately long description",
    markers: [finished],
  },
  {
    name: "an authored checkbox following the task marker",
    body: '- [x] <input data-authored="true" type="checkbox" disabled checked> Authored input with a long task description',
    markers: [finished],
  },
];

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe.each(["fixed", "content-aware"] as const)(
  "native video task marker activation (%s pacing)",
  (typewriterPacing) => {
    it.each(examples)(
      "reveals $name at each marker's raw budget",
      async ({ body, markers }) => {
        const content = `${videoSource}\n\n${body}`;
        // The full received source already establishes valid GFM tasks. Their
        // generated controls become visible once the authored marker is typed.
        const tasks = markers.map(({ marker, checked }) => {
          const start = body.indexOf(marker);
          const markerEnd = start + marker.length;
          const newline = body.indexOf("\n", markerEnd);
          return {
            markerEnd: 2 + markerEnd,
            lineEnd: 2 + (newline === -1 ? body.length : newline),
            checked,
          };
        });
        const onState = vi.fn();
        const fixture = (source: string) => (
          <ContentRender
            content={source}
            enableTypewriter
            typewriterPacing={typewriterPacing}
            typingSpeed={30}
            onTypewriterStateChange={onState}
          />
        );
        const { container, rerender } = render(fixture(content));
        const video = container.querySelector<HTMLIFrameElement>("iframe")!;
        expect(video).not.toBeNull();
        const parent = video.parentNode;
        const videoWindow = video.contentWindow as Window & {
          retainedTaskState?: string;
        };
        videoWindow.retainedTaskState = "playing";
        const loads = vi.fn();
        video.addEventListener("load", loads);
        await act(async () => Promise.resolve());
        const initialLoads = loads.mock.calls.length;
        const firstVisibleAt = new Map<number, number>();
        const check = () => {
          expect(container.querySelector("iframe")).toBe(video);
          expect(container.querySelectorAll("iframe")).toHaveLength(1);
          expect(video.parentNode).toBe(parent);
          expect(video.contentWindow).toBe(videoWindow);
          expect(videoWindow.retainedTaskState).toBe("playing");
          expect(loads).toHaveBeenCalledTimes(initialLoads);
          const proseBudget =
            onState.mock.lastCall![0].renderedLength - videoSource.length;
          const expected = tasks.filter(
            (task) => task.markerEnd <= proseBudget
          );
          const inputs = Array.from(
            container.querySelectorAll<HTMLInputElement>(
              'input[type="checkbox"]:not([data-authored])'
            )
          );
          expect(inputs.map((input) => input.checked)).toEqual(
            expected.map((task) => task.checked)
          );
          for (const [index, input] of inputs.entries()) {
            expect(input.disabled).toBe(true);
            if (!firstVisibleAt.has(index))
              firstVisibleAt.set(index, proseBudget);
          }
          if (body.includes("data-authored")) {
            const authoredEnd = 2 + body.indexOf(">") + 1;
            expect(
              Boolean(container.querySelector('input[data-authored="true"]'))
            ).toBe(proseBudget >= authoredEnd);
          }
        };
        const finish = (source: string) => {
          check();
          for (
            let tick = 0;
            !onState.mock.lastCall?.[0].isComplete && tick < source.length * 2;
            tick += 1
          ) {
            act(() => vi.advanceTimersByTime(30));
            check();
          }
          expect(onState).toHaveBeenLastCalledWith(
            expect.objectContaining({
              isComplete: true,
              renderedLength: source.length,
              totalLength: source.length,
            })
          );
        };
        finish(content);
        for (const [index, task] of tasks.entries()) {
          // Each long task still has prose left when its checkbox first appears.
          expect(firstVisibleAt.get(index)).toBeGreaterThanOrEqual(
            task.markerEnd
          );
          expect(firstVisibleAt.get(index)).toBeLessThan(task.lineEnd);
        }
        const appended = `${content}\n\nAfter\n\n<div>Card</div>`;
        rerender(fixture(appended));
        finish(appended);
        expect(
          container.querySelectorAll('[data-testid="sandbox"]')
        ).toHaveLength(1);
      }
    );
  }
);

describe("completed native video tasks", () => {
  it.each(examples)(
    "keeps disabled checked semantics for $name",
    ({ body, markers }) => {
      const content = `${videoSource}\n\n${body}`;
      const onState = vi.fn();
      const { container } = render(
        <ContentRender
          content={content}
          enableTypewriter={false}
          onTypewriterStateChange={onState}
        />
      );
      const checked = markers.map((marker) => marker.checked);
      const inputs = Array.from(
        container.querySelectorAll<HTMLInputElement>(
          'input[type="checkbox"]:not([data-authored])'
        )
      );
      expect(inputs.map((input) => input.checked)).toEqual(checked);
      expect(inputs.every((input) => input.disabled)).toBe(true);
      expect(onState).toHaveBeenLastCalledWith(
        expect.objectContaining({
          isComplete: true,
          renderedLength: content.length,
          totalLength: content.length,
        })
      );
    }
  );
});
