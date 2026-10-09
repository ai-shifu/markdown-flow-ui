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

const before = "甲乙丙丁\n\n";
const after = "\n\n戊己";
const compact = (value: string | null | undefined) =>
  (value ?? "").replace(/\s/g, "");
const proseText = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("p"))
    .filter((paragraph) => !paragraph.closest("details, aside"))
    .map((paragraph) => compact(paragraph.textContent))
    .join("");
const expectNative = (container: HTMLElement) => {
  expect(container.querySelector("iframe")).toBeNull();
  expect(container.querySelector('[data-testid="iframe-sandbox"]')).toBeNull();
};
const tick = () => act(() => vi.advanceTimersByTime(30));

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe.each([true, false])(
  "ContentRender progressive native HTML (typewriter=%s)",
  (enableTypewriter) => {
    const fixture = (content: string, onState = vi.fn()) => (
      <ContentRender
        content={content}
        enableTypewriter={enableTypewriter}
        typewriterPacing="content-aware"
        typingSpeed={30}
        lang="en"
        dir="ltr"
        onTypewriterStateChange={onState}
      />
    );

    it.each([
      {
        name: "details with a summary",
        selector: "details",
        opening:
          '<details class="native-card" lang="fr" dir="rtl" open><summary class="native-summary">Title</summary>First',
        closing: "</details>",
        initialText: "TitleFirst",
      },
      {
        name: "aside",
        selector: "aside",
        opening: '<aside class="native-card" lang="fr" dir="rtl">First',
        closing: "</aside>",
        initialText: "First",
      },
    ])(
      "shows unfinished $name immediately while pacing only surrounding prose",
      ({ selector, opening, closing, initialText }) => {
        const onState = vi.fn();
        const { container, rerender } = render(
          fixture(before + opening, onState)
        );
        const native = container.querySelector(selector);
        expect(native).not.toBeNull();
        const summary = native!.querySelector("summary");
        const expectStable = () => {
          expectNative(container);
          expect(container.querySelector(selector)).toBe(native);
          expect(native!.getAttribute("class")).toBe("native-card");
          expect(native!.getAttribute("lang")).toBe("fr");
          expect(native!.getAttribute("dir")).toBe("rtl");
          expect(
            container.querySelector(".content-render")?.getAttribute("lang")
          ).toBe("en");
          expect(
            container.querySelector(".content-render")?.getAttribute("dir")
          ).toBe("ltr");
          if (summary) {
            expect(native!.querySelector("summary")).toBe(summary);
            expect(summary.getAttribute("class")).toBe("native-summary");
            expect(native!.hasAttribute("open")).toBe(true);
          }
        };
        expectStable();
        expect(compact(native!.textContent)).toBe(initialText);
        expect(proseText(container)).toBe(enableTypewriter ? "" : "甲乙丙丁");

        tick();
        expectStable();
        expect(proseText(container)).toBe(
          enableTypewriter ? "甲乙" : "甲乙丙丁"
        );
        expect(onState).toHaveBeenLastCalledWith(
          expect.objectContaining({
            renderedLength:
              opening.length + (enableTypewriter ? 2 : before.length),
          })
        );

        const progressive = `${opening}<span class="native-addition"> second</span>`;
        rerender(fixture(before + progressive, onState));
        expectStable();
        expect(compact(native!.textContent)).toBe(`${initialText}second`);
        expect(proseText(container)).toBe(
          enableTypewriter ? "甲乙" : "甲乙丙丁"
        );

        const finalContent = before + progressive + closing + after;
        rerender(fixture(finalContent, onState));
        expectStable();
        expect(compact(native!.textContent)).toBe(`${initialText}second`);
        expect(proseText(container)).toBe(
          enableTypewriter ? "甲乙" : "甲乙丙丁戊己"
        );
        for (
          let index = 0;
          !onState.mock.lastCall?.[0].isComplete && index < 20;
          index += 1
        ) {
          tick();
          expectStable();
        }
        expect(proseText(container)).toBe("甲乙丙丁戊己");
        expect(onState).toHaveBeenLastCalledWith(
          expect.objectContaining({
            isComplete: true,
            renderedLength: finalContent.length,
            totalLength: finalContent.length,
          })
        );
      }
    );

    it("hides a quoted partial native header until the opening tag is complete", () => {
      const pending = '<details class="native-card >';
      const { container, rerender } = render(fixture(before + pending));
      expectNative(container);
      expect(container.querySelector("details")).toBeNull();
      expect(
        compact(container.querySelector(".content-render")?.textContent)
      ).toBe(enableTypewriter ? "" : "甲乙丙丁");
      tick();
      expect(proseText(container)).toBe(enableTypewriter ? "甲乙" : "甲乙丙丁");

      const opening = `${pending} quoted" lang="fr" dir="rtl"><summary>Title</summary>First`;
      rerender(fixture(before + opening));
      const details = container.querySelector("details");
      expect(details).not.toBeNull();
      expectNative(container);
      expect(compact(details!.textContent)).toBe("TitleFirst");
      expect(details!.getAttribute("class")).toBe("native-card > quoted");
      expect(details!.getAttribute("lang")).toBe("fr");
      expect(details!.getAttribute("dir")).toBe("rtl");
      expect(proseText(container)).toBe(enableTypewriter ? "甲乙" : "甲乙丙丁");

      rerender(fixture(before + opening + " second</details>" + after));
      expect(container.querySelector("details")).toBe(details);
      expect(compact(details!.textContent)).toBe("TitleFirstsecond");
      expectNative(container);
    });

    it("keeps authored preformatted HTML in the existing CodeBlock component", () => {
      const opening =
        '<pre class="native-code" lang="fr" dir="rtl"><code>first &lt;tag&gt;';
      const onState = vi.fn();
      const { container, rerender } = render(
        fixture(before + opening, onState)
      );
      const pre = container.querySelector("pre");
      const code = pre?.querySelector("code");
      const codeBlock = pre?.closest(".code-block-container");
      expect(pre).not.toBeNull();
      expect(code).not.toBeNull();
      expect(codeBlock).not.toBeNull();
      const expectStable = () => {
        expectNative(container);
        expect(container.querySelector("pre")).toBe(pre);
        expect(pre!.querySelector("code")).toBe(code);
        expect(pre!.closest(".code-block-container")).toBe(codeBlock);
        expect(container.querySelectorAll(".copy-button")).toHaveLength(1);
        expect(pre!.getAttribute("class")).toBe("native-code");
        expect(pre!.getAttribute("lang")).toBe("fr");
        expect(pre!.getAttribute("dir")).toBe("rtl");
        expect(code!.getAttribute("dir")).toBeNull();
      };
      expectStable();
      expect(code!.textContent).toBe("first <tag>");
      expect(proseText(container)).toBe(enableTypewriter ? "" : "甲乙丙丁");
      tick();
      expectStable();
      expect(proseText(container)).toBe(enableTypewriter ? "甲乙" : "甲乙丙丁");

      const finalContent = before + opening + " second</code></pre>" + after;
      rerender(fixture(finalContent, onState));
      expectStable();
      expect(code!.textContent).toBe("first <tag> second");
      expect(proseText(container)).toBe(
        enableTypewriter ? "甲乙" : "甲乙丙丁戊己"
      );
      for (
        let index = 0;
        !onState.mock.lastCall?.[0].isComplete && index < 20;
        index += 1
      ) {
        tick();
        expectStable();
      }
      expect(proseText(container)).toBe("甲乙丙丁戊己");
      expect(onState).toHaveBeenLastCalledWith(
        expect.objectContaining({ isComplete: true })
      );
    });

    it("retains an earlier native video when an adjacent native root requires sandbox fallback", () => {
      const nativeSource = '<aside><iframe data-tag="video"></iframe></aside>';
      const fallbackSource =
        "<details><script>window.widget=true;</script></details>";
      const { container, rerender } = render(fixture(nativeSource));
      const aside = container.querySelector("aside");
      const video = aside?.querySelector<HTMLIFrameElement>("iframe");
      expect(aside).not.toBeNull();
      expect(video).not.toBeNull();
      const parent = video!.parentNode;
      const videoWindow = video!.contentWindow as Window & {
        retainedState?: string;
      };
      videoWindow.retainedState = "playing";

      rerender(fixture(nativeSource + fallbackSource));
      const expectStable = () => {
        expect(container.querySelector("aside")).toBe(aside);
        expect(container.querySelector('iframe[data-tag="video"]')).toBe(video);
        expect(video!.parentNode).toBe(parent);
        expect(video!.contentWindow).toBe(videoWindow);
        expect(videoWindow.retainedState).toBe("playing");
        expect(
          container.querySelectorAll('[data-testid="iframe-sandbox"]')
        ).toHaveLength(1);
        expect(
          container
            .querySelector('[data-testid="iframe-sandbox"]')
            ?.getAttribute("data-content")
        ).toBe(fallbackSource);
        expect(container.querySelector("script")).toBeNull();
      };
      expectStable();
      tick();
      expectStable();
    });

    it("retains a native video while a second iframe header is pending in the same root", () => {
      const firstSource = '<aside><iframe data-tag="video"></iframe>';
      const { container, rerender } = render(fixture(firstSource));
      const aside = container.querySelector("aside");
      const video = aside?.querySelector<HTMLIFrameElement>("iframe");
      expect(aside).not.toBeNull();
      expect(video).not.toBeNull();
      const parent = video!.parentNode;
      const videoWindow = video!.contentWindow as Window & {
        retainedState?: string;
      };
      videoWindow.retainedState = "playing";
      const expectStable = (count: number) => {
        expect(
          container.querySelector('[data-testid="iframe-sandbox"]')
        ).toBeNull();
        expect(container.querySelector("aside")).toBe(aside);
        expect(aside!.querySelectorAll("iframe")).toHaveLength(count);
        expect(aside!.querySelector("iframe")).toBe(video);
        expect(video!.parentNode).toBe(parent);
        expect(video!.contentWindow).toBe(videoWindow);
        expect(videoWindow.retainedState).toBe("playing");
        expect(compact(aside!.textContent)).toBe("");
      };
      expectStable(1);

      const pendingSource = `${firstSource}<iframe `;
      rerender(fixture(pendingSource));
      expectStable(1);
      tick();
      expectStable(1);

      rerender(fixture(`${pendingSource}data-tag="video"></iframe></aside>`));
      expectStable(2);
      expect(aside!.querySelectorAll('iframe[data-tag="video"]')).toHaveLength(
        2
      );
      tick();
      expectStable(2);
    });

    it("retains an earlier CodeBlock when adjacent details contains a style resource", () => {
      const nativeSource =
        '<pre class="native-code" lang="fr" dir="rtl"><code>Before</code></pre>';
      const fallbackSource =
        "<details><style>.widget { color: red; }</style>Widget</details>";
      const { container, rerender } = render(fixture(nativeSource));
      const pre = container.querySelector("pre");
      const code = pre?.querySelector("code");
      const codeBlock = pre?.closest(".code-block-container");
      expect(pre).not.toBeNull();
      expect(codeBlock).not.toBeNull();

      rerender(fixture(nativeSource + fallbackSource));
      const expectStable = () => {
        expect(container.querySelector("pre")).toBe(pre);
        expect(pre!.querySelector("code")).toBe(code);
        expect(pre!.closest(".code-block-container")).toBe(codeBlock);
        expect(pre!.textContent).toBe("Before");
        expect(pre!.getAttribute("class")).toBe("native-code");
        expect(pre!.getAttribute("lang")).toBe("fr");
        expect(pre!.getAttribute("dir")).toBe("rtl");
        expect(container.querySelectorAll(".copy-button")).toHaveLength(1);
        expect(container.querySelector("iframe")).toBeNull();
        expect(
          container.querySelectorAll('[data-testid="iframe-sandbox"]')
        ).toHaveLength(1);
        expect(
          container
            .querySelector('[data-testid="iframe-sandbox"]')
            ?.getAttribute("data-content")
        ).toBe(fallbackSource);
        expect(container.querySelector("style")).toBeNull();
      };
      expectStable();
      tick();
      expectStable();
    });
  }
);
