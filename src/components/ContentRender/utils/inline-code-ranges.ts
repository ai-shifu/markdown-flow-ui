import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import { remarkPlugins } from "./markdown-plugins";
import { isHtmlRawTextTag, readHtmlMarkup } from "./html-block-end";

const parser = unified().use(remarkParse).use(remarkPlugins);

const MAX_CACHE_ENTRIES = 16;
const MAX_CACHED_SOURCE_CHARACTERS = 256 * 1024;

type CodeRange = Readonly<{ start: number; end: number }>;
type Immutable<T> = T extends object
  ? { readonly [Key in keyof T]: Immutable<T[Key]> }
  : T;
export type MarkdownSourceTree = Immutable<ReturnType<typeof parser.parse>>;
export type MarkdownSourceAnalysis = {
  tree: MarkdownSourceTree;
  inline: readonly CodeRange[];
  markdown: readonly CodeRange[];
  literal: readonly CodeRange[];
  comments: readonly CodeRange[];
  fences: readonly CodeRange[];
  html: readonly CodeRange[];
};

const EMPTY_RANGES: readonly CodeRange[] = Object.freeze([]);
const sourceRangesCache = new Map<string, MarkdownSourceAnalysis>();
let cachedSourceCharacters = 0;

const freezeTree = <T>(value: T): Immutable<T> => {
  if (value && typeof value === "object") {
    for (const child of Object.values(value)) freezeTree(child);
    Object.freeze(value);
  }
  return value as Immutable<T>;
};

const collectCommentRanges = (raw: string, literals: readonly CodeRange[]) => {
  const comments: CodeRange[] = [];
  let position = 0;
  let literalIndex = 0;
  while (position < raw.length) {
    while (literals[literalIndex]?.end <= position) literalIndex += 1;
    const literal = literals[literalIndex];
    if (literal && literal.start <= position) {
      position = literal.end;
      continue;
    }
    if (raw[position] !== "<") {
      position += 1;
      continue;
    }
    const markup = readHtmlMarkup(raw, position);
    if (raw.startsWith("<!--", position)) {
      const end = markup.kind === "comment" ? markup.end : raw.length;
      comments.push(Object.freeze({ start: position, end }));
      position = end;
    } else if (markup.kind === "tag") {
      position = markup.end;
      if (!markup.closing && isHtmlRawTextTag(markup.name)) {
        const close = new RegExp(`</${markup.name}(?=[\\s/>])`, "gi");
        close.lastIndex = position;
        position = close.exec(raw)?.index ?? raw.length;
      }
    } else if (markup.kind === "declaration") {
      position = markup.end;
    } else if (markup.kind === "incomplete") {
      break;
    } else {
      position += 1;
    }
  }
  return comments;
};

const parseCodeRanges = (raw: string): MarkdownSourceAnalysis => {
  const tree = parser.parse(raw);
  const inline: CodeRange[] = [];
  const markdown: CodeRange[] = [];
  const literal: CodeRange[] = [];
  const html: CodeRange[] = [];

  // Use the renderer's Markdown grammar, including HTML paragraph boundaries.
  visit(tree, (node) => {
    const isCode = node.type === "inlineCode" || node.type === "code";
    if (
      !isCode &&
      node.type !== "inlineMath" &&
      node.type !== "math" &&
      node.type !== "html"
    )
      return;
    const start = node.position?.start.offset;
    const end = node.position?.end.offset;
    if (start === undefined || end === undefined) return;
    const range = Object.freeze({ start, end });
    if (node.type === "html") {
      html.push(range);
      return;
    }
    literal.push(range);
    if (isCode) markdown.push(range);
    if (node.type === "inlineCode") inline.push(range);
  });

  const comments = collectCommentRanges(raw, literal);
  literal.push(...comments);
  literal.sort((left, right) => left.start - right.start);
  const fences: CodeRange[] = [];
  for (const node of tree.children) {
    const start = node.position?.start.offset;
    const end = node.position?.end.offset;
    if (node.type !== "code" || start === undefined || end === undefined)
      continue;
    const lineStart = raw.lastIndexOf("\n", start - 1) + 1;
    if (
      /^[ \t]{0,3}$/.test(raw.slice(lineStart, start)) &&
      /^(?:`{3,}|~{3,})/.test(raw.slice(start))
    )
      fences.push(Object.freeze({ start: lineStart, end }));
  }

  // Cached trees are immutable: renderers clone before running transforms.
  return Object.freeze({
    tree: freezeTree(tree),
    inline: Object.freeze(inline),
    markdown: Object.freeze(markdown),
    literal: Object.freeze(literal),
    comments: Object.freeze(comments),
    fences: Object.freeze(fences),
    html: Object.freeze(html),
  });
};

export const getMarkdownSourceAnalysis = (
  raw: string
): MarkdownSourceAnalysis => {
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
  const ranges = getMarkdownSourceAnalysis(raw);
  return inlineOnly ? ranges.inline : ranges.markdown;
};

export const getInlineCodeRanges = (raw: string) =>
  raw.includes("`") ? collectCodeRanges(raw, true) : EMPTY_RANGES;

export const getMarkdownCodeRanges = (raw: string) =>
  collectCodeRanges(raw, false);

// Native HTML must remain inert inside the renderer's code and math literals.
export const getMarkdownLiteralRanges = (raw: string) =>
  getMarkdownSourceAnalysis(raw).literal;

export const getMarkdownSourceTree = (raw: string) =>
  getMarkdownSourceAnalysis(raw).tree;
