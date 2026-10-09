import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import { remarkPlugins } from "./markdown-plugins";

const parser = unified().use(remarkParse).use(remarkPlugins);

const MAX_CACHE_ENTRIES = 16;
const MAX_CACHED_SOURCE_CHARACTERS = 256 * 1024;

type CodeRange = Readonly<{ start: number; end: number }>;
type CodeRanges = {
  inline: readonly CodeRange[];
  markdown: readonly CodeRange[];
  literal: readonly CodeRange[];
};

const EMPTY_RANGES: readonly CodeRange[] = Object.freeze([]);
const sourceRangesCache = new Map<string, CodeRanges>();
let cachedSourceCharacters = 0;

const parseCodeRanges = (raw: string): CodeRanges => {
  const inline: CodeRange[] = [];
  const markdown: CodeRange[] = [];
  const literal: CodeRange[] = [];

  // Use the renderer's Markdown grammar, including HTML paragraph boundaries.
  visit(parser.parse(raw), (node) => {
    const isCode = node.type === "inlineCode" || node.type === "code";
    if (!isCode && node.type !== "inlineMath" && node.type !== "math") return;
    const start = node.position?.start.offset;
    const end = node.position?.end.offset;
    if (start === undefined || end === undefined) return;
    const range = Object.freeze({ start, end });
    literal.push(range);
    if (isCode) markdown.push(range);
    if (node.type === "inlineCode") inline.push(range);
  });

  // Cached results can be shared by source splitting and render-only repairs.
  return {
    inline: Object.freeze(inline),
    markdown: Object.freeze(markdown),
    literal: Object.freeze(literal),
  };
};

const getCodeRanges = (raw: string): CodeRanges => {
  const cached = sourceRangesCache.get(raw);
  if (cached) {
    sourceRangesCache.delete(raw);
    sourceRangesCache.set(raw, cached);
    return cached;
  }

  const ranges = parseCodeRanges(raw);
  // Large individual messages must not displace the bounded working set.
  if (raw.length > MAX_CACHED_SOURCE_CHARACTERS) return ranges;

  while (
    sourceRangesCache.size >= MAX_CACHE_ENTRIES ||
    cachedSourceCharacters + raw.length > MAX_CACHED_SOURCE_CHARACTERS
  ) {
    const oldestSource = sourceRangesCache.keys().next().value;
    if (oldestSource === undefined) break;
    cachedSourceCharacters -= oldestSource.length;
    sourceRangesCache.delete(oldestSource);
  }

  sourceRangesCache.set(raw, ranges);
  cachedSourceCharacters += raw.length;
  return ranges;
};

const collectCodeRanges = (raw: string, inlineOnly: boolean) => {
  const ranges = getCodeRanges(raw);
  return inlineOnly ? ranges.inline : ranges.markdown;
};

export const getInlineCodeRanges = (raw: string) =>
  raw.includes("`") ? collectCodeRanges(raw, true) : EMPTY_RANGES;

export const getMarkdownCodeRanges = (raw: string) =>
  collectCodeRanges(raw, false);

// Native HTML must remain inert inside the renderer's code and math literals.
export const getMarkdownLiteralRanges = (raw: string) =>
  getCodeRanges(raw).literal;
