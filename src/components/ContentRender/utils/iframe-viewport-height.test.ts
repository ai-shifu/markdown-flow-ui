import { describe, expect, it } from "vitest";

import {
  inspectViewportHeightFromHtmlRootString,
  inspectViewportHeightFromNodeChain,
  resolveExplicitHeightFromNodeChain,
  type ViewportHeightInspectionNode,
} from "./iframe-viewport-height";

type TestHeightNode = ViewportHeightInspectionNode & {
  children?: TestHeightNode[];
};

const traversalOptions = {
  getNode: (node: TestHeightNode) => node,
  getSingleChild: (node: TestHeightNode) =>
    node.children?.length === 1 ? node.children[0] : null,
};

describe("iframeViewportHeight", () => {
  it("keeps parsing root min-height viewport classes from raw html", () => {
    const meta = inspectViewportHeightFromHtmlRootString(
      '<div class="w-full min-h-screen bg-white"></div>'
    );

    expect(meta.viewportHeightCss).toBe("100dvh");
    expect(meta.hasFullViewportHeight).toBe(true);
  });

  it("finds viewport height on a nested single-child chain", () => {
    const meta = inspectViewportHeightFromNodeChain(
      {
        classAttrValue: "w-full",
        children: [
          {
            classAttrValue: "contents",
            children: [
              {
                classAttrValue: "w-full min-h-screen overflow-y-auto",
              },
            ],
          },
        ],
      },
      traversalOptions
    );

    expect(meta.viewportHeightCss).toBe("100dvh");
    expect(meta.hasFullViewportHeight).toBe(true);
  });

  it("resolves nested viewport height to the host viewport height", () => {
    const resolvedHeight = resolveExplicitHeightFromNodeChain(
      {
        classAttrValue: "w-full",
        children: [
          {
            classAttrValue: "relative",
            children: [
              {
                classAttrValue: "min-h-screen",
              },
            ],
          },
        ],
      },
      900,
      traversalOptions
    );

    expect(resolvedHeight).toBe(900);
  });
});
