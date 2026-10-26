import { useEffect, useRef } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { Sparkles } from "lucide-react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import MarkdownFlowEditor, { EditMode } from "./MarkdownFlowEditor";
import { getEditorLocaleMessages } from "./editorI18n";
import createFixedTextPlaceholder from "./plugins/FixedTextPlaceholder";

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

export const FixedOutputPlaceholderTooltips: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Exercises the legacy fixed output extension directly. The main editor currently leaves this extension disabled.",
      },
    },
  },
  render: () => {
    const container = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const texts = getEditorLocaleMessages("en-US");
      const view = new EditorView({
        state: EditorState.create({
          doc: "======\n===Fixed output===",
          extensions: [
            createFixedTextPlaceholder(
              texts.fixedTextPlaceholder,
              texts.fixedTextTooltip
            ),
          ],
        }),
        parent: container.current!,
      });
      return () => view.destroy();
    }, []);
    return <div ref={container} />;
  },
  play: async ({ canvasElement }) => {
    const tooltip = getEditorLocaleMessages("en-US").fixedTextTooltip;
    await waitFor(() =>
      expect(canvasElement.querySelectorAll("[data-tooltip]")).toHaveLength(2)
    );
    const tags = canvasElement.querySelectorAll<HTMLElement>("[data-tooltip]");
    for (const tag of tags) {
      expect(tag.closest("[title]")).toBeNull();
      expect(tag).toHaveAttribute("data-tooltip", tooltip);
      await userEvent.hover(tag);
      expect(tag).not.toHaveAttribute("title");
      await userEvent.unhover(tag);
    }
  },
};
