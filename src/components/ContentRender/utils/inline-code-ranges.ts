import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import { remarkPlugins } from "./markdown-plugins";
import { findResumedProseFence } from "./resumed-prose-fence";
import {
  findStreamingHtmlBlockEnd,
  isHtmlRawTextTag,
  readHtmlMarkup,
} from "./html-block-end";

const parser = unified().use(remarkParse).use(remarkPlugins);

const MAX_CACHE_ENTRIES = 16;
const MAX_CACHED_SOURCE_CHARACTERS = 256 * 1024;

type CodeRange = Readonly<{ start: number; end: number }>;
type MetadataRange = CodeRange &
  Readonly<{
    pending?: true;
    // Alt text is always literal. Resolution may depend on a later definition,
    // but its classification mask must stop at the image's own source end.
    imageAltEnd?: number;
    imageResolveEnd?: number;
  }>;
type Immutable<T> = T extends object
  ? { readonly [Key in keyof T]: Immutable<T[Key]> }
  : T;
export type MarkdownSourceTree = Immutable<ReturnType<typeof parser.parse>>;
export type MarkdownSourceAnalysis = {
  tree: MarkdownSourceTree;
  inline: readonly CodeRange[];
  markdown: readonly CodeRange[];
  literal: readonly CodeRange[];
  metadata: readonly MetadataRange[];
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

// An unfinished link has no MDAST link node yet. Its received destination/title
// stays inert until Markdown can resolve the construct or a blank line ends it.
const findPendingLinkMetadataEnd = (raw: string, start: number) => {
  let depth = 0;
  let quote = "";
  let angle = false;
  let hasDestination = false;
  let stage: "destination" | "after-angle" | "title" | "close" = "destination";
  let newline = -1;
  for (let position = start + 1; position < raw.length; position += 1) {
    const character = raw[position];
    const whitespace = /[ \t\r\n]/.test(character);
    if (character === "\n") {
      if (newline >= 0) return { end: newline, pending: true as const };
      newline = position;
    } else if (!/[ \t\r]/.test(character)) {
      newline = -1;
    }
    if (quote) {
      if (character === "\\") position += 1;
      else if (character === quote) {
        quote = "";
        stage = "close";
      }
    } else if (stage === "destination") {
      if (character === "\\") {
        hasDestination = true;
        position += 1;
      } else if (angle) {
        if (character === ">") {
          angle = false;
          stage = "after-angle";
        } else if (character === "<" || /[\r\n]/.test(character)) return;
      } else if (whitespace) {
        if (depth) return;
        if (hasDestination) stage = "title";
      } else if (!hasDestination && character === "<") {
        angle = true;
        hasDestination = true;
      } else if (character === ")" && depth === 0) return { end: position + 1 };
      else {
        if (character === "(") depth += 1;
        else if (character === ")") depth -= 1;
        hasDestination = true;
      }
    } else if (whitespace) {
      if (stage === "after-angle") stage = "title";
    } else if (character === ")") {
      return { end: position + 1 };
    } else if (
      stage === "title" &&
      (character === '"' || character === "'" || character === "(")
    ) {
      quote = character === "(" ? ")" : character;
    } else {
      // Once a destination ends, only a title opener or the link closer can
      // follow. Other prose makes the construct invalid, so keep scanning HTML.
      return;
    }
  }
  return { end: raw.length, pending: true as const };
};

const findPendingDefinitionTitle = (
  raw: string,
  start: number,
  hasDestination: boolean
): MetadataRange | undefined => {
  let position = start;
  if (!hasDestination) {
    while (raw[position] === " " || raw[position] === "\t") position += 1;
    if (raw[position] === "<") {
      position += 1;
      while (position < raw.length && raw[position] !== ">") {
        if (raw[position] === "<" || /[\r\n]/.test(raw[position])) return;
        position += raw[position] === "\\" ? 2 : 1;
      }
      if (raw[position] !== ">") return;
      position += 1;
    } else {
      const destinationStart = position;
      while (position < raw.length && !/\s/.test(raw[position])) {
        if (raw[position] === "<" || raw[position] === ">") return;
        position += raw[position] === "\\" ? 2 : 1;
      }
      if (position === destinationStart) return;
    }
  }
  let newlines = 0;
  const whitespaceStart = position;
  while (position < raw.length && /\s/.test(raw[position])) {
    if (raw[position] === "\n" && ++newlines > 1) return;
    position += 1;
  }
  const opener = raw[position];
  if (
    position === whitespaceStart ||
    (opener !== '"' && opener !== "'" && opener !== "(")
  )
    return;
  const titleStart = position;
  const closer = opener === "(" ? ")" : opener;
  let newline = -1;
  for (position += 1; position < raw.length; position += 1) {
    const character = raw[position];
    if (character === "\n") {
      if (newline >= 0)
        return { start: titleStart, end: newline, pending: true };
      newline = position;
    } else if (!/[ \t\r]/.test(character)) {
      newline = -1;
    }
    if (character === "\\") position += 1;
    else if (character === closer) return;
  }
  return { start: titleStart, end: raw.length, pending: true };
};

const isDefinitionLabelStart = (raw: string, start: number) => {
  let position = start - 1;
  while (position >= 0 && raw[position] === " " && start - position <= 3)
    position -= 1;
  return position < 0 || raw[position] === "\n";
};

const collectLexicalRanges = (
  raw: string,
  literals: readonly CodeRange[],
  htmlBlocks: ReadonlyMap<number, number>,
  imageStarts: ReadonlySet<number>
) => {
  const comments: CodeRange[] = [];
  const metadata: MetadataRange[] = [];
  const labels: Array<{ start: number; image: boolean }> = [];
  let position = 0;
  let literalIndex = 0;
  let htmlBodyEnd = 0;
  let htmlNodeEnd = 0;
  let imageLabelStart = -1;
  const pendingImages = (end: number) => {
    for (const label of labels)
      if (label.image)
        metadata.push({
          start: label.start + 1,
          end,
          imageAltEnd: end,
          pending: true,
        });
  };
  while (position < raw.length) {
    while (literals[literalIndex]?.end <= position) literalIndex += 1;
    const literal = literals[literalIndex];
    if (literal && literal.start <= position) {
      if (
        imageStarts.has(literal.start) &&
        labels[labels.length - 1]?.start === literal.start - 1
      )
        labels.pop();
      position = literal.end;
      continue;
    }
    if (position >= htmlBodyEnd && position < htmlNodeEnd) {
      const fence = findResumedProseFence(raw, position);
      if (fence) {
        // The original HTML node can outlive its closed root. A resumed code
        // fence has its own lexical scope, including unfinished examples.
        labels.length = 0;
        position = fence.end;
        continue;
      }
    }
    if (raw[position] === "\\") {
      position += 2;
      continue;
    }
    if (raw[position] === "!" && raw[position + 1] === "[")
      imageLabelStart = position + 1;
    if (position >= htmlBodyEnd && raw[position] === "[")
      labels.push({ start: position, image: position === imageLabelStart });
    else if (position >= htmlBodyEnd && raw[position] === "]") {
      const label = labels.pop();
      if (label !== undefined) {
        if (label.image) {
          let tail: { end: number; pending?: true } | undefined;
          if (raw[position + 1] === "(")
            tail = findPendingLinkMetadataEnd(raw, position + 1);
          else if (position + 1 === raw.length)
            tail = { end: raw.length, pending: true };
          else if (raw[position + 1] === "[") {
            let end = position + 2;
            while (
              end < raw.length &&
              raw[end] !== "]" &&
              raw[end] !== "[" &&
              raw[end] !== "\n"
            )
              end += raw[end] === "\\" ? 2 : 1;
            if (end === raw.length || raw[end] === "]")
              tail = {
                end: raw[end] === "]" ? end + 1 : raw.length,
                pending: true,
              };
          }
          if (tail) {
            metadata.push({
              start: label.start + 1,
              imageAltEnd: position,
              ...tail,
            });
            position = tail.end;
            continue;
          }
        }
        if (
          !label.image &&
          raw[position + 1] === "(" &&
          literal?.start !== position + 1
        ) {
          const tail = findPendingLinkMetadataEnd(raw, position + 1);
          if (tail) {
            metadata.push({ start: position + 1, ...tail });
            position = tail.end;
            continue;
          }
        }
        if (
          raw[position + 1] === ":" &&
          isDefinitionLabelStart(raw, label.start)
        ) {
          const title = findPendingDefinitionTitle(raw, position + 2, false);
          if (title) {
            metadata.push({ ...title, start: position + 1 });
            position = title.end;
            continue;
          }
        }
      }
    } else if (raw[position] === "\n") {
      let previous = position - 1;
      while (/[ \t\r]/.test(raw[previous] ?? "")) previous -= 1;
      if (raw[previous] === "\n") {
        pendingImages(previous);
        labels.length = 0;
      }
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
      if (
        !markup.closing &&
        position >= htmlBodyEnd &&
        htmlBlocks.has(position)
      ) {
        // Block HTML bodies retain HTML semantics. Resume Markdown only after
        // adjacent roots end, even if their MDAST HTML node extends farther.
        htmlBodyEnd = findStreamingHtmlBlockEnd(raw, position);
        htmlNodeEnd = htmlBlocks.get(position)!;
        labels.length = 0;
      }
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
  pendingImages(raw.length);
  return { comments, metadata };
};

const mergeMetadataRanges = (ranges: MetadataRange[]) => {
  ranges.sort((left, right) => left.start - right.start);
  const merged: MetadataRange[] = [];
  for (const range of ranges) {
    const previous = merged[merged.length - 1];
    if (previous && range.start < previous.end) {
      merged[merged.length - 1] = Object.freeze({
        start: previous.start,
        end: Math.max(previous.end, range.end),
        ...(previous.pending || range.pending
          ? { pending: true as const }
          : {}),
        ...(previous.imageAltEnd !== undefined ||
        range.imageAltEnd !== undefined
          ? {
              imageAltEnd: Math.max(
                previous.imageAltEnd ?? 0,
                range.imageAltEnd ?? 0
              ),
            }
          : {}),
        ...(previous.imageResolveEnd !== undefined ||
        range.imageResolveEnd !== undefined
          ? {
              imageResolveEnd: Math.max(
                previous.imageResolveEnd ?? 0,
                range.imageResolveEnd ?? 0
              ),
            }
          : {}),
      });
    } else merged.push(Object.freeze(range));
  }
  return merged;
};

const findImageLabelEnd = (raw: string, start: number, end: number) => {
  let depth = 1;
  for (let position = start + 2; position < end; position += 1) {
    if (raw[position] === "\\") position += 1;
    else if (raw[position] === "[") depth += 1;
    else if (raw[position] === "]" && --depth === 0) return position + 1;
  }
  return end;
};

const parseCodeRanges = (raw: string): MarkdownSourceAnalysis => {
  const tree = parser.parse(raw);
  const inline: CodeRange[] = [];
  const markdown: CodeRange[] = [];
  const literal: CodeRange[] = [];
  const metadata: MetadataRange[] = [];
  const html: CodeRange[] = [];
  const htmlBlocks = new Map<number, number>();
  const definitionEnds = new Map<string, number>();
  const imageReferences = new Map<MetadataRange, string>();

  // Use the renderer's Markdown grammar, including HTML paragraph boundaries.
  visit(tree, (node, _index, parent) => {
    const start = node.position?.start.offset;
    const end = node.position?.end.offset;
    if (start === undefined || end === undefined) return;
    if (node.type === "definition" && !definitionEnds.has(node.identifier))
      definitionEnds.set(node.identifier, end);
    if (
      node.type === "definition" ||
      node.type === "link" ||
      node.type === "linkReference" ||
      node.type === "image" ||
      node.type === "imageReference"
    ) {
      let metadataStart = start;
      let imageAltEnd: number | undefined;
      if (node.type === "image" || node.type === "imageReference") {
        metadataStart = start + 2;
        imageAltEnd = findImageLabelEnd(raw, start, end) - 1;
      } else if (node.type !== "definition" && raw[start] === "[") {
        // Preserve label HTML, including real videos. Only destinations,
        // titles and reference identifiers after the label are inert.
        const labelEnd =
          node.children[node.children.length - 1]?.position?.end.offset ??
          start + 1;
        metadataStart = raw.indexOf("]", labelEnd) + 1;
        if (metadataStart <= labelEnd || metadataStart > end) return;
      }
      if (metadataStart < end) {
        const title =
          node.type === "definition" && !node.title
            ? findPendingDefinitionTitle(raw, end, true)
            : undefined;
        const range: MetadataRange = {
          start: metadataStart,
          end: title?.end ?? end,
          ...(title ? { pending: true as const } : {}),
          ...(imageAltEnd === undefined ? {} : { imageAltEnd }),
        };
        metadata.push(range);
        if (node.type === "imageReference")
          imageReferences.set(range, node.identifier);
      }
      return;
    }
    const isCode = node.type === "inlineCode" || node.type === "code";
    if (
      !isCode &&
      node.type !== "inlineMath" &&
      node.type !== "math" &&
      node.type !== "html"
    )
      return;
    const range = Object.freeze({ start, end });
    if (node.type === "html") {
      html.push(range);
      if (
        parent &&
        parent.type !== "paragraph" &&
        parent.type !== "heading" &&
        parent.type !== "tableCell" &&
        parent.type !== "link" &&
        parent.type !== "linkReference" &&
        parent.type !== "emphasis" &&
        parent.type !== "strong" &&
        parent.type !== "delete"
      )
        htmlBlocks.set(start, end);
      return;
    }
    literal.push(range);
    if (isCode) markdown.push(range);
    if (node.type === "inlineCode") inline.push(range);
  });

  // Parent link metadata follows its child label ranges in source order.
  const resolvedMetadata = metadata.map((range) => {
    const reference = imageReferences.get(range);
    return reference === undefined
      ? range
      : {
          ...range,
          imageResolveEnd: Math.max(
            range.end,
            definitionEnds.get(reference) ?? range.end
          ),
        };
  });
  const protectedRanges = [...literal, ...resolvedMetadata].sort(
    (left, right) => left.start - right.start
  );
  const lexical = collectLexicalRanges(
    raw,
    protectedRanges,
    htmlBlocks,
    new Set(
      resolvedMetadata
        .filter((range) => range.imageAltEnd !== undefined)
        .map((range) => range.start)
    )
  );
  const allMetadata = mergeMetadataRanges([
    ...resolvedMetadata,
    ...lexical.metadata,
  ]);
  const comments = lexical.comments;
  literal.push(...allMetadata, ...comments);
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
    metadata: Object.freeze(allMetadata),
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

// Native HTML stays inert inside code, math, comments, image alt and metadata.
export const getMarkdownLiteralRanges = (raw: string) =>
  getMarkdownSourceAnalysis(raw).literal;

export const getMarkdownSourceTree = (raw: string) =>
  getMarkdownSourceAnalysis(raw).tree;
