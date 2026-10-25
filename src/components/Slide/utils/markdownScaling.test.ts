import { describe, expect, it } from "vitest";

import type { Element } from "../types";
import { resolveMarkdownScalingMode } from "./markdownScaling";

const element = (
  type: Element["type"],
  isRenderable: boolean | undefined = true
): Element => ({
  content: "content",
  type,
  is_renderable: isRenderable,
});

describe("resolveMarkdownScalingMode", () => {
  it("fully fits accumulated Markdown-rendered elements as one page", () => {
    expect(
      resolveMarkdownScalingMode([
        element("title"),
        element("text"),
        element("code"),
      ])
    ).toBe("fit");
  });

  it("applies only the viewport base size to mixed HTML or slot pages", () => {
    expect(
      resolveMarkdownScalingMode([element("title"), element("html")])
    ).toBe("base");
    expect(resolveMarkdownScalingMode([element("slot"), element("text")])).toBe(
      "base"
    );
  });

  it("allows hidden HTML pre-rendering beside visible Markdown", () => {
    expect(
      resolveMarkdownScalingMode([
        element("html", false),
        element("text", true),
      ])
    ).toBe("fit");
  });

  it("does not activate without visible Markdown content", () => {
    expect(resolveMarkdownScalingMode([])).toBe("disabled");
    expect(resolveMarkdownScalingMode([element("text", false)])).toBe(
      "disabled"
    );
    expect(resolveMarkdownScalingMode([element("html")])).toBe("disabled");
    expect(resolveMarkdownScalingMode([element("slot")])).toBe("disabled");
  });
});
