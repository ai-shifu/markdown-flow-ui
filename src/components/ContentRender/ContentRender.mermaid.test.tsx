// @vitest-environment jsdom
import React from "react";
import mermaid from "mermaid";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ContentRender from "./ContentRender";
import MermaidChart from "./plugins/MermaidChart";
import { getContentRenderLocaleTexts } from "./contentRenderI18n";

vi.mock("mermaid", () => ({
  default: {
    initialize: vi.fn(),
    parse: vi.fn(() => new Promise(() => {})),
    render: vi.fn(),
  },
}));
vi.mock("./IframeSandbox", () => ({ default: () => null }));
vi.mock("./plugins/CustomVariable", () => ({ default: () => null }));

afterEach(cleanup);

describe.each([
  ["standalone segment", (chart: string) => `\`\`\`mermaid\n${chart}\n\`\`\``],
  [
    "sandbox-adjacent segment",
    (chart: string) =>
      `<html><body>Preview</body></html>\n\n\`\`\`mermaid\n${chart}\n\`\`\``,
  ],
  ["markdown code renderer", (chart: string) => `~~~mermaid\n${chart}\n~~~`],
] as const)("Mermaid locale in %s", (_name, contentFor) => {
  it("keeps invalid source LTR without changing the message direction", async () => {
    vi.mocked(mermaid.parse).mockRejectedValueOnce(
      new Error("Invalid Mermaid source")
    );
    const chart = 'invalid ??? ["مرحبا"] -->;';
    const { container } = render(
      <ContentRender content={contentFor(chart)} locale="ar-SA" />
    );
    const message = await screen.findByText("error: invalid mermaid source");
    const pre = container.querySelector("code")!.parentElement!;
    expect(pre.getAttribute("dir")).toBe("ltr");
    expect(pre.querySelector("code")?.textContent).toBe(chart);
    expect(message.closest("[dir]")?.getAttribute("dir")).toBe(
      _name === "markdown code renderer" ? "ltr" : "rtl"
    );
  });

  it.each(["loading", "empty"] as const)(
    "updates the %s message when the locale changes without changing the chart",
    (state) => {
      const content = contentFor(state === "loading" ? "graph TD; A-->B" : "");
      const { rerender } = render(
        <ContentRender content={content} locale="ar-SA" />
      );
      for (const locale of ["ar-SA", "th-TH", undefined] as const) {
        rerender(<ContentRender content={content} locale={locale} />);
        const texts = getContentRenderLocaleTexts(locale);
        const label =
          state === "loading"
            ? texts.mermaidLoadingText
            : texts.mermaidEmptyChartText;
        expect(screen.getByText(label)).toBeTruthy();
      }
    }
  );
});

it("preserves standalone Mermaid message overrides and English defaults", () => {
  const { rerender } = render(
    <MermaidChart chart="" messages={{ emptyChart: "Custom empty chart" }} />
  );
  expect(screen.getByText("Custom empty chart")).toBeTruthy();
  rerender(<MermaidChart chart="" />);
  expect(screen.getByText("Empty chart content")).toBeTruthy();
});

it("shows localized loading when a streaming chart gains content", () => {
  const { rerender } = render(
    <ContentRender content={"```mermaid\n"} locale="ar-SA" />
  );
  expect(
    screen.getByText(getContentRenderLocaleTexts("ar-SA").mermaidEmptyChartText)
  ).toBeTruthy();
  rerender(
    <ContentRender content={"```mermaid\ngraph TD; A-->B"} locale="ar-SA" />
  );
  expect(
    screen.getByText(getContentRenderLocaleTexts("ar-SA").mermaidLoadingText)
  ).toBeTruthy();
  expect(screen.queryByText("Empty chart content")).toBeNull();
});
