import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import ScrollableMarkdownFlow from "./ScrollableMarkdownFlow";

const longContent = Array.from({ length: 18 }, (_, index) => ({
  content: `## Section ${index + 1}\n\nThis content is deliberately long enough to exercise the scroll-to-bottom control in a constrained viewport.`,
}));

const meta = {
  title: "MarkdownFlow/ScrollableMarkdownFlow",
  component: ScrollableMarkdownFlow,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ScrollableMarkdownFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

const getScrollContainer = (canvasElement: HTMLElement) => {
  const element = canvasElement.querySelector<HTMLElement>(
    ".scrollable-markdown-container > div"
  );
  expect(element).not.toBeNull();
  return element as HTMLElement;
};

const getScrollButton = (canvasElement: HTMLElement) => {
  const button = canvasElement.querySelector<HTMLButtonElement>(
    '[aria-label="Scroll to bottom"]'
  );
  expect(button).not.toBeNull();
  return button as HTMLButtonElement;
};

export const ShortContentHidesControl: Story = {
  args: {
    height: 240,
    initialContentList: [
      { content: "Short content stays within the viewport." },
    ],
  },
  play: async ({ canvasElement }) => {
    getScrollContainer(canvasElement);
    const button = getScrollButton(canvasElement);
    await waitFor(() => {
      expect(button).toHaveAttribute("data-visible", "false");
      expect(button).toHaveAttribute("aria-hidden", "true");
    });
  },
};

export const LongContentScrollsToBottom: Story = {
  args: {
    height: 240,
    initialContentList: longContent,
  },
  play: async ({ canvasElement }) => {
    const scrollContainer = getScrollContainer(canvasElement);
    const button = getScrollButton(canvasElement);

    scrollContainer.scrollTop = 0;
    scrollContainer.dispatchEvent(new Event("scroll"));

    await waitFor(() => {
      expect(button).toHaveAttribute("data-visible", "true");
    });

    expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(button).toHaveAttribute("data-placement", "bottom-center");
    expect(getComputedStyle(button).bottom).toBe("20px");
    const containerBounds =
      scrollContainer.parentElement!.getBoundingClientRect();
    const buttonBounds = button.getBoundingClientRect();
    expect(
      Math.abs(
        buttonBounds.left +
          buttonBounds.width / 2 -
          (containerBounds.left + containerBounds.width / 2)
      )
    ).toBeLessThan(1);

    await userEvent.click(button);

    await waitFor(() => {
      expect(scrollContainer.scrollTop).toBeGreaterThanOrEqual(
        scrollContainer.scrollHeight - scrollContainer.clientHeight - 2
      );
      expect(button).toHaveAttribute("data-visible", "false");
    });
  },
};

export const CodeAndMathKeepRendererStyles: Story = {
  args: {
    height: 320,
    initialContentList: [
      {
        content:
          "```python\ndef answer():\n    return 42\n```\n\n$$\nx^2 + y^2 = z^2\n$$",
      },
    ],
  },
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const keyword = canvasElement.querySelector<HTMLElement>(".hljs-keyword");
      const math = canvasElement.querySelector<HTMLElement>(".katex");
      if (!keyword || !math) throw new Error("Code and math must render");
      expect(getComputedStyle(keyword).color).toBe("rgb(215, 58, 73)");
      expect(getComputedStyle(math).fontFamily).toContain("KaTeX_Main");
    });
  },
};

export const EmbeddedFlowDoesNotMoveOuterPage: Story = {
  args: { height: 240, initialContentList: longContent },
  render: (args) => (
    <div
      data-testid="outer-scroller"
      style={{ height: 300, overflowY: "auto" }}
    >
      <div style={{ height: 800 }}>Content before the embedded flow</div>
      <ScrollableMarkdownFlow {...args} />
      <div style={{ height: 800 }}>Content after the embedded flow</div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const outer = canvasElement.querySelector<HTMLElement>(
      '[data-testid="outer-scroller"]'
    )!;
    const viewport = getScrollContainer(canvasElement);
    const button = getScrollButton(canvasElement);
    const expectLocalBottom = () => {
      expect(viewport.scrollTop).toBeGreaterThanOrEqual(
        viewport.scrollHeight - viewport.clientHeight - 2
      );
    };
    await waitFor(expectLocalBottom);
    expect(outer.scrollTop).toBe(0);
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

    const growth = document.createElement("div");
    growth.style.height = "400px";
    viewport.firstElementChild!.appendChild(growth);
    await waitFor(expectLocalBottom);
    expect(outer.scrollTop).toBe(0);

    outer.scrollTop = 800;
    viewport.scrollTop = 0;
    viewport.dispatchEvent(new Event("scroll"));
    await waitFor(() => expect(button).toHaveAttribute("data-visible", "true"));
    await userEvent.click(button);
    await waitFor(expectLocalBottom);
    expect(outer.scrollTop).toBe(800);
  },
};
