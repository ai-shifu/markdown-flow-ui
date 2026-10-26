import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Sparkles } from "lucide-react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import MarkdownFlowEditor, { EditMode } from "./MarkdownFlowEditor";
import { getEditorLocaleMessages } from "./editorI18n";

const meta = {
  title: "MarkdownFlow/EditorTooltips",
  component: MarkdownFlowEditor,
  parameters: { layout: "centered" },
  args: { content: "", locale: "en-US", editMode: EditMode.QuickEdit },
} satisfies Meta<typeof MarkdownFlowEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BuiltInTooltips: Story = {
  play: async ({ canvasElement }) => {
    const toolbar = canvasElement.querySelector(
      ".markdown-flow-editor-toolbar-left"
    )!;
    const buttons = within(toolbar).getAllByRole("button");
    const texts = getEditorLocaleMessages("en-US");
    const labels = [
      texts.toolbarInsertSingleChoice,
      texts.toolbarInsertMultiChoice,
      texts.toolbarInsertInput,
      texts.toolbarInsertButton,
      texts.toolbarConfirmOutput,
      texts.toolbarInsertImage,
      texts.toolbarInsertVideo,
    ];
    const page = within(canvasElement.ownerDocument.body);

    expect(buttons).toHaveLength(labels.length);
    for (const [index, button] of buttons.entries()) {
      expect(button).toHaveAccessibleName(labels[index]);
      expect(button.closest("[title]")).toBeNull();
      await userEvent.hover(button);
      await waitFor(() => {
        expect(page.getAllByRole("tooltip")).toHaveLength(1);
        expect(page.getByRole("tooltip")).toHaveTextContent(labels[index]);
      });
      await userEvent.unhover(button);
      await waitFor(() => expect(page.queryByRole("tooltip")).toBeNull());
    }

    await userEvent.tab();
    await waitFor(() => {
      expect(buttons[0]).toHaveFocus();
      expect(page.getByRole("tooltip")).toHaveTextContent(labels[0]);
    });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("tooltip")).toBeNull());
  },
};

export const CustomActionTooltips: Story = {
  args: {
    toolbarActionsRight: [
      { key: "label", label: "Insert template" },
      {
        key: "icon",
        label: "",
        icon: <Sparkles size={14} />,
        tooltip: "Insert greeting",
      },
      {
        key: "label-and-tooltip",
        label: "Preview",
        tooltip: "Open preview",
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    expect(
      canvas.getByRole("button", { name: "Insert template" })
    ).toHaveAttribute("title", "Insert template");

    for (const [name, tooltip] of [
      ["Insert greeting", "Insert greeting"],
      ["Preview", "Open preview"],
    ]) {
      const button = canvas.getByRole("button", { name });
      expect(button.closest("[title]")).toBeNull();
      await userEvent.hover(button);
      await waitFor(() => {
        expect(page.getAllByRole("tooltip")).toHaveLength(1);
        expect(page.getByRole("tooltip")).toHaveTextContent(tooltip);
      });
      await userEvent.unhover(button);
      await waitFor(() => expect(page.queryByRole("tooltip")).toBeNull());
    }
  },
};
