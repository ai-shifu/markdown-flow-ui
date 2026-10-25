// @vitest-environment jsdom
import React from "react";
import mermaid from "mermaid";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import MermaidChart from "./MermaidChart";

vi.mock("mermaid", () => ({
  default: {
    initialize: vi.fn(),
    parse: vi.fn(),
    render: vi.fn(),
    mermaidAPI: { defaultConfig: { xyChart: { width: 700 } } },
  },
}));

beforeEach(() => {
  vi.mocked(mermaid.parse).mockResolvedValue({
    diagramType: "flowchart-v2",
    config: {},
  });
  vi.mocked(mermaid.render).mockResolvedValue({
    svg: '<svg data-rendered="true"></svg>',
    diagramType: "flowchart-v2",
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

it("isolates measurement from flex layout and inherited scaling, then removes the host", async () => {
  const originalStyle = document.body.getAttribute("style");
  document.body.style.transform = "scale(0.64)";
  document.body.style.display = "flex";
  const bodyStyle = document.body.getAttribute("style");
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    width: 64,
    height: 64,
  } as DOMRect);
  let host: Element | undefined;
  vi.mocked(mermaid.render).mockImplementationOnce(
    async (_id, _chart, element) => {
      host = element;
      expect(host?.parentElement).toBe(document.body);
      expect(host).toHaveProperty("style.position", "fixed");
      expect(host).toHaveProperty("style.visibility", "hidden");
      expect(host).toHaveProperty("style.transform", "scale(1.5625, 1.5625)");
      expect(host?.getAttribute("aria-hidden")).toBe("true");
      expect(document.body.getAttribute("style")).toBe(bodyStyle);
      return {
        svg: '<svg data-rendered="true"></svg>',
        diagramType: "flowchart-v2",
      };
    }
  );
  try {
    const { container } = render(<MermaidChart chart="flowchart TD; A-->B" />);
    await waitFor(() => expect(container.querySelector("svg")).not.toBeNull());
    expect(host?.isConnected).toBe(false);
    expect(document.body.getAttribute("style")).toBe(bodyStyle);
  } finally {
    if (originalStyle === null) document.body.removeAttribute("style");
    else document.body.setAttribute("style", originalStyle);
  }
});

it.each([undefined, 900])(
  "keeps an XY viewBox at natural width %s on narrow screens",
  async (width) => {
    vi.spyOn(window, "innerWidth", "get").mockReturnValue(320);
    vi.mocked(mermaid.parse).mockResolvedValueOnce({
      diagramType: "xychart",
      config: { xyChart: { width } },
    });
    render(<MermaidChart chart="xychart\nline [1, 2, 3]" />);
    await waitFor(() => expect(mermaid.render).toHaveBeenCalledOnce());
    const host = vi.mocked(mermaid.render).mock.calls[0][2] as HTMLElement;
    expect(host.style.width).toBe(`${width ?? 700}px`);
    expect(host.isConnected).toBe(false);
  }
);

it("removes the measurement host when drawing fails and preserves the error fallback", async () => {
  vi.mocked(mermaid.render).mockRejectedValueOnce(new Error("Drawing failed"));
  const { container } = render(<MermaidChart chart="flowchart TD; A-->B" />);
  await waitFor(() =>
    expect(container.querySelector("[data-mermaid-error]")).not.toBeNull()
  );
  const host = vi.mocked(mermaid.render).mock.calls[0][2];
  expect(host?.isConnected).toBe(false);
  expect(container.textContent).toContain(
    "Unable to display the Mermaid chart"
  );
});

it("gives concurrent renders separate hosts and SVG identifiers", async () => {
  vi.spyOn(Date, "now").mockReturnValue(1);
  render(
    <>
      <MermaidChart chart="flowchart TD; A-->B" />
      <MermaidChart chart="flowchart TD; C-->D" />
    </>
  );
  await waitFor(() => expect(mermaid.render).toHaveBeenCalledTimes(2));
  const [first, second] = vi.mocked(mermaid.render).mock.calls;
  expect(first[0]).not.toBe(second[0]);
  expect(first[2]).not.toBe(second[2]);
  expect(first[2]?.isConnected).toBe(false);
  expect(second[2]?.isConnected).toBe(false);
});
