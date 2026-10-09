import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import { remarkPlugins } from "./markdown-plugins";

const parser = unified().use(remarkParse).use(remarkPlugins);

const collectCodeRanges = (raw: string, inlineOnly: boolean) => {
  const ranges: Array<{ start: number; end: number }> = [];

  // Use the renderer's Markdown grammar, including HTML paragraph boundaries.
  visit(parser.parse(raw), (node) => {
    if (node.type !== "inlineCode" && (inlineOnly || node.type !== "code")) {
      return;
    }
    const start = node.position?.start.offset;
    const end = node.position?.end.offset;
    if (start !== undefined && end !== undefined) ranges.push({ start, end });
  });
  return ranges;
};

export const getInlineCodeRanges = (raw: string) =>
  raw.includes("`") ? collectCodeRanges(raw, true) : [];

export const getMarkdownCodeRanges = (raw: string) =>
  collectCodeRanges(raw, false);
