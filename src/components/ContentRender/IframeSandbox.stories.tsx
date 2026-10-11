import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import IframeSandbox from "./IframeSandbox";

const meta = {
  title: "Components/IframeSandbox",
  component: IframeSandbox,
  parameters: { layout: "fullscreen" },
  args: {
    type: "sandbox",
    hideFullScreen: true,
    disableLoadingOverlay: true,
  },
} satisfies Meta<typeof IframeSandbox>;

export default meta;
type Story = StoryObj<typeof meta>;

const card = (height: number) =>
  `<div data-card style="height:${height}px;background:#eaf2ff;border-radius:16px;padding:24px">A compact lesson card</div>`;

const expectHeight = async (canvas: HTMLElement, height: number) => {
  await waitFor(
    () => {
      const container = canvas.querySelector<HTMLElement>(
        ".content-render-iframe-sandbox"
      );
      expect(container).not.toBeNull();
      expect(container!.getBoundingClientRect().height).toBeCloseTo(height, 0);
    },
    { timeout: 5000 }
  );
};

export const CompactCard: Story = {
  args: { content: card(240) },
  render: (args) => (
    <div style={{ width: 1000 }}>
      <IframeSandbox {...args} />
      <p>Following lesson text stays directly below the card.</p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectHeight(canvasElement, 240);
    const iframe = canvasElement.querySelector("iframe")!;
    expect(
      iframe
        .contentDocument!.querySelector("[data-card]")!
        .getBoundingClientRect().top
    ).toBe(0);
  },
};

export const ShortContentFullscreenControl: Story = {
  args: { content: '<div style="height:1px"></div>', hideFullScreen: false },
  render: function Render(args) {
    const [hideFullScreen, setHideFullScreen] = useState(false);
    return (
      <div style={{ width: 1000 }}>
        <button onClick={() => setHideFullScreen((hidden) => !hidden)}>
          Toggle fullscreen control
        </button>
        <IframeSandbox {...args} hideFullScreen={hideFullScreen} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const expectControlFits = async () => {
      await waitFor(() => {
        const host = canvasElement.querySelector<HTMLElement>(
          ".content-render-iframe-sandbox"
        )!;
        const control = host.querySelector("button")!;
        expect(control).not.toBeNull();
        const hostBounds = host.getBoundingClientRect();
        expect(hostBounds.height).toBeGreaterThan(1);
        expect(hostBounds.bottom).toBeGreaterThanOrEqual(
          control.getBoundingClientRect().bottom
        );
      });
    };
    await expectControlFits();
    const iframe = canvasElement.querySelector("iframe")!;
    const toggle = canvasElement.querySelector("button")!;
    await userEvent.click(toggle);
    await expectHeight(canvasElement, 1);
    await userEvent.click(toggle);
    await expectControlFits();
    expect(canvasElement.querySelector("iframe")).toBe(iframe);
  },
};

export const GrowingAndShrinkingContent: Story = {
  args: { content: card(240) },
  render: function Render(args) {
    const [width, setWidth] = useState(1000);
    const [height, setHeight] = useState(240);
    return (
      <div>
        <button onClick={() => setHeight(900)}>Expand card</button>
        <button onClick={() => setHeight(80)}>Collapse card</button>
        <button onClick={() => setWidth(360)}>Mobile width</button>
        <button onClick={() => setWidth(1000)}>Desktop width</button>
        <div style={{ width }}>
          <IframeSandbox {...args} content={card(height)} />
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    await expectHeight(canvasElement, 240);
    const iframe = canvasElement.querySelector("iframe")!;
    const documentBefore = iframe.contentDocument;
    const click = (label: string) =>
      userEvent.click(
        Array.from(canvasElement.querySelectorAll("button")).find(
          (button) => button.textContent === label
        )!
      );
    await click("Expand card");
    await expectHeight(canvasElement, 900);
    await click("Collapse card");
    await expectHeight(canvasElement, 80);
    await click("Mobile width");
    await expectHeight(canvasElement, 80);
    await click("Desktop width");
    await expectHeight(canvasElement, 80);
    expect(canvasElement.querySelector("iframe")).toBe(iframe);
    expect(iframe.contentDocument).toBe(documentBefore);
  },
};

export const ViewportSizedContent: Story = {
  args: {
    content:
      '<div data-card style="height:100vh;background:#eaf2ff">An intentionally full-height diagram</div>',
  },
  render: (args) => (
    <div style={{ width: 1000 }}>
      <IframeSandbox {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectHeight(canvasElement, 563);
    const iframe = canvasElement.querySelector("iframe")!;
    expect(
      iframe
        .contentDocument!.querySelector("[data-card]")!
        .getBoundingClientRect().height
    ).toBe(563);
  },
};

export const FixedPositionedContent: Story = {
  args: {
    content:
      '<div data-card style="position:fixed;top:0;left:0;width:100%;height:240px;background:#eaf2ff">A fixed-position lesson card</div>',
  },
  render: (args) => (
    <div style={{ width: 1000 }}>
      <IframeSandbox {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectHeight(canvasElement, 240);
  },
};

export const FixedViewportControls: Story = {
  args: {
    content:
      '<div style="height:240px;background:#eaf2ff">Lesson content</div><button data-card style="position:fixed;bottom:0;left:0;height:32px">Bottom control</button>',
  },
  render: (args) => (
    <div style={{ width: 1000 }}>
      <IframeSandbox {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectHeight(canvasElement, 563);
    const iframe = canvasElement.querySelector("iframe")!;
    expect(
      iframe
        .contentDocument!.querySelector("[data-card]")!
        .getBoundingClientRect().bottom
    ).toBe(563);
  },
};

export const ViewportRelativeTypography: Story = {
  args: {
    content:
      '<div data-card style="height:50vmin;background:#eaf2ff">Viewport-relative dimensions retain their layout reference.</div>',
  },
  render: (args) => (
    <div style={{ width: 1000 }}>
      <IframeSandbox {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectHeight(canvasElement, 282);
    const iframe = canvasElement.querySelector("iframe")!;
    expect(
      iframe
        .contentDocument!.querySelector("[data-card]")!
        .getBoundingClientRect().height
    ).toBe(281.5);
    // A subsequent measurement must not shrink the viewport and its vmin units.
    iframe
      .contentDocument!.querySelector("[data-card]")!
      .setAttribute("class", "remeasure");
    await expectHeight(canvasElement, 282);
  },
};

export const InnerScrollingContent: Story = {
  args: {
    content:
      '<div style="height:100vh;overflow-y:auto"><div data-card style="height:900px;background:#eaf2ff">The complete tall content must remain visible.</div></div>',
  },
  render: (args) => (
    <div style={{ width: 1000 }}>
      <IframeSandbox {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectHeight(canvasElement, 900);
    const iframe = canvasElement.querySelector("iframe")!;
    const element = iframe.contentDocument!.querySelector("[data-card]")!;
    expect(element.getBoundingClientRect().bottom).toBe(900);
    expect(iframe.getBoundingClientRect().height).toBeGreaterThanOrEqual(900);
  },
};

export const LateImageAndDomChanges: Story = {
  args: {
    content:
      '<div data-card><img alt="Delayed diagram" style="display:block;width:400px" /></div>',
  },
  render: (args) => (
    <div style={{ width: 1000 }}>
      <IframeSandbox {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const iframe = await waitFor(() => {
      const frame = canvasElement.querySelector("iframe");
      expect(frame?.contentDocument?.querySelector("img")).not.toBeNull();
      return frame!;
    });
    const image = iframe.contentDocument!.querySelector("img")!;
    image.src =
      "data:image/svg+xml," +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="lightblue"/></svg>'
      );
    await expectHeight(canvasElement, 300);
    // Script-driven DOM changes also resize in both directions without remounts.
    const cardElement =
      iframe.contentDocument!.querySelector<HTMLElement>("[data-card]")!;
    cardElement.style.height = "700px";
    await expectHeight(canvasElement, 700);
    cardElement.style.height = "auto";
    await expectHeight(canvasElement, 300);
    expect(canvasElement.querySelector("iframe")).toBe(iframe);
  },
};

export const BlackboardKeepsItsViewport: Story = {
  args: { mode: "blackboard", content: card(240) },
  render: (args) => (
    <div style={{ width: 1000, height: 600 }}>
      <IframeSandbox {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectHeight(canvasElement, 240);
    const iframe = canvasElement.querySelector("iframe")!;
    expect(iframe.getBoundingClientRect().height).toBe(240);
  },
};

export const ScaledBlackboardKeepsHostHeight: Story = {
  args: { mode: "blackboard", enableScaling: true, content: card(240) },
  render: (args) => (
    <div style={{ width: 1000, height: 600 }}>
      <IframeSandbox {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectHeight(canvasElement, 600);
    const iframe = canvasElement.querySelector("iframe")!;
    await waitFor(() => {
      expect(
        iframe.contentDocument?.querySelector("[data-card]")
      ).not.toBeNull();
    });
    expect(iframe.getBoundingClientRect().height).toBe(600);
  },
};

export const AuthoredSpacingAndStyles: Story = {
  args: {
    content:
      '<style>body { background: rgb(255, 0, 0); } .host-sentinel { color: rgb(255, 0, 0); }</style><div data-card style="height:240px;margin:20px 0;background:#eaf2ff">Authored margins remain part of the content.</div>',
  },
  render: (args) => (
    <div style={{ width: 1000, color: "rgb(0, 0, 255)" }}>
      <p className="host-sentinel">Host document</p>
      <IframeSandbox {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectHeight(canvasElement, 280);
    const iframe = canvasElement.querySelector("iframe")!;
    expect(
      iframe
        .contentDocument!.querySelector("[data-card]")!
        .getBoundingClientRect().top
    ).toBe(20);
    expect(
      getComputedStyle(canvasElement.querySelector(".host-sentinel")!).color
    ).toBe("rgb(0, 0, 255)");
    expect(iframe.sandbox.value).toBe(
      "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
    );
  },
};
