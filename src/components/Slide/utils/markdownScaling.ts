import type { Element } from "../types";

const isMarkdownRenderedElement = (element: Element) =>
  element.type !== "html" && element.type !== "slot";

export type MarkdownScalingMode = "base" | "disabled" | "fit";

/**
 * Fully fits Markdown-only pages. Mixed pages still receive the viewport base
 * font-size while retaining their existing HTML/slot layout and scroll model.
 */
export const resolveMarkdownScalingMode = (
  elementList: Element[]
): MarkdownScalingMode => {
  const visibleElements = elementList.filter(
    (element) => element.is_renderable !== false
  );
  const markdownElementCount = visibleElements.filter(
    isMarkdownRenderedElement
  ).length;

  if (markdownElementCount === 0) {
    return "disabled";
  }

  return markdownElementCount === visibleElements.length ? "fit" : "base";
};
