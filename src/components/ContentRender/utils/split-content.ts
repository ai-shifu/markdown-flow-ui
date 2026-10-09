import {
  getInlineCodeRanges,
  getMarkdownSourceAnalysis,
  type MarkdownSourceAnalysis,
} from "./inline-code-ranges";
import {
  findStreamingHtmlBlockEnd,
  findStreamingHtmlElementEnd,
  isHtmlRawTextTag,
  readHtmlMarkup,
} from "./html-block-end";

export type RenderSegment =
  | {
      type: "markdown";
      value: string;
      /** Render received HTML without spending the prose typewriter budget. */
      immediate?: true;
      /** A native HTML header has not arrived fully, so it cannot mount yet. */
      pending?: true;
    }
  | { type: "sandbox"; value: string }
  | { type: "text"; value: string };

const SANDBOX_START_PATTERN =
  /<(?:!doctype(?=[\s>])|(?:script|style|link|iframe|html|head|body|meta|title|base|template|div|section|article|main)[\s/>])/i;

// Keep streaming block roots aligned with markdown-flow 0.3.4 while retaining
// document roots supported by the existing UI. Inline formatting stays Markdown.
const STREAMING_SANDBOX_ROOTS = new Set([
  "div",
  "style",
  "script",
  "iframe",
  "section",
  "article",
  "header",
  "footer",
  "nav",
  "main",
  "aside",
  "figure",
  "details",
  "summary",
  "form",
  "table",
  "canvas",
  "video",
  "audio",
  "pre",
  "blockquote",
  "ul",
  "ol",
  "dl",
  "fieldset",
  "address",
  "hgroup",
  "center",
  "link",
  "html",
  "head",
  "body",
  "meta",
  "title",
  "base",
  "template",
]);

// These authored HTML blocks already use the host's Markdown components and
// styles. Reveal their received HTML immediately without moving it into an iframe.
const NATIVE_MARKDOWN_HTML_ROOTS = new Set([
  "pre",
  "details",
  "summary",
  "aside",
  "blockquote",
  "ul",
  "ol",
  "dl",
  "table",
]);
const WIDGET_RESOURCE_ROOTS = new Set([
  "script",
  "style",
  "link",
  "iframe",
  "html",
  "head",
  "body",
  "meta",
  "title",
  "base",
  "template",
]);

const INLINE_SANDBOX_PATTERNS: RegExp[] = [
  /<svg[\s\S]*?<\/svg>/i,
  /<img\b[^>]*?>/i,
  /```mermaid[\s\S]*?```/i,
  /```[a-zA-Z0-9]+[\s\S]*?```/i,
];
const MARKDOWN_IMAGE_PATTERN = /!\[[^\]]*]\([^\s)\n]+(?:\s+"[^"]*")?\)/i;
const STREAMING_MARKDOWN_IMAGE_PATTERN = new RegExp(
  MARKDOWN_IMAGE_PATTERN.source,
  "iy"
);
const MARKDOWN_VIDEO_IFRAME_PATTERN =
  /<iframe\b[^>]*\bdata-tag\s*=\s*(["'])video\1[^>]*>[\s\S]*?<\/iframe>/i;

const closingBoundary = /<\/[a-z][^>]*>\s*\n(?=[^\s<])/gi;
const CUSTOM_BUTTON_PATTERN =
  /<custom-button-after-content\b[\s\S]*?<\/custom-button-after-content>/gi;

type MatchResult = {
  start: number;
  end: number;
  immediate?: true;
  pending?: true;
};
type FenceRange = { start: number; end: number };
type FenceBlock =
  | { start: number; end: number; block: string; complete: true }
  | { start: number; block: string; complete: false };

const WRAPPED_QUOTES_PATTERN = /^"[\s\S]*"$/;
const MERMAID_BLOCK_PATTERN = /```mermaid[\s\S]*?```/i;

const firstNonEmptyLine = (content: string) =>
  content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean) ?? "";

const extractFirstFenceBlock = (raw: string): FenceBlock | null => {
  const start = raw.indexOf("```");
  if (start === -1) return null;

  const closing = raw.indexOf("```", start + 3);
  if (closing === -1) {
    return {
      start,
      block: raw.slice(start),
      complete: false,
    };
  }

  return {
    start,
    end: closing + 3,
    block: raw.slice(start, closing + 3),
    complete: true,
  };
};

const normalizeBeforeFenceText = (before: string) => {
  const nonEmptyLines = before
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (nonEmptyLines.length <= 1) return before;
  return nonEmptyLines[0];
};

const normalizeQuotedMermaidContent = (
  raw: string,
  keepText: boolean,
  preserveFenceLines = false
) => {
  if (!WRAPPED_QUOTES_PATTERN.test(raw)) return raw;

  const unwrapped = raw.slice(1, -1);
  if (!keepText) return unwrapped;

  const mermaidMatch = unwrapped.match(MERMAID_BLOCK_PATTERN);
  if (!mermaidMatch || typeof mermaidMatch.index !== "number") {
    return unwrapped;
  }

  const before = unwrapped.slice(0, mermaidMatch.index);
  const after = unwrapped.slice(mermaidMatch.index + mermaidMatch[0].length);
  const leadingLine = firstNonEmptyLine(before);
  const trailingLine = firstNonEmptyLine(after);

  if (!leadingLine || !trailingLine) {
    return unwrapped;
  }

  // Keep the essential nearby text around the mermaid block in wrapped payloads.
  const boundary = preserveFenceLines ? "\n" : "";
  return `${leadingLine}${boundary}${mermaidMatch[0]}${boundary}${trailingLine}`;
};

// Preserve the legacy component's wrapped-sandbox projection without changing
// literal quoted prose or making streaming HTML use the legacy block splitter.
export const normalizeWrappedSandboxContent = (raw: string) => {
  if (!WRAPPED_QUOTES_PATTERN.test(raw)) return raw;
  const legacySegments = splitContentSegments(raw, true);
  return legacySegments.some((segment) => segment.type === "sandbox")
    ? normalizeQuotedMermaidContent(raw, true, true)
    : raw;
};

const getFenceRanges = (raw: string): FenceRange[] => {
  const ranges: FenceRange[] = [];
  const fencePattern = /```/g;
  let match: RegExpExecArray | null;

  while ((match = fencePattern.exec(raw)) !== null) {
    const start = match.index;
    const closeMatch = fencePattern.exec(raw);
    if (!closeMatch) {
      ranges.push({ start, end: raw.length });
      break;
    }
    ranges.push({ start, end: closeMatch.index + 3 });
  }

  return ranges;
};

const isEscaped = (raw: string, index: number) => {
  let backslashes = 0;
  for (let i = index - 1; i >= 0 && raw[i] === "\\"; i--) backslashes++;
  return backslashes % 2 === 1;
};

const isIndexInRanges = (index: number, ranges: readonly FenceRange[]) =>
  ranges.some(({ start, end }) => index >= start && index < end);

const findFirstMatchOutsideFence = (
  raw: string,
  pattern: RegExp,
  fenceRanges: readonly FenceRange[]
) => {
  const flags = pattern.flags.includes("g")
    ? pattern.flags
    : `${pattern.flags}g`;
  const matcher = new RegExp(pattern.source, flags);
  let match: RegExpExecArray | null;

  while ((match = matcher.exec(raw)) !== null) {
    if (
      !isEscaped(raw, match.index) &&
      !isIndexInRanges(match.index, fenceRanges)
    ) {
      return match.index;
    }
  }

  return -1;
};

const findHtmlBlockEnd = (raw: string, startIndex: number) => {
  let blockEnd = raw.length;
  let match: RegExpExecArray | null;
  closingBoundary.lastIndex = 0;

  while ((match = closingBoundary.exec(raw))) {
    if (match.index <= startIndex) continue;
    blockEnd = match.index + match[0].length;
    break;
  }

  return blockEnd;
};

const splitCustomButtonsFromSandbox = (segments: RenderSegment[]) => {
  if (!segments.length) return segments;
  const output: RenderSegment[] = [];

  segments.forEach((segment) => {
    if (segment.type !== "sandbox") {
      output.push(segment);
      return;
    }

    CUSTOM_BUTTON_PATTERN.lastIndex = 0;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = CUSTOM_BUTTON_PATTERN.exec(segment.value)) !== null) {
      const before = segment.value.slice(lastIndex, match.index);
      if (before.trim()) {
        output.push({ type: "sandbox", value: before });
      }
      output.push({ type: "markdown", value: match[0] });
      lastIndex = match.index + match[0].length;
    }

    const rest = segment.value.slice(lastIndex);
    if (rest.trim()) {
      output.push({ type: "sandbox", value: rest });
    }
  });

  return output;
};

const findInlineSandboxMatch = (
  raw: string,
  codeRanges?: readonly FenceRange[]
): MatchResult | null => {
  let earliest: MatchResult | null = null;

  INLINE_SANDBOX_PATTERNS.forEach((pattern) => {
    const start = codeRanges
      ? findFirstMatchOutsideFence(raw, pattern, codeRanges)
      : (pattern.exec(raw)?.index ?? -1);
    if (start === -1) return;
    const match = pattern.exec(raw.slice(start));
    if (!match) return;
    const end = start + match[0].length;

    if (!earliest || start < earliest.start) {
      earliest = { start, end };
    }
  });

  return earliest;
};

const pickEarliestMatch = (...matches: Array<MatchResult | null>) =>
  matches.reduce<MatchResult | null>((earliest, match) => {
    if (!match) return earliest;
    if (!earliest || match.start < earliest.start) return match;
    return earliest;
  }, null);

const findMarkdownImageMatch = (
  raw: string,
  fenceRanges: readonly FenceRange[]
): MatchResult | null => {
  const start = findFirstMatchOutsideFence(
    raw,
    MARKDOWN_IMAGE_PATTERN,
    fenceRanges
  );

  if (start === -1) return null;
  const match = raw.slice(start).match(MARKDOWN_IMAGE_PATTERN);
  if (!match) return null;

  return { start, end: start + match[0].length };
};

const findMarkdownVideoIframeMatch = (
  raw: string,
  fenceRanges: readonly FenceRange[]
): MatchResult | null => {
  const start = findFirstMatchOutsideFence(
    raw,
    MARKDOWN_VIDEO_IFRAME_PATTERN,
    fenceRanges
  );

  if (start === -1) return null;
  const match = raw.slice(start).match(MARKDOWN_VIDEO_IFRAME_PATTERN);
  if (!match) return null;

  return { start, end: start + match[0].length };
};

const isMarkdownVideoIframe = (value: string) =>
  MARKDOWN_VIDEO_IFRAME_PATTERN.test(value.trim());

const findStreamingVideoIframeMatch = (
  raw: string,
  start: number
): MatchResult | null => {
  if (start === -1) return null;
  const prefix = raw.slice(start);
  const nameMatch = /^<([a-z]+)/i.exec(prefix);
  if (!nameMatch) return null;
  const name = nameMatch[1].toLowerCase();
  const pending = (): MatchResult => ({
    start,
    end: raw.length,
    immediate: true,
    pending: true,
  });
  if (nameMatch[0].length === prefix.length && "iframe".startsWith(name)) {
    return pending();
  }
  if (name !== "iframe" || !/[\s/>]/.test(prefix[nameMatch[0].length] ?? "")) {
    return null;
  }

  // A quoted '>' belongs to an attribute, not the end of the opening header.
  const attributesStart = start + nameMatch[0].length;
  let quote = "";
  let openingEnd = -1;
  for (let index = attributesStart; index < raw.length; index += 1) {
    const character = raw[index];
    if (quote) {
      if (character === quote) quote = "";
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === ">") {
      openingEnd = index + 1;
      break;
    }
  }
  if (openingEnd === -1) return pending();

  // Tokenize whole attributes so marker-looking text in another value is inert.
  const attributes = raw.slice(attributesStart, openingEnd - 1);
  const attributePattern =
    /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]*)))?/g;
  let attribute: RegExpExecArray | null;
  let isVideo = false;
  while ((attribute = attributePattern.exec(attributes)) !== null) {
    if (attribute[1].toLowerCase() === "data-tag") {
      isVideo =
        (attribute[2] ?? attribute[3] ?? attribute[4] ?? "").toLowerCase() ===
        "video";
      break;
    }
  }
  if (!isVideo) return null;

  // A video is one raw-text element, not an HTML run containing later siblings.
  const closing = /<\/iframe\s*>/i.exec(raw.slice(openingEnd));
  return {
    start,
    end: closing ? openingEnd + closing.index + closing[0].length : raw.length,
    immediate: true,
  };
};

const extractTableBlock = (
  raw: string,
  codeRanges: readonly FenceRange[]
): { start: number; block: string; end: number } | null => {
  const tablePattern = /^\s*\|.+\|\s*$/gm;
  let tableMatch: RegExpExecArray | null;
  let tableStart = -1;
  while ((tableMatch = tablePattern.exec(raw)) !== null) {
    const leadingSpaces = tableMatch[0].match(/^\s*/)?.[0].length ?? 0;
    const start = tableMatch.index + leadingSpaces;
    if (isIndexInRanges(start, codeRanges)) continue;
    tableStart = start;
    break;
  }
  if (tableStart === -1) return null;

  const lines = raw.slice(tableStart).split("\n");
  const tableLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) break;
    tableLines.push(line);
  }

  const block = tableLines.join("\n");
  return { start: tableStart, block, end: tableStart + block.length };
};

type StreamingMatch = FenceRange & {
  type: "markdown" | "sandbox";
  immediate?: true;
  pending?: true;
};

const isStreamingSandboxStart = (source: string, start: number) => {
  const name = /^<([a-z][a-z0-9:-]*)(?=[\s/>])/i.exec(source.slice(start));
  return name
    ? STREAMING_SANDBOX_ROOTS.has(name[1].toLowerCase())
    : /^<!doctype(?=[\s>])/i.test(source.slice(start));
};

const isNativeMarkdownHtmlStart = (source: string, start: number) => {
  const name = /^<([a-z][a-z0-9:-]*)(?=[\s/>])/i.exec(source.slice(start));
  return Boolean(name && NATIVE_MARKDOWN_HTML_ROOTS.has(name[1].toLowerCase()));
};

// Native presentation blocks containing widget resources need the
// sandbox. Header attributes, comments and raw-text examples are not resources.
const containsWidgetResources = (
  source: string,
  start: number,
  end: number
) => {
  let position = start;
  while (position < end) {
    if (source[position] !== "<") {
      position += 1;
      continue;
    }
    const markup = readHtmlMarkup(source, position);
    const resourceName =
      markup.kind === "tag"
        ? markup.closing
          ? undefined
          : markup.name
        : /^<([a-z][a-z0-9:-]*)(?=[\s/>])/i
            .exec(source.slice(position))?.[1]
            .toLowerCase();
    if (resourceName && WIDGET_RESOURCE_ROOTS.has(resourceName)) {
      const video =
        resourceName === "iframe" &&
        findStreamingVideoIframeMatch(source, position);
      // An unfinished iframe header cannot mount. Keep its current native
      // container until a complete header establishes whether it is a widget.
      if (!video) return true;
    }
    if (markup.kind === "incomplete" || markup.kind === "invalid") {
      if (markup.kind === "incomplete") break;
      position += 1;
      continue;
    }
    if (markup.kind === "tag" && !markup.closing) {
      if (isHtmlRawTextTag(markup.name)) {
        position = findStreamingHtmlElementEnd(source, position);
        continue;
      }
    }
    position = markup.end;
  }
  return false;
};

const findResumedProseFence = (source: string, start: number) => {
  if (start > 0 && source[start - 1] !== "\n") return;
  const opening = /^ {0,3}(`{3,}|~{3,})([^\r\n]*)(?:\r?\n|$)/.exec(
    source.slice(start)
  );
  if (!opening || (opening[1][0] === "`" && opening[2].includes("`"))) return;
  const closing = new RegExp(
    `^ {0,3}${opening[1][0]}{${opening[1].length},}[ \\t]*\\r?$`,
    "gm"
  );
  closing.lastIndex = start + opening[0].length;
  const end = closing.exec(source);
  return {
    start,
    end: end ? end.index + end[0].length : source.length,
    type: "markdown" as const,
  };
};

// A Markdown HTML node can extend past our closed root until the next blank
// line. Only that resumed prose needs a small lexical fallback for literals;
// code/math inside the actual HTML element remains HTML.
const resumedProseLiteralIndex = (source: string) => {
  const nextClosing = new Map<number, number>();
  const delimiters = [...source.matchAll(/`+|\$+/g)];
  const nextByMarker = new Map<string, number>();
  for (let index = delimiters.length - 1; index >= 0; index -= 1) {
    const match = delimiters[index];
    const marker = match[0];
    const next = nextByMarker.get(marker);
    if (next !== undefined) nextClosing.set(match.index, next + marker.length);
    if (marker[0] === "`" || !isEscaped(source, match.index))
      nextByMarker.set(marker, match.index);
  }
  const boundaries: number[] = [];
  let offset = 0;
  for (const line of source.split("\n")) {
    const contentStart = offset + (line.match(/^[ \t]*/)?.[0].length ?? 0);
    if (!line.trim() || isStreamingSandboxStart(source, contentStart))
      boundaries.push(offset);
    offset += line.length + 1;
  }
  return { nextClosing, boundaries };
};

const findResumedProseLiteralEnd = (
  source: string,
  start: number,
  index: ReturnType<typeof resumedProseLiteralIndex>
) => {
  const marker = source[start];
  if ((marker !== "`" && marker !== "$") || isEscaped(source, start)) return;
  let width = 1;
  while (source[start + width] === marker) width += 1;
  const markerEnd = start + width;
  const end =
    marker === "$" && width > 2 ? undefined : index.nextClosing.get(start);
  if (end === undefined) return { markerEnd };
  if (marker === "$" && width === 2) return { markerEnd, end };
  let low = 0;
  let high = index.boundaries.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (index.boundaries[middle] <= start) low = middle + 1;
    else high = middle;
  }
  return end <= (index.boundaries[low] ?? source.length)
    ? { markerEnd, end }
    : { markerEnd };
};

const appendStreamingSandbox = (
  source: string,
  match: StreamingMatch,
  segments: RenderSegment[]
) => {
  let start = match.start;
  let position = start;
  while (position < match.end) {
    if (source[position] !== "<") {
      position += 1;
      continue;
    }
    const markup = readHtmlMarkup(source, position);
    if (markup.kind === "incomplete") break;
    if (markup.kind === "invalid") {
      position += 1;
      continue;
    }
    if (markup.kind === "tag" && !markup.closing) {
      if (markup.name === "custom-button-after-content") {
        const end = Math.min(
          findStreamingHtmlElementEnd(source, position),
          match.end
        );
        if (
          /<\/custom-button-after-content\s*>$/i.test(
            source.slice(position, end)
          )
        ) {
          if (position > start)
            segments.push({
              type: "sandbox",
              value: source.slice(start, position),
            });
          segments.push({
            type: "markdown",
            value: source.slice(position, end),
          });
          start = end;
          position = end;
          continue;
        }
      }
      if (isHtmlRawTextTag(markup.name)) {
        position = findStreamingHtmlElementEnd(source, position);
        continue;
      }
    }
    position = markup.end;
  }
  if (start < match.end)
    segments.push({ type: "sandbox", value: source.slice(start, match.end) });
};

const streamingTableRanges = (
  source: string,
  literals: readonly FenceRange[],
  matches: readonly StreamingMatch[]
) => {
  const tables: StreamingMatch[] = [];
  const lines = source.split("\n");
  let offset = 0;
  let literalIndex = 0;
  let matchIndex = 0;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const start = offset + (line.match(/^[ \t]*/)?.[0].length ?? 0);
    while (literals[literalIndex]?.end <= start) literalIndex += 1;
    const literal = literals[literalIndex];
    if (
      /^[ \t]*\|.+\|[ \t]*\r?$/.test(line) &&
      !(literal && literal.start <= start)
    ) {
      let end = offset + line.length;
      while (
        index + 1 < lines.length &&
        lines[index + 1].trim().startsWith("|")
      ) {
        offset += lines[index].length + 1;
        index += 1;
        end = offset + lines[index].length;
      }
      while (matches[matchIndex]?.end <= start) matchIndex += 1;
      if (!(matches[matchIndex]?.start < end))
        tables.push({ start, end, type: "markdown" });
    }
    offset += lines[index].length + 1;
  }
  return tables;
};

const splitStreamingContent = (
  source: string,
  keepText: boolean,
  analysis: MarkdownSourceAnalysis
): RenderSegment[] => {
  const matches: StreamingMatch[] = [];
  const comments = new Set(analysis.comments);
  // Comments are scanned lexically below. This also handles Markdown prose
  // resumed inside a source HTML node, where fenced examples can contain '<!--'.
  const literals = analysis.literal.filter((range) => !comments.has(range));
  const actualLiterals: FenceRange[] = [];
  let literalIndex = 0;
  let fenceIndex = 0;
  let htmlIndex = 0;
  let position = 0;
  let resumedProse = false;
  let resumedLiterals: ReturnType<typeof resumedProseLiteralIndex> | undefined;
  while (position < source.length) {
    while (analysis.fences[fenceIndex]?.end <= position) fenceIndex += 1;
    const sourceFence = analysis.fences[fenceIndex];
    if (sourceFence?.start === position) {
      matches.push({ ...sourceFence, type: "markdown" });
      actualLiterals.push(sourceFence);
      position = sourceFence.end;
      continue;
    }
    while (literals[literalIndex]?.end <= position) literalIndex += 1;
    const literal = literals[literalIndex];
    if (literal && literal.start <= position) {
      actualLiterals.push(literal);
      position = literal.end;
      continue;
    }
    while (analysis.html[htmlIndex]?.end <= position) htmlIndex += 1;
    const html = analysis.html[htmlIndex];
    if (resumedProse && html && html.start <= position) {
      const fence = findResumedProseFence(source, position);
      if (fence) {
        matches.push(fence);
        actualLiterals.push(fence);
        position = fence.end;
        continue;
      }
      if (source[position] === "`" || source[position] === "$")
        resumedLiterals ??= resumedProseLiteralIndex(source);
      const proseLiteral =
        resumedLiterals &&
        findResumedProseLiteralEnd(source, position, resumedLiterals);
      if (proseLiteral) {
        if (proseLiteral.end !== undefined)
          actualLiterals.push({ start: position, end: proseLiteral.end });
        position = proseLiteral.end ?? proseLiteral.markerEnd;
        continue;
      }
    }
    if (source[position] === "!" && !isEscaped(source, position)) {
      STREAMING_MARKDOWN_IMAGE_PATTERN.lastIndex = position;
      const image = STREAMING_MARKDOWN_IMAGE_PATTERN.exec(source);
      if (image) {
        matches.push({
          start: position,
          end: position + image[0].length,
          type: "markdown",
        });
        position += image[0].length;
        continue;
      }
    }
    if (source[position] !== "<" || isEscaped(source, position)) {
      position += 1;
      continue;
    }
    const markup = readHtmlMarkup(source, position);
    if (isStreamingSandboxStart(source, position)) {
      const video = findStreamingVideoIframeMatch(source, position);
      const nativeRoot = isNativeMarkdownHtmlStart(source, position);
      const end =
        video?.end ??
        (nativeRoot
          ? findStreamingHtmlElementEnd(source, position)
          : findStreamingHtmlBlockEnd(source, position, (nextRoot) => {
              const nextVideo = findStreamingVideoIframeMatch(source, nextRoot);
              return (
                Boolean(nextVideo && !nextVideo.pending) ||
                isNativeMarkdownHtmlStart(source, nextRoot)
              );
            }));
      const nativeHtml =
        nativeRoot && !containsWidgetResources(source, position, end);
      matches.push({
        start: position,
        end,
        type: video || nativeHtml ? "markdown" : "sandbox",
        ...(video?.immediate || nativeHtml ? { immediate: true as const } : {}),
        ...(video?.pending || (nativeHtml && markup.kind === "incomplete")
          ? { pending: true as const }
          : {}),
      });
      position = end;
      resumedProse = true;
      continue;
    }
    if (markup.kind === "tag") {
      if (!markup.closing && (markup.name === "svg" || markup.name === "img")) {
        const end =
          markup.name === "img"
            ? markup.end
            : findStreamingHtmlElementEnd(source, position);
        matches.push({ start: position, end, type: "markdown" });
        position = end;
      } else if (!markup.closing && isHtmlRawTextTag(markup.name)) {
        const end = findStreamingHtmlElementEnd(source, position);
        actualLiterals.push({ start: position, end });
        position = end;
      } else {
        position = markup.end;
      }
    } else if (markup.kind === "comment" || markup.kind === "declaration") {
      if (markup.kind === "comment")
        actualLiterals.push({ start: position, end: markup.end });
      position = markup.end;
    } else if (markup.kind === "incomplete") {
      // The rest belongs to this unfinished token, including quoted attributes.
      if (/^<svg(?=[\s/>])/i.test(source.slice(position)))
        matches.push({ start: position, end: source.length, type: "markdown" });
      position = source.length;
    } else {
      position += 1;
    }
  }
  const tables = streamingTableRanges(source, actualLiterals, matches);
  const orderedMatches: StreamingMatch[] = [];
  let tableIndex = 0;
  for (const match of matches) {
    while (tables[tableIndex]?.start < match.start)
      orderedMatches.push(tables[tableIndex++]);
    orderedMatches.push(match);
  }
  orderedMatches.push(...tables.slice(tableIndex));

  const segments: RenderSegment[] = [];
  let cursor = 0;
  for (const match of orderedMatches) {
    if (match.start < cursor) continue;
    if (keepText && match.start > cursor)
      segments.push({ type: "text", value: source.slice(cursor, match.start) });
    if (match.type === "sandbox")
      appendStreamingSandbox(source, match, segments);
    else
      segments.push({
        type: "markdown",
        value: source.slice(match.start, match.end),
        ...(match.immediate ? { immediate: true as const } : {}),
        ...(match.pending ? { pending: true as const } : {}),
      });
    cursor = match.end;
  }
  if (keepText && cursor < source.length)
    segments.push({ type: "text", value: source.slice(cursor) });
  return segments;
};

// Split incoming markdown content into markdown and sandbox HTML segments.
// Streaming always scans the received source in absolute coordinates. The legacy
// projection below keeps the public non-streaming splitter's existing behavior.
export const splitContentSegments = (
  raw: string,
  keepText = false,
  streaming = false,
  sourceAnalysis?: MarkdownSourceAnalysis
): RenderSegment[] => {
  if (streaming)
    return splitStreamingContent(
      raw,
      keepText,
      sourceAnalysis ?? getMarkdownSourceAnalysis(raw)
    );
  const source = normalizeQuotedMermaidContent(raw, keepText);
  const finalizeSegments = (segments: RenderSegment[]) =>
    splitCustomButtonsFromSandbox(segments);
  const hasText = (value: string) => Boolean(value.trim());
  const codeRanges = getInlineCodeRanges(source);
  const fenceBlock = extractFirstFenceBlock(source);
  const fenceRanges = [...getFenceRanges(source), ...codeRanges];
  const sandboxStartIndex = findFirstMatchOutsideFence(
    source,
    SANDBOX_START_PATTERN,
    fenceRanges
  );

  if (fenceBlock) {
    if (!fenceBlock.complete) {
      return finalizeSegments([
        { type: "markdown", value: keepText ? source : fenceBlock.block },
      ]);
    }
    if (!keepText)
      return finalizeSegments([{ type: "markdown", value: fenceBlock.block }]);

    const segments: RenderSegment[] = [];
    const before = normalizeBeforeFenceText(source.slice(0, fenceBlock.start));
    if (hasText(before)) segments.push({ type: "text", value: before });
    segments.push({ type: "markdown", value: fenceBlock.block });
    const after = source.slice(fenceBlock.end);
    if (hasText(after)) segments.push(...splitContentSegments(after, true));
    return finalizeSegments(segments);
  }

  const svgOpenIndex = findFirstMatchOutsideFence(
    source,
    /<svg\b/i,
    fenceRanges
  );
  const hasSandboxBeforeSvg =
    sandboxStartIndex !== -1 &&
    svgOpenIndex !== -1 &&
    sandboxStartIndex < svgOpenIndex;
  const markdownImageBeforeSvg = findMarkdownImageMatch(source, fenceRanges);
  const hasMarkdownImageBeforeSvg =
    !!markdownImageBeforeSvg &&
    svgOpenIndex !== -1 &&
    markdownImageBeforeSvg.start < svgOpenIndex;
  if (
    svgOpenIndex !== -1 &&
    !hasSandboxBeforeSvg &&
    !hasMarkdownImageBeforeSvg
  ) {
    const before = source.slice(0, svgOpenIndex);
    const closeIdx = source.indexOf("</svg>", svgOpenIndex);
    const svgBlock =
      closeIdx === -1
        ? `${source.slice(svgOpenIndex)}</svg>`
        : source.slice(svgOpenIndex, closeIdx + "</svg>".length);
    const after =
      closeIdx === -1 ? "" : source.slice(closeIdx + "</svg>".length);
    if (keepText) {
      const segments: RenderSegment[] = [];
      if (hasText(before)) segments.push({ type: "text", value: before });
      segments.push({ type: "markdown", value: svgBlock });
      if (hasText(after)) segments.push(...splitContentSegments(after, true));
      return finalizeSegments(segments);
    }
    if (closeIdx === -1)
      return finalizeSegments([{ type: "markdown", value: svgBlock }]);
  }

  const tableBlock = extractTableBlock(source, []);
  if (tableBlock) {
    const segments: RenderSegment[] = [];
    const before = source.slice(0, tableBlock.start);
    if (keepText && hasText(before))
      segments.push(...splitContentSegments(before, true));
    segments.push({ type: "markdown", value: tableBlock.block });
    const after = source.slice(tableBlock.end);
    if (hasText(after) && after.length < source.length)
      segments.push(...splitContentSegments(after, keepText));
    return finalizeSegments(segments);
  }

  const inlineCandidate = pickEarliestMatch(
    findInlineSandboxMatch(source),
    findMarkdownImageMatch(source, fenceRanges),
    findMarkdownVideoIframeMatch(source, fenceRanges)
  );
  if (sandboxStartIndex === -1 && !inlineCandidate)
    return keepText && hasText(source) ? [{ type: "text", value: source }] : [];

  const shouldUseInline =
    !!inlineCandidate &&
    (sandboxStartIndex === -1 || inlineCandidate.start <= sandboxStartIndex);
  const startIndex = shouldUseInline
    ? inlineCandidate!.start
    : sandboxStartIndex;
  const blockEnd = shouldUseInline
    ? inlineCandidate!.end
    : findHtmlBlockEnd(source, startIndex);
  const matchedBlock = source.slice(startIndex, blockEnd);
  const isVideo = shouldUseInline && isMarkdownVideoIframe(matchedBlock);
  const before = isVideo
    ? source.slice(0, startIndex).trimEnd()
    : source.slice(0, startIndex);
  const after = isVideo
    ? source.slice(blockEnd).trimStart()
    : source.slice(blockEnd);
  const segments: RenderSegment[] = [];
  if (keepText && hasText(before))
    segments.push({ type: "text", value: before });
  segments.push({
    type: shouldUseInline ? "markdown" : "sandbox",
    value: matchedBlock,
  });
  if (hasText(after)) segments.push(...splitContentSegments(after, keepText));
  return finalizeSegments(segments);
};
