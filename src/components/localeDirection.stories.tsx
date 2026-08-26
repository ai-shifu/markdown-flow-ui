import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import type { MarkdownFlowLocale } from "../lib/locale";
import ContentRender from "./ContentRender";
import MarkdownFlow from "./MarkdownFlow/MarkdownFlow";
import MarkdownFlowEditor from "./MarkdownFlowEditor/MarkdownFlowEditor";
import Slide from "./Slide/Slide";
import Player from "./Slide/Player";

const DirectionFixture = () => {
  const [locale, setLocale] = useState<MarkdownFlowLocale>();
  return (
    <div dir="rtl">
      <button onClick={() => setLocale("ar-SA")}>Arabic</button>
      <button onClick={() => setLocale("th-TH")}>Thai</button>
      <button onClick={() => setLocale(undefined)}>Inherit</button>
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
