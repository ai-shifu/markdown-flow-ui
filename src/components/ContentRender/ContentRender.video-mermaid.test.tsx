// @vitest-environment jsdom
import React from "react";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ContentRender, {
  type ContentRenderTypewriterState,
} from "./ContentRender";

vi.mock("mermaid", () => ({
  default: {
    initialize: vi.fn(),
    parse: vi.fn(async (chart: string) => {
      if (!chart.includes("A-->B")) throw new Error("Incomplete chart");
    }),
    render: vi.fn(async () => ({
      svg: '<svg data-complete-chart="true"></svg>',
    })),
  },
}));
vi.mock("./IframeSandbox", () => ({ default: () => null }));
vi.mock("./plugins/CustomVariable", () => ({ default: () => null }));
vi.mock("./plugins/MermaidChart", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./plugins/MermaidChart")>();
  return {
    default: (props: { chart: string; frozen?: boolean }) => (
      <>
        <span data-chart-frozen={String(props.frozen)} />
        <original.default {...props} />
      </>
    ),
  };
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
const video = '<iframe data-tag="video"></iframe>';

describe("received video tree rich content compatibility", () => {
  it.each([true, false])(
    "unfreezes a complete Mermaid chart with video=%s",
    async (withVideo) => {
      const content = `\`\`\`mermaid\ngraph TD\nA-->B\n\`\`\`${withVideo ? `\n\n${video}` : ""}`;
      const { container } = render(
        <ContentRender content={content} enableTypewriter={false} />
      );
      expect(
        container
          .querySelector("[data-chart-frozen]")
          ?.getAttribute("data-chart-frozen")
      ).toBe("false");
      await waitFor(() =>
        expect(container.querySelector("[data-complete-chart]")).not.toBeNull()
      );
    }
  );

  it.each([true, false])(
    "recovers a chart when its streamed source completes, typing=%s",
    async (enableTypewriter) => {
      const prefix = `${video}\n\n\`\`\`mermaid\ngraph TD\nA--`;
      const { container, rerender } = render(
        <ContentRender content={prefix} enableTypewriter={false} />
      );
      await waitFor(() =>
        expect(container.querySelector("[data-mermaid-error]")).not.toBeNull()
      );
      const nativeVideo = container.querySelector('iframe[data-tag="video"]');
      expect(
        container
          .querySelector("[data-chart-frozen]")
          ?.getAttribute("data-chart-frozen")
      ).toBe("true");
      let state: ContentRenderTypewriterState | undefined;
      if (enableTypewriter) vi.useFakeTimers();
      await act(async () => {
        rerender(
          <ContentRender
            content={`${prefix}>B\n\`\`\``}
            enableTypewriter={enableTypewriter}
            typingSpeed={1}
            onTypewriterStateChange={(value) => {
              state = value;
            }}
          />
        );
      });
      if (enableTypewriter) {
        for (let tick = 0; tick < 100 && !state?.isComplete; tick += 1)
          await act(async () => {
            vi.advanceTimersByTime(5);
          });
        expect(state?.isComplete).toBe(true);
      }
      await act(async () => {});
      expect(container.querySelector("[data-mermaid-error]")).toBeNull();
      expect(container.querySelector("[data-complete-chart]")).not.toBeNull();
      expect(container.querySelector('iframe[data-tag="video"]')).toBe(
        nativeVideo
      );
      expect(
        container
          .querySelector("[data-chart-frozen]")
          ?.getAttribute("data-chart-frozen")
      ).toBe("false");
    }
  );

  it.each([true, false])(
    "keeps an unfinished SVG header out of prose, typing=%s",
    async (enableTypewriter) => {
      vi.useFakeTimers();
      const prefix = `${video}\n\n<svg width="100`;
      let state: ContentRenderTypewriterState | undefined;
      const props = {
        enableTypewriter,
        typingSpeed: 1,
        onTypewriterStateChange: (value: ContentRenderTypewriterState) => {
          state = value;
        },
      };
      const { container, rerender } = render(
        <ContentRender content={prefix} {...props} />
      );
      const nativeVideo = container.querySelector('iframe[data-tag="video"]');
      for (let tick = 0; tick < 100 && !state?.isComplete; tick += 1)
        await act(async () => {
          vi.advanceTimersByTime(5);
        });
      expect(state?.isComplete).toBe(true);
      expect(container.textContent).not.toContain("<svg");
      expect(container.querySelector(".content-render-svg")).not.toBeNull();
      await act(async () => {
        rerender(
          <ContentRender
            content={`${prefix}"><text>Chart</text></svg>`}
            {...props}
          />
        );
      });
      for (let tick = 0; tick < 100 && !state?.isComplete; tick += 1)
        await act(async () => {
          vi.advanceTimersByTime(5);
        });
      expect(container.querySelector('iframe[data-tag="video"]')).toBe(
        nativeVideo
      );
      expect(
        container.querySelector(".content-render-svg")?.shadowRoot?.textContent
      ).toContain("Chart");
      expect(container.textContent).not.toContain("<svg");
    }
  );
});
