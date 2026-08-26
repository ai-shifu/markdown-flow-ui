import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { expect } from "storybook/test";

import MarkdownFlowInput from "./MarkdownFlowInput";
import "./contentRender.css";

const meta = {
  title: "MarkdownFlow/MarkdownFlowInput",
  component: MarkdownFlowInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    locale: {
      control: "select",
      options: ["en-US", "fr-FR", "zh-CN", "ar-SA", "th-TH"],
      description: "Locale for the send button accessibility text",
    },
    placeholder: {
      control: "text",
      description: "Textarea placeholder text",
    },
    disabled: {
      control: "boolean",
      description: "Disable input and send button",
    },
  },
  args: {
    placeholder: "Ask a follow-up question...",
  },
} satisfies Meta<typeof MarkdownFlowInput>;

export default meta;
type Story = StoryObj<typeof meta>;

type InteractiveMarkdownFlowInputProps = React.ComponentProps<
  typeof MarkdownFlowInput
> & {
  initialValue: string;
  width?: React.CSSProperties["width"];
};

const InteractiveMarkdownFlowInput = ({
  initialValue,
  width = 420,
  ...args
}: InteractiveMarkdownFlowInputProps) => {
  const [value, setValue] = React.useState(initialValue);

  return (
    <div
      className="custom-variable-container"
      style={{ width, maxWidth: "100%" }}
    >
      <MarkdownFlowInput
        {...args}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onSend={() => {
          console.log("Send clicked with value:", value);
          setValue("");
        }}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args) => (
    <InteractiveMarkdownFlowInput {...args} initialValue="Hello Shifu" />
  ),
};

export const WideContainer: Story = {
  args: {
    className: "w-full max-w-none",
  },
  parameters: {
    layout: "padded",
  },
  render: (args) => (
    <InteractiveMarkdownFlowInput
      {...args}
      initialValue="The input fills the available width"
      width={750}
    />
  ),
  play: async ({ canvasElement }) => {
    const wrapper = canvasElement.querySelector(
      ".custom-variable-container"
    ) as HTMLElement | null;
    const group = canvasElement.querySelector(
      "[data-slot='input-group']"
    ) as HTMLElement | null;
    const control = canvasElement.querySelector(
      "[data-slot='input-group-control']"
    ) as HTMLElement | null;
    const button = canvasElement.querySelector(
      "button[data-size='icon-sm']"
    ) as HTMLElement | null;

    expect(wrapper).not.toBeNull();
    expect(group).not.toBeNull();
    expect(control).not.toBeNull();
    expect(button).not.toBeNull();

    const wrapperRect = (wrapper as HTMLElement).getBoundingClientRect();
    const groupRect = (group as HTMLElement).getBoundingClientRect();
    const controlRect = (control as HTMLElement).getBoundingClientRect();
    const buttonRect = (button as HTMLElement).getBoundingClientRect();
    const controlButtonGap = buttonRect.left - controlRect.right;
    const buttonRightGap = groupRect.right - buttonRect.right;

    expect(Math.abs(groupRect.width - wrapperRect.width)).toBeLessThanOrEqual(
      1
    );
    expect(controlRect.width).toBeGreaterThan(0);
    expect(controlButtonGap).toBeGreaterThanOrEqual(0);
    expect(controlButtonGap).toBeLessThan(16);
    expect(buttonRightGap).toBeGreaterThanOrEqual(0);
    expect(buttonRightGap).toBeLessThan(16);
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "Disabled state",
  },
};

export const FrenchLocale: Story = {
  args: {
    locale: "fr-FR",
    placeholder: "Posez une question...",
  },
  render: (args) => (
    <InteractiveMarkdownFlowInput {...args} initialValue="Bonjour" />
  ),
};
