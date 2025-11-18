import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";

import MarkdownFlowInput from "./MarkdownFlowInput";

const meta = {
  title: "MarkdownFlow/MarkdownFlowInput",
  component: MarkdownFlowInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    placeholder: {
      control: "text",
      description: "Textarea placeholder text",
    },
    disabled: {
      control: "boolean",
      description: "Disable input and send button",
    },
    sendButtonDisabled: {
      control: "boolean",
      description: "Disable only the send button while keeping input editable",
    },
  },
  args: {
    placeholder: "Ask a follow-up question...",
  },
} satisfies Meta<typeof MarkdownFlowInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState("Hello Shifu");

    return (
      <div style={{ width: 420 }}>
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
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "Disabled state",
  },
};
