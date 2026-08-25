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

export const ShortContentHidesControl: Story = {
  args: {
    height: 240,
    initialContentList: [
      { content: "Short content stays within the viewport." },
    ],
  },
  play: async ({ canvasElement }) => {
    getScrollContainer(canvasElement);
    expect(
      canvasElement.querySelector('[aria-label="Scroll to bottom"]')
    ).toBeNull();
  },
};

export const LongContentScrollsToBottom: Story = {
  args: {
    height: 240,
    initialContentList: longContent,
  },
  play: async ({ canvasElement }) => {
    const scrollContainer = getScrollContainer(canvasElement);

    scrollContainer.scrollTop = 0;
    scrollContainer.dispatchEvent(new Event("scroll"));

    const button = await waitFor(() => {
      const element = canvasElement.querySelector<HTMLButtonElement>(
        '[aria-label="Scroll to bottom"]'
      );
      expect(element).not.toBeNull();
      return element as HTMLButtonElement;
    });

    expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");

    await userEvent.click(button);

    await waitFor(() => {
      expect(scrollContainer.scrollTop).toBeGreaterThanOrEqual(
        scrollContainer.scrollHeight - scrollContainer.clientHeight - 2
      );
      expect(
        canvasElement.querySelector('[aria-label="Scroll to bottom"]')
      ).toBeNull();
    });
  },
};
