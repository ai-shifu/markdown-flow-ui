// @vitest-environment jsdom
import React from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ContentRender, { type ContentRenderProps } from "./ContentRender";

vi.mock("mermaid", () => ({ default: {} }));
vi.mock("./plugins/CustomVariable", () => ({ default: () => null }));
vi.mock("./plugins/MermaidChart", () => ({
  default: ({ chart }: { chart: string }) => (
    <div data-testid="mermaid-chart" data-chart={chart} />
  ),
}));
vi.mock("./IframeSandbox", () => ({
  default: ({ content }: { content: string }) => (
    <div data-testid="iframe-sandbox" data-content={content} />
  ),
}));

type BarProps = React.ComponentProps<
  NonNullable<ContentRenderProps["customRenderBar"]>
>;

const finishTyping = (content: string, onState: ReturnType<typeof vi.fn>) => {
  for (
    let tick = 0;
    !onState.mock.lastCall?.[0].isComplete && tick < content.length + 10;
    tick += 1
  ) {
    act(() => {
      vi.advanceTimersByTime(30);
    });
  }
  expect(onState).toHaveBeenLastCalledWith(
    expect.objectContaining({
      isComplete: true,
      renderedLength: content.length,
      totalLength: content.length,
    })
  );
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe.each([false, true])(
  "ContentRender wrapped payloads (typewriter=%s)",
  (enableTypewriter) => {
    it("unwraps complete HTML without changing the original content callback", () => {
      const html = "<div data-wrapped-card>First\\nSecond</div>";
      const content = `"${html}"`;
      const onState = vi.fn();
      const CustomBar = vi.fn((_props: BarProps) => null);
      const { container } = render(
        <ContentRender
          content={content}
          enableTypewriter={enableTypewriter}
          typingSpeed={30}
          customRenderBar={CustomBar}
          onTypewriterStateChange={onState}
        />
      );

      finishTyping(content, onState);
      const sandboxes = container.querySelectorAll<HTMLElement>(
        '[data-testid="iframe-sandbox"]'
      );
      expect(sandboxes).toHaveLength(1);
      expect(sandboxes[0].getAttribute("data-content")).toBe(html);
      expect(container.querySelector(".content-render")?.textContent).toBe("");
      expect(CustomBar.mock.lastCall?.[0].content).toBe(content);
      expect(CustomBar.mock.lastCall?.[0].displayContent).toBe(html);
    });

    it("keeps received HTML progressive before a wrapped payload completes", () => {
      const chunks = [
        "<div data-wrapped-card>First",
        "<div data-wrapped-card>First and second",
        "<div data-wrapped-card>First and second</div>",
      ];
      const onState = vi.fn();
      const fixture = (content: string) => (
        <ContentRender
          content={content}
          enableTypewriter={enableTypewriter}
          typingSpeed={30}
          onTypewriterStateChange={onState}
        />
      );
      const { container, rerender } = render(fixture(`"${chunks[0]}`));
      const sandbox = container.querySelector('[data-testid="iframe-sandbox"]');
      expect(sandbox?.getAttribute("data-content")).toBe(chunks[0]);

      for (const chunk of chunks.slice(1)) {
        rerender(fixture(`"${chunk}`));
        expect(container.querySelector('[data-testid="iframe-sandbox"]')).toBe(
          sandbox
        );
        expect(sandbox?.getAttribute("data-content")).toBe(chunk);
      }

      const completeContent = `"${chunks[2]}"`;
      rerender(fixture(completeContent));
      finishTyping(completeContent, onState);
      const completedSandbox = container.querySelector(
        '[data-testid="iframe-sandbox"]'
      );
      expect(completedSandbox).toBe(sandbox);
      expect(completedSandbox?.getAttribute("data-content")).toBe(chunks[2]);
      expect(container.querySelector(".content-render")?.textContent).toBe("");
    });

    it("preserves ordinary literal quotes around prose", () => {
      const content = '"Ordinary quoted words"';
      const onState = vi.fn();
      const CustomBar = vi.fn((_props: BarProps) => null);
      const { container } = render(
        <ContentRender
          content={content}
          enableTypewriter={enableTypewriter}
          typingSpeed={30}
          customRenderBar={CustomBar}
          onTypewriterStateChange={onState}
        />
      );

      finishTyping(content, onState);
      expect(container.querySelector(".content-render")?.textContent).toBe(
        content
      );
      expect(
        container.querySelector('[data-testid="iframe-sandbox"]')
      ).toBeNull();
      expect(CustomBar.mock.lastCall?.[0].content).toBe(content);
      expect(CustomBar.mock.lastCall?.[0].displayContent).toBe(content);
    });

    it("preserves literal quotes around standalone Mermaid content", () => {
      const chart = "graph TD; A-->B";
      const content = `"\n\`\`\`mermaid\n${chart}\n\`\`\`\n"`;
      const onState = vi.fn();
      const CustomBar = vi.fn((_props: BarProps) => null);
      const { container } = render(
        <ContentRender
          content={content}
          enableTypewriter={enableTypewriter}
          typingSpeed={30}
          customRenderBar={CustomBar}
          onTypewriterStateChange={onState}
        />
      );

      finishTyping(content, onState);
      expect(container.querySelector(".content-render")?.textContent).toBe(
        '""'
      );
      expect(
        container
          .querySelector('[data-testid="mermaid-chart"]')
          ?.getAttribute("data-chart")
      ).toBe(chart);
      expect(
        container.querySelector('[data-testid="iframe-sandbox"]')
      ).toBeNull();
      expect(CustomBar.mock.lastCall?.[0].content).toBe(content);
      expect(CustomBar.mock.lastCall?.[0].displayContent).toBe(content);
    });

    it("unwraps Mermaid and HTML while keeping only the essential nearby lines", () => {
      const chart = "graph TD; A-->B";
      const html = "<div data-wrapped-card>HTML</div>";
      const fence = `\`\`\`mermaid\n${chart}\n\`\`\``;
      const content = `"First line\nDiscard before\n${fence}\n${html}\nDiscard after"`;
      const onState = vi.fn();
      const CustomBar = vi.fn((_props: BarProps) => null);
      const { container } = render(
        <ContentRender
          content={content}
          enableTypewriter={enableTypewriter}
          typingSpeed={30}
          customRenderBar={CustomBar}
          onTypewriterStateChange={onState}
        />
      );

      finishTyping(content, onState);
      const charts = container.querySelectorAll(
        '[data-testid="mermaid-chart"]'
      );
      expect(charts).toHaveLength(1);
      expect(charts[0].getAttribute("data-chart")).toBe(chart);
      expect(
        container
          .querySelector('[data-testid="iframe-sandbox"]')
          ?.getAttribute("data-content")
      ).toBe(html);
      expect(container.querySelector(".content-render")?.textContent).toBe(
        "First line"
      );
      expect(CustomBar.mock.lastCall?.[0].content).toBe(content);
      expect(CustomBar.mock.lastCall?.[0].displayContent).toBe(
        `First line\n${fence}\n${html}`
      );
    });
  }
);
