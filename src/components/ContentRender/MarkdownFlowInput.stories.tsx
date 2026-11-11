import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { expect } from "storybook/test";
import { MARKDOWN_FLOW_LOCALES } from "../../lib/locale";

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
    showImageInput: {
      control: "boolean",
      description: "Opt into the image picker inside the input.",
    },
    locale: {
      control: "select",
      options: [...MARKDOWN_FLOW_LOCALES],
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
    sendShortcut: {
      control: "select",
      options: ["enter", "none"],
      description:
        "Enter sends on desktop; none leaves the keyboard return key for newlines.",
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

export const MobileNewline: Story = {
  args: {
    sendShortcut: "none",
  },
  render: (args) => (
    <InteractiveMarkdownFlowInput
      {...args}
      initialValue="Press Return to add a new line."
    />
  ),
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

export const InlineImageInput: Story = {
  args: { showImageInput: true },
  render: (args) => {
    const [value, setValue] = React.useState("");
    const [images, setImages] = React.useState<string[]>([]);
    const [submitted, setSubmitted] = React.useState("");
    return (
      <div style={{ width: 420, maxWidth: "100%" }}>
        <MarkdownFlowInput
          {...args}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          imageInput={{
            images,
            maxImages: 4,
            onSelect: (files) => {
              files.forEach((file) => {
                const reader = new FileReader();
                reader.onload = () =>
                  setImages((current) => [...current, String(reader.result)]);
                reader.readAsDataURL(file);
              });
            },
            onRemove: (index) =>
              setImages((current) => current.filter((_, i) => i !== index)),
          }}
          onSend={() =>
            setSubmitted(
              JSON.stringify({ text: value, imageCount: images.length })
            )
          }
        />
        <output data-testid="image-input-result">{submitted}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const { userEvent, within } = await import("storybook/test");
    const canvas = within(canvasElement);
    const input =
      canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;
    await userEvent.upload(
      input,
      new File(
        [
          Uint8Array.from(
            atob(
              "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAFElEQVR4nGNUTX7NgA0wYRUdtBIAJUMBgy4eB/0AAAAASUVORK5CYII="
            ),
            (char) => char.charCodeAt(0)
          ),
        ],
        "sample.png",
        { type: "image/png" }
      )
    );
    await canvas.findByRole("img", { name: "Attached image 1" });
    await userEvent.click(canvas.getByRole("button", { name: "Send" }));
    await expect(canvas.getByTestId("image-input-result")).toHaveTextContent(
      '"imageCount":1'
    );
  },
};

export const UploadingImages: Story = {
  args: {
    showImageInput: true,
    imageInput: { images: [], uploading: true },
  },
  render: (args) => (
    <InteractiveMarkdownFlowInput
      {...args}
      initialValue="Keep typing while your image uploads"
    />
  ),
  play: async ({ canvasElement }) => {
    const { userEvent, within } = await import("storybook/test");
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByRole("textbox"),
      " and edit your question"
    );
    await expect(canvas.getByRole("textbox")).toHaveValue(
      "Keep typing while your image uploads and edit your question"
    );
    await expect(canvas.getByRole("button", { name: "Send" })).toBeDisabled();
  },
};
