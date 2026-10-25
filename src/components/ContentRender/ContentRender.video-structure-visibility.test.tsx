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

const video = '<iframe data-tag="video"></iframe>';
type Structure = { selector: string; source: string; immediate?: boolean };
const laterBlocks = [
  {
    name: "a fenced code toolbar",
    body: "~~~javascript\r\nconst laterValue = 'Code FINISH';\r\n~~~",
    structures: [{ selector: ".code-block-container", source: "~~~" }],
  },
  {
    name: "unordered list bullets",
    body: "- First long bullet description\n- Later bullet description FINISH",
    structures: [
      { selector: "ul", source: "- First" },
      { selector: "li", source: "- First" },
      { selector: "li", source: "- Later" },
    ],
  },
  {
    name: "ordered list numbers",
    body: "3. First long numbered description\n4. Later numbered description FINISH",
    structures: [
      { selector: "ol", source: "3. First" },
      { selector: "li", source: "3. First" },
      { selector: "li", source: "4. Later" },
    ],
  },
  {
    name: "a blockquote border",
    body: "> Later quote with a long description FINISH",
    structures: [{ selector: "blockquote", source: "> Later" }],
  },
  {
    name: "a heading",
    body: "# Later heading with a long description FINISH",
    structures: [{ selector: "h1", source: "# Later" }],
  },
  {
    name: "a table with a generated missing cell",
    body: "| Name | Value |\r\n| --- | --- |\r\n| X FINISH |",
    structures: [
      { selector: "table", source: "| Name" },
      { selector: "thead", source: "| Name" },
      { selector: "tr", source: "| Name" },
      { selector: "tbody", source: "| X" },
      { selector: "tr", source: "| X" },
    ],
  },
  {
    name: "nested quoted lists",
    body: "> - Outer long description\n>   1. Nested numbered description FINISH",
    structures: [
      { selector: "blockquote", source: "> - Outer" },
      { selector: "ul", source: "- Outer" },
      { selector: "li", source: "- Outer" },
      { selector: "ol", source: "1. Nested" },
      { selector: "li", source: "1. Nested" },
    ],
  },
];
const mediaBlocks = [
  {
    name: "heading siblings",
    body: `# Earlier long heading\n\n# Watch ${video} now\n\n# Later heading FINISH`,
    ancestor: "h1",
    structures: [
      { selector: "h1", source: "# Earlier" },
      { selector: "h1", source: "# Watch", immediate: true },
      { selector: "h1", source: "# Later" },
    ],
  },
  {
    name: "quoted list siblings",
    body: `> - Earlier long item\n> - Watch ${video} now\n> - Later item FINISH`,
    ancestor: "li",
    structures: [
      { selector: "blockquote", source: "> - Earlier", immediate: true },
      { selector: "ul", source: "- Earlier", immediate: true },
      { selector: "li", source: "- Earlier" },
      { selector: "li", source: "- Watch", immediate: true },
      { selector: "li", source: "- Later" },
    ],
  },
  {
    name: "ordered list siblings",
    body: `3. Earlier long item\r\n4. Watch ${video} now\r\n5. Later item FINISH`,
    ancestor: "li",
    structures: [
      { selector: "ol", source: "3. Earlier", immediate: true },
      { selector: "li", source: "3. Earlier" },
      { selector: "li", source: "4. Watch", immediate: true },
      { selector: "li", source: "5. Later" },
    ],
  },
  {
    name: "a table with untyped header and row siblings",
    body: `| Name | Value |\n| --- | --- |\n| Earlier | Long item |\n| Watch | ${video} |\n| Later | FINISH |`,
    ancestor: "tr",
    structures: [
      { selector: "table", source: "| Name", immediate: true },
      { selector: "thead", source: "| Name" },
      { selector: "tbody", source: "| Earlier", immediate: true },
      { selector: "tr", source: "| Name" },
      { selector: "tr", source: "| Earlier" },
      { selector: "tr", source: "| Watch", immediate: true },
      { selector: "tr", source: "| Later" },
    ],
  },
  {
    name: "native preformatted HTML",
    body: `<pre lang="html">Before ${video} After FINISH</pre>`,
    ancestor: "pre",
    html: true,
    structures: [{ selector: "pre", source: "<pre", immediate: true }],
  },
  {
    name: "native HTML list siblings",
    body: `<aside><ul><li>${video}</li><li>Received HTML FINISH</li></ul></aside>`,
    ancestor: "li",
    html: true,
    structures: [
      { selector: "aside", source: "<aside", immediate: true },
      { selector: "ul", source: "<ul", immediate: true },
      { selector: "li", source: "<li>", immediate: true },
      { selector: "li", source: "<li>Received", immediate: true },
    ],
  },
  {
    name: "indented native HTML before CRLF Markdown",
    body: `  <aside>${video} Received HTML FINISH</aside>`,
    ancestor: "aside",
    html: true,
    crlf: true,
    structures: [{ selector: "aside", source: "<aside", immediate: true }],
  },
];
const variants = [
  { enabled: true, pacing: "fixed" as const },
  { enabled: true, pacing: "content-aware" as const },
  { enabled: false, pacing: "fixed" as const },
  { enabled: false, pacing: "content-aware" as const },
];
const sandbox = "<div>Received card</div>";
const appended = "\n\n## Appended heading FINISH\n\n" + sandbox;

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const assertStructures = (
  container: HTMLElement,
  structures: readonly Structure[],
  source: string,
  budget: number,
  pacedStart: (offset: number) => number,
  enabled: boolean
) => {
  for (const selector of new Set(structures.map((entry) => entry.selector))) {
    const expected = structures.filter(
      (entry) =>
        entry.selector === selector &&
        (!enabled ||
          entry.immediate ||
          budget > pacedStart(source.indexOf(entry.source)))
    ).length;
    expect(container.querySelectorAll(selector)).toHaveLength(expected);
  }
};

describe.each(variants)(
  "received Markdown structure visibility (typing=$enabled, pacing=$pacing)",
  ({ enabled, pacing }) => {
    it.each(laterBlocks)(
      "paces $name from its first raw source unit",
      ({ body, structures }) => {
        const introduction = "Introduction keeps typing before the next block";
        const lead = `\n\n${introduction}\n\n`;
        const initial = video + lead + body;
        const bodyStart = lead.length;
        const onState = vi.fn();
        const fixture = (content: string) => (
          <ContentRender
            content={content}
            enableTypewriter={enabled}
            typewriterPacing={pacing}
            typingSpeed={30}
            onTypewriterStateChange={onState}
          />
        );
        const { container, rerender } = render(fixture(initial));
        const frame = container.querySelector<HTMLIFrameElement>("iframe")!;
        const parent = frame.parentNode;
        const frameWindow = frame.contentWindow as Window & {
          structureSentinel?: string;
        };
        frameWindow.structureSentinel = "playing";
        let content = initial;
        let htmlLength = 0;
        let observedFirstUnit = false;
        const check = () => {
          expect(container.querySelector("iframe")).toBe(frame);
          expect(frame.parentNode).toBe(parent);
          expect(frame.contentWindow).toBe(frameWindow);
          expect(frameWindow.structureSentinel).toBe("playing");
          const budget =
            onState.mock.lastCall![0].renderedLength -
            video.length -
            (container.querySelector('[data-testid="sandbox"]')
              ? htmlLength
              : 0);
          assertStructures(
            container,
            structures,
            content,
            budget,
            (offset) => offset - video.length,
            enabled
          );
          if (budget === bodyStart + 1) observedFirstUnit = true;
          if (enabled && budget < bodyStart + body.indexOf("FINISH"))
            expect(container.textContent).not.toContain("FINISH");
          if (body.startsWith("~~~")) {
            const started = !enabled || budget > bodyStart;
            expect(container.querySelectorAll(".copy-button")).toHaveLength(
              started ? 1 : 0
            );
            expect(
              container.querySelector(".language-name")?.textContent ?? ""
            ).toBe(started ? "javascript" : "");
          }
          expect(container.querySelectorAll("h2")).toHaveLength(
            content !== initial &&
              (!enabled || budget > initial.length - video.length + 2)
              ? 1
              : 0
          );
        };
        check();
        if (enabled) {
          act(() => vi.advanceTimersByTime(30));
          check();
        }
        content += appended;
        htmlLength = sandbox.length;
        rerender(fixture(content));
        expect(
          Boolean(container.querySelector('[data-testid="sandbox"]'))
        ).toBe(!enabled);
        check();
        for (
          let tick = 0;
          !onState.mock.lastCall?.[0].isComplete && tick < content.length * 2;
          tick++
        ) {
          act(() => vi.advanceTimersByTime(30));
          check();
        }
        expect(onState).toHaveBeenLastCalledWith(
          expect.objectContaining({
            isComplete: true,
            renderedLength: content.length,
            totalLength: content.length,
          })
        );
        expect(container.textContent).toContain("FINISH");
        if (enabled && pacing === "fixed") expect(observedFirstUnit).toBe(true);
      }
    );

    it.each(mediaBlocks)(
      "retains video ancestors after preceding prose with $name",
      ({ body, structures, ancestor, ...example }) => {
        const onState = vi.fn();
        const fixture = (content: string) => (
          <ContentRender
            content={content}
            enableTypewriter={enabled}
            typewriterPacing={pacing}
            typingSpeed={30}
            onTypewriterStateChange={onState}
          />
        );
        const { container, rerender } = render(fixture(body));
        if (enabled && !container.querySelector("iframe")) {
          expect(container.querySelector("iframe")).toBeNull();
          for (
            let tick = 0;
            !container.querySelector("iframe") && tick < body.length * 2;
            tick += 1
          ) {
            act(() => vi.advanceTimersByTime(30));
          }
        }
        const frame = container.querySelector<HTMLIFrameElement>("iframe")!;
        expect(frame).not.toBeNull();
        const parent = frame.parentNode;
        const context = frame.closest(ancestor);
        expect(context).not.toBeNull();
        const frameWindow = frame.contentWindow as Window & {
          structureSentinel?: string;
        };
        frameWindow.structureSentinel = "playing";
        const immediateStart = example.html
          ? body.indexOf("<")
          : body.indexOf(video);
        const immediateLength = example.html
          ? body.length - immediateStart
          : video.length;
        const pacedStart = (offset: number) =>
          offset -
          Math.max(0, Math.min(immediateLength, offset - immediateStart));
        let content = body;
        let htmlLength = 0;
        const check = () => {
          expect(container.querySelector("iframe")).toBe(frame);
          expect(container.querySelectorAll("iframe")).toHaveLength(1);
          expect(frame.parentNode).toBe(parent);
          expect(frame.closest(ancestor)).toBe(context);
          expect(frame.contentWindow).toBe(frameWindow);
          expect(frameWindow.structureSentinel).toBe("playing");
          const budget =
            onState.mock.lastCall![0].renderedLength -
            immediateLength -
            (container.querySelector('[data-testid="sandbox"]')
              ? htmlLength
              : 0);
          assertStructures(
            container,
            structures,
            content,
            budget,
            pacedStart,
            enabled
          );
          expect(container.querySelectorAll("h2")).toHaveLength(
            content !== body &&
              (!enabled || budget > pacedStart(content.indexOf("## Appended")))
              ? 1
              : 0
          );
        };
        check();
        content += example.crlf ? appended.replace(/\n/g, "\r\n") : appended;
        htmlLength = sandbox.length;
        rerender(fixture(content));
        check();
        for (
          let tick = 0;
          !onState.mock.lastCall?.[0].isComplete && tick < content.length * 2;
          tick++
        ) {
          act(() => vi.advanceTimersByTime(30));
          check();
        }
        expect(onState).toHaveBeenLastCalledWith(
          expect.objectContaining({
            isComplete: true,
            renderedLength: content.length,
            totalLength: content.length,
          })
        );
      }
    );
  }
);
