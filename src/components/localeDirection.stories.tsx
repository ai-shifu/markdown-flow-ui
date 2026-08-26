import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import type { MarkdownFlowLocale } from "../lib/locale";
import ContentRender from "./ContentRender";
import MarkdownFlowInput from "./ContentRender/MarkdownFlowInput";
import MarkdownFlow from "./MarkdownFlow/MarkdownFlow";
import MarkdownFlowEditor, {
  EditMode,
} from "./MarkdownFlowEditor/MarkdownFlowEditor";
import { getEditorLocaleMessages } from "./MarkdownFlowEditor/editorI18n";
import Slide from "./Slide/Slide";
import Player from "./Slide/Player";
import type { Element } from "./Slide/types";
import { getSlidePlayerTexts } from "./Slide/slideI18n";
import IframeSandbox from "./ContentRender/IframeSandbox";
import { getContentRenderLocaleTexts } from "./ContentRender/contentRenderI18n";

const DirectionFixture = () => {
  const [locale, setLocale] = useState<MarkdownFlowLocale>();
  return (
    <div dir="rtl">
      <button type="button" onClick={() => setLocale("ar-SA")}>
        Arabic
      </button>
      <button type="button" onClick={() => setLocale("th-TH")}>
        Thai
      </button>
      <button type="button" onClick={() => setLocale(undefined)}>
        Inherit
      </button>
      <div data-testid="renderer">
        <ContentRender content="Direction preview" locale={locale} />
      </div>
      <div data-testid="input">
        <MarkdownFlowInput locale={locale} />
      </div>
      <div data-testid="flow">
        <MarkdownFlow locale={locale} />
      </div>
      <div data-testid="editor">
        <MarkdownFlowEditor locale={locale} />
      </div>
      <div data-testid="slide">
        <Slide elementList={[]} locale={locale} />
      </div>
      <div data-testid="player">
        <Player locale={locale} defaultPlaying={false} />
      </div>
    </div>
  );
};

const meta = {
  title: "MarkdownFlow/Locale direction",
  component: DirectionFixture,
} satisfies Meta<typeof DirectionFixture>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InheritedAndExplicitDirection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkDirection = async (dir: "rtl" | "ltr", explicit: boolean) => {
      await waitFor(() => {
        for (const name of [
          "renderer",
          "input",
          "flow",
          "editor",
          "slide",
          "player",
        ]) {
          const root = canvas.getByTestId(name).firstElementChild!;
          expect(root.getAttribute("dir")).toBe(explicit ? dir : null);
          expect(getComputedStyle(root).direction).toBe(dir);
        }
      });
    };
    await checkDirection("rtl", false);
    await userEvent.click(
      canvas.getByRole("button", { name: "Arabic", exact: true })
    );
    await checkDirection("rtl", true);
    await userEvent.click(
      canvas.getByRole("button", { name: "Thai", exact: true })
    );
    await checkDirection("ltr", true);
    await userEvent.click(
      canvas.getByRole("button", { name: "Inherit", exact: true })
    );
    await checkDirection("rtl", false);
  },
};

const PlayerDirectionFixture = () => {
  const [dir, setDir] = useState("ltr");
  return (
    <div>
      {["ltr", "rtl", "auto"].map((value) => (
        <button type="button" key={value} onClick={() => setDir(value)}>
          {value}
        </button>
      ))}
      <Player locale="ar-SA" dir={dir} defaultPlaying={false} />
    </div>
  );
};

export const PlayerDirectionOverride: Story = {
  render: () => <PlayerDirectionFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const labels = getSlidePlayerTexts("ar-SA");
    for (const dir of ["ltr", "rtl", "auto"]) {
      await userEvent.click(
        canvas.getByRole("button", { name: dir, exact: true })
      );
      expect(canvasElement.querySelector(".slide-player")).toHaveAttribute(
        "dir",
        dir
      );
      // Exercise the portal even when the story is viewed at desktop width.
      canvasElement
        .querySelector<HTMLButtonElement>(".slide-player__action--mobile-more")!
        .click();
      await waitFor(() =>
        expect(page.getByRole("dialog")).toHaveAttribute("dir", dir)
      );
      await userEvent.click(
        page.getByRole("button", { name: labels.closeSettingsLabel })
      );
      await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
    }
  },
};

const slideDirectionElements: { id: string; element: Element }[] = [
  {
    id: "markdown-slide",
    element: { type: "text", content: "Default slide content" },
  },
  {
    id: "html-slide",
    element: {
      type: "html",
      content: '<p>Default HTML content</p><p dir="rtl">Authored direction</p>',
    },
  },
  {
    id: "interaction-slide",
    element: {
      type: "interaction",
      content: "?[%{{answer}}...Answer]\n\n?[%{{choice}}First|...Other]",
      readonly: false,
    },
  },
];

const SlideContentDirectionFixture = () => {
  const [locale, setLocale] = useState<MarkdownFlowLocale>("ar-SA");
  const [dir, setDir] = useState("ltr");
  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setLocale("th-TH");
          setDir("rtl");
        }}
      >
        Thai RTL
      </button>
      {slideDirectionElements.map(({ id, element }) => (
        <div key={id} data-testid={id}>
          <Slide
            locale={locale}
            dir={dir}
            elementList={[
              {
                ...element,
                sequence_number: 1,
                is_new: true,
                is_renderable: true,
                is_marker: true,
              },
            ]}
          />
        </div>
      ))}
    </div>
  );
};

export const SlideContentDirectionOverride: Story = {
  render: () => <SlideContentDirectionFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const dir of ["ltr", "rtl"]) {
      if (dir === "rtl")
        await userEvent.click(canvas.getByRole("button", { name: "Thai RTL" }));
      await waitFor(() => {
        const markdown = canvas
          .getByTestId("markdown-slide")
          .querySelector(".content-render")!;
        expect(markdown).not.toBeNull();
        expect(getComputedStyle(markdown).direction).toBe(dir);
        const interaction = canvas
          .getByTestId("interaction-slide")
          .querySelector(".slide-player__interaction-body .content-render")!;
        expect(interaction).not.toBeNull();
        expect(getComputedStyle(interaction).direction).toBe(dir);
        const inputs = interaction.querySelectorAll("textarea");
        expect(inputs).toHaveLength(2);
        for (const input of inputs)
          expect(getComputedStyle(input).direction).toBe(dir);
        const iframe = canvas
          .getByTestId("html-slide")
          .querySelector("iframe")!;
        const paragraphs = iframe.contentDocument!.querySelectorAll("p");
        expect(paragraphs).toHaveLength(2);
        expect(
          iframe.contentWindow!.getComputedStyle(paragraphs[0]).direction
        ).toBe(dir);
        expect(
          iframe.contentWindow!.getComputedStyle(paragraphs[1]).direction
        ).toBe("rtl");
      });
    }
  },
};

const sourceCode =
  'const greeting = "مرحبا";\nconst url = "https://example.com/a?b=1";';

const MermaidLocaleFixture = () => {
  const [locale, setLocale] = useState<MarkdownFlowLocale>("ar-SA");
  return (
    <div>
      <button type="button" onClick={() => setLocale("th-TH")}>
        Thai
      </button>
      <ContentRender
        locale={locale}
        content={"```mermaid\n\n```\n\n~~~mermaid\n\n~~~"}
      />
    </div>
  );
};

export const MermaidLocaleMessages: Story = {
  render: () => <MermaidLocaleFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(
        canvas.getAllByText(
          getContentRenderLocaleTexts("ar-SA").mermaidEmptyChartText
        )
      ).toHaveLength(2)
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Thai", exact: true })
    );
    await waitFor(() =>
      expect(
        canvas.getAllByText(
          getContentRenderLocaleTexts("th-TH").mermaidEmptyChartText
        )
      ).toHaveLength(2)
    );
  },
};

export const ArabicCodeBlocks: Story = {
  render: () => (
    <ContentRender
      locale="ar-SA"
      content={`نص عربي\n\n\`\`\`javascript\n${sourceCode}\n\`\`\`\n\n\`\`\`\n${sourceCode}\n\`\`\``}
    />
  ),
  play: async ({ canvasElement }) => {
    const blocks = canvasElement.querySelectorAll(".code-block-container");
    expect(blocks).toHaveLength(2);
    expect(getComputedStyle(canvasElement.querySelector("p")!).direction).toBe(
      "rtl"
    );
    for (const block of blocks) {
      const pre = block.querySelector("pre")!;
      expect(getComputedStyle(pre).direction).toBe("ltr");
      expect(getComputedStyle(pre).textAlign).toBe("left");
      expect(getComputedStyle(pre).unicodeBidi).toBe("isolate");
      expect(getComputedStyle(pre.querySelector("code")!).direction).toBe(
        "ltr"
      );
      expect(pre.textContent?.trim()).toBe(sourceCode);
      const copyButton = block.querySelector("button")!;
      expect(getComputedStyle(copyButton).direction).toBe("rtl");
      expect(copyButton).toHaveTextContent(
        getContentRenderLocaleTexts("ar-SA").copyButtonText
      );
    }
  },
};

const TableDirectionFixture = () => {
  const [locale, setLocale] = useState<MarkdownFlowLocale>();
  return (
    <div dir="rtl">
      <button type="button" onClick={() => setLocale("ar-SA")}>
        Arabic
      </button>
      <button type="button" onClick={() => setLocale("th-TH")}>
        Thai
      </button>
      <ContentRender
        locale={locale}
        content={
          "| افتراضي | يسار | وسط | يمين |\n| --- | :--- | :---: | ---: |\n| نص | نص | نص | نص |"
        }
      />
    </div>
  );
};

export const DirectionAwareTables: Story = {
  render: () => <TableDirectionFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const locale of [undefined, "ar-SA", "th-TH"] as const) {
      if (locale) {
        await userEvent.click(
          canvas.getByRole("button", {
            name: locale === "ar-SA" ? "Arabic" : "Thai",
            exact: true,
          })
        );
      }
      const rows = canvasElement.querySelectorAll("tr");
      expect(rows).toHaveLength(2);
      for (const row of rows) {
        const cells = row.querySelectorAll("th, td");
        expect(cells).toHaveLength(4);
        for (const [index, alignment] of [
          "start",
          "left",
          "center",
          "right",
        ].entries()) {
          const style = getComputedStyle(cells[index]);
          expect(style.direction).toBe(locale === "th-TH" ? "ltr" : "rtl");
          expect(style.textAlign).toBe(alignment);
        }
      }
    }
  },
};

export const DirectionAwareMarkdownStructure: Story = {
  render: () => (
    <div dir="rtl">
      {(["ar-SA", "th-TH", undefined] as const).map((locale) => (
        <div key={locale ?? "inherit"} data-testid={locale ?? "inherit"}>
          <ContentRender
            locale={locale}
            content={
              "1. First\n   - Nested\n\n- Second\n  1. Nested ordered\n\n> Quoted text\n>\n> - Quoted list"
            }
          />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const locale of ["ar-SA", "th-TH", "inherit"]) {
      const fixture = canvas.getByTestId(locale);
      const rtl = locale !== "th-TH";
      const lists = fixture.querySelectorAll("ul, ol");
      expect(lists).toHaveLength(5);
      for (const list of lists) {
        const style = getComputedStyle(list);
        expect(style.direction).toBe(rtl ? "rtl" : "ltr");
        expect(
          parseFloat(rtl ? style.paddingRight : style.paddingLeft)
        ).toBeGreaterThan(0);
        expect(parseFloat(rtl ? style.paddingLeft : style.paddingRight)).toBe(
          0
        );
      }
      const quote = getComputedStyle(fixture.querySelector("blockquote")!);
      expect(
        parseFloat(rtl ? quote.borderRightWidth : quote.borderLeftWidth)
      ).toBeGreaterThan(0);
      expect(
        parseFloat(rtl ? quote.borderLeftWidth : quote.borderRightWidth)
      ).toBe(0);
    }
  },
};

export const StandaloneArabicInput: Story = {
  render: () => (
    <div dir="ltr" style={{ width: 360 }}>
      <MarkdownFlowInput locale="ar-SA" placeholder="اكتب إجابتك" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    const button = canvas.getByRole("button", {
      name: getContentRenderLocaleTexts("ar-SA").sendButtonLabel,
    });
    expect(getComputedStyle(input).direction).toBe("rtl");
    expect(input).toHaveAttribute("placeholder", "اكتب إجابتك");
    expect(button.getBoundingClientRect().right).toBeLessThanOrEqual(
      input.getBoundingClientRect().left
    );
  },
};

const EditorDialogLocaleFixture = () => {
  const [locale, setLocale] = useState<MarkdownFlowLocale>("ar-SA");
  return (
    <div>
      <button type="button" onClick={() => setLocale("th-TH")}>
        Thai
      </button>
      <MarkdownFlowEditor locale={locale} />
    </div>
  );
};

export const EditorDialogCloseLabels: Story = {
  render: () => <EditorDialogLocaleFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    for (const locale of ["ar-SA", "th-TH"] as const) {
      if (locale === "th-TH") {
        await userEvent.click(
          canvas.getByRole("button", { name: "Thai", exact: true })
        );
      }
      const texts = getEditorLocaleMessages(locale);
      for (const [trigger, title] of [
        [texts.toolbarInsertImage, texts.dialogTitleImage],
        [texts.toolbarInsertVideo, texts.dialogTitleVideo],
      ]) {
        await userEvent.click(
          canvas.getByRole("button", { name: trigger, exact: true })
        );
        const dialog = await page.findByRole("dialog", { name: title });
        expect(getComputedStyle(dialog).direction).toBe(
          locale === "ar-SA" ? "rtl" : "ltr"
        );
        expect(
          within(dialog).queryByRole("button", { name: "Close", exact: true })
        ).toBeNull();
        await userEvent.click(
          within(dialog).getByRole("button", {
            name: texts.dialogCloseLabel,
            exact: true,
          })
        );
        await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
      }
    }
  },
};

export const InheritedEditorPortalDirection: Story = {
  render: () => (
    <div dir="rtl" data-testid="editor-host">
      <MarkdownFlowEditor
        content="Variable: {{learner}}"
        editMode={EditMode.QuickEdit}
        variables={[{ name: "learner" }]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const host = canvas.getByTestId("editor-host");
    const root = host.querySelector(".markdown-flow-editor")!;
    expect(root).not.toHaveAttribute("dir");
    await userEvent.click(
      canvas.getByRole("button", {
        name: getEditorLocaleMessages().toolbarInsertImage,
        exact: true,
      })
    );
    const dialog = await page.findByRole("dialog");
    await waitFor(() => expect(getComputedStyle(dialog).direction).toBe("rtl"));
    host.dir = "ltr";
    await waitFor(() => expect(getComputedStyle(dialog).direction).toBe("ltr"));
    await userEvent.click(
      within(dialog).getByRole("button", {
        name: getEditorLocaleMessages().dialogCloseLabel,
        exact: true,
      })
    );
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
    await userEvent.click(
      host.querySelector<HTMLElement>(".tag-variable .tag-placeholder-content")!
    );
    const popover = await page.findByRole("dialog");
    await waitFor(() =>
      expect(getComputedStyle(popover).direction).toBe("ltr")
    );
    host.dir = "rtl";
    await waitFor(() =>
      expect(getComputedStyle(popover).direction).toBe("rtl")
    );
    expect(root).not.toHaveAttribute("dir");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
  },
};

export const ArabicVariableDropdown: Story = {
  parameters: { dropdownLocale: "ar-SA" },
  render: (_args, { parameters }) => (
    <div style={{ width: 320, marginLeft: "auto" }}>
      <MarkdownFlowEditor
        locale={parameters.dropdownLocale}
        variables={[
          {
            name: "learner",
            label: parameters.dropdownLocale === "ar-SA" ? "متعلم" : "ผู้เรียน",
          },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement, parameters }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", {
      name: getEditorLocaleMessages(parameters.dropdownLocale)
        .toolbarInsertExistingVariable,
    });
    await userEvent.click(trigger);
    await waitFor(() => {
      const panel = canvasElement.querySelector(
        ".markdown-flow-editor-variable-search"
      )!;
      expect(panel).not.toBeNull();
      const rect = panel.getBoundingClientRect();
      expect(rect.left).toBeGreaterThanOrEqual(8);
      expect(rect.right).toBeLessThanOrEqual(
        canvasElement.ownerDocument.documentElement.clientWidth - 8
      );
      if (parameters.dropdownLocale === "ar-SA") {
        expect(rect.right).toBeCloseTo(
          trigger.getBoundingClientRect().right,
          0
        );
      }
      const item = panel.querySelector(".variable-search-item")!;
      expect(item).not.toBeNull();
      for (const element of [
        item,
        ...item.querySelectorAll(
          ".variable-search-item-name, .variable-search-item-label"
        ),
      ]) {
        const style = getComputedStyle(element);
        expect(style.direction).toBe(
          parameters.dropdownLocale === "ar-SA" ? "rtl" : "ltr"
        );
        expect(style.textAlign).toBe("start");
      }
    });
  },
};

export const ThaiVariableDropdown: Story = {
  ...ArabicVariableDropdown,
  parameters: { dropdownLocale: "th-TH" },
};

const SandboxDirectionFixture = ({
  mode,
}: {
  mode: "content" | "blackboard";
}) => {
  const [locale, setLocale] = useState<MarkdownFlowLocale>("ar-SA");
  const [content, setContent] = useState("");
  return (
    <div>
      <button type="button" onClick={() => setLocale("th-TH")}>
        Thai
      </button>
      <button type="button" onClick={() => setLocale("ar-SA")}>
        Arabic
      </button>
      <button
        type="button"
        onClick={() => setContent('<p>مرحبا</p><p dir="ltr">Code: 123</p>')}
      >
        Render content
      </button>
      <IframeSandbox
        type="sandbox"
        mode={mode}
        content={content}
        locale={locale}
      />
    </div>
  );
};

export const SandboxLocaleDirection: Story = {
  render: () => <SandboxDirectionFixture mode="content" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const iframe = canvasElement.querySelector("iframe")!;
    const checkLoadingDirection = async (
      locale: MarkdownFlowLocale,
      dir: string
    ) => {
      await waitFor(() => {
        const status =
          iframe.contentDocument!.querySelector('[role="status"]')!;
        expect(status).not.toBeNull();
        expect(status).toHaveTextContent(
          getContentRenderLocaleTexts(locale).sandboxLoadingText
        );
        expect(iframe.contentWindow!.getComputedStyle(status).direction).toBe(
          dir
        );
      });
    };
    await checkLoadingDirection("ar-SA", "rtl");
    await userEvent.click(
      canvas.getByRole("button", { name: "Thai", exact: true })
    );
    await checkLoadingDirection("th-TH", "ltr");
    await userEvent.click(
      canvas.getByRole("button", { name: "Arabic", exact: true })
    );
    await checkLoadingDirection("ar-SA", "rtl");
    await userEvent.click(
      canvas.getByRole("button", { name: "Render content" })
    );
    await waitFor(() => {
      const paragraphs = iframe.contentDocument!.querySelectorAll("p");
      expect(paragraphs).toHaveLength(2);
      expect(
        iframe.contentWindow!.getComputedStyle(paragraphs[0]).direction
      ).toBe("rtl");
      expect(
        iframe.contentWindow!.getComputedStyle(paragraphs[1]).direction
      ).toBe("ltr");
    });
  },
};

export const BlackboardLocaleDirection: Story = {
  ...SandboxLocaleDirection,
  render: () => <SandboxDirectionFixture mode="blackboard" />,
};
