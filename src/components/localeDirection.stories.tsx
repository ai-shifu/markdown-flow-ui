import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import type { MarkdownFlowLocale } from "../lib/locale";
import ContentRender from "./ContentRender";
import MarkdownFlow from "./MarkdownFlow/MarkdownFlow";
import MarkdownFlowEditor from "./MarkdownFlowEditor/MarkdownFlowEditor";
import Slide from "./Slide/Slide";
import Player from "./Slide/Player";
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
        for (const name of ["renderer", "flow", "editor", "slide", "player"]) {
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
