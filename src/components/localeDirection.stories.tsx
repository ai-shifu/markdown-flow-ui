import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import type { MarkdownFlowLocale } from "../lib/locale";
import ContentRender from "./ContentRender";
import MarkdownFlowInput from "./ContentRender/MarkdownFlowInput";
import MarkdownFlow from "./MarkdownFlow/MarkdownFlow";
import MarkdownFlowEditor from "./MarkdownFlowEditor/MarkdownFlowEditor";
import { getEditorLocaleMessages } from "./MarkdownFlowEditor/editorI18n";
import Slide from "./Slide/Slide";
import Player from "./Slide/Player";
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

const sourceCode =
  'const greeting = "مرحبا";\nconst url = "https://example.com/a?b=1";';

const MermaidLocaleFixture = () => {
  const [locale, setLocale] = useState<MarkdownFlowLocale>("ar-SA");
  return (
    <div>
      <button onClick={() => setLocale("th-TH")}>Thai</button>
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

export const ArabicVariableDropdown: Story = {
  render: () => (
    <div style={{ width: 320, marginLeft: "auto" }}>
      <MarkdownFlowEditor
        locale="ar-SA"
        variables={[{ name: "learner", label: "متعلم" }]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", {
      name: getEditorLocaleMessages("ar-SA").toolbarInsertExistingVariable,
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
      expect(rect.right).toBeCloseTo(trigger.getBoundingClientRect().right, 0);
    });
  },
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
