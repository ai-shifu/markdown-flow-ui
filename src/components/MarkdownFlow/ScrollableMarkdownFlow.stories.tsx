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
