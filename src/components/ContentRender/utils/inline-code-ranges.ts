import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import { remarkPlugins } from "./markdown-plugins";

const parser = unified().use(remarkParse).use(remarkPlugins);

export const getInlineCodeRanges = (raw: string) => {
  const ranges: Array<{ start: number; end: number }> = [];
  if (!raw.includes("`")) return ranges;

  // Use the renderer's Markdown grammar, including HTML paragraph boundaries.
  visit(parser.parse(raw), "inlineCode", (node) => {
    const start = node.position?.start.offset;
    const end = node.position?.end.offset;
    if (start !== undefined && end !== undefined) ranges.push({ start, end });
  });
  return ranges;
};
