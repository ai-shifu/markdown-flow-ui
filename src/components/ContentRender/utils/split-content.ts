export type RenderSegment =
  | { type: "markdown"; value: string }
  | { type: "sandbox"; value: string }
  | { type: "text"; value: string };

const SANDBOX_START_PATTERN =
  /<(script|style|link|iframe|html|head|body|meta|title|base|template|div|section|article|main)[\s>]/i;

const INLINE_SANDBOX_PATTERNS: RegExp[] = [
  /<svg[\s\S]*?<\/svg>/i,
  /<img\b[^>]*?>/i,
  /```mermaid[\s\S]*?```/i,
  /```[a-zA-Z0-9]+[\s\S]*?```/i,
];
const MARKDOWN_IMAGE_PATTERN = /!\[[^\]]*]\([^\s)\n]+(?:\s+"[^"]*")?\)/i;
const MARKDOWN_VIDEO_IFRAME_PATTERN =
  /<iframe\b[^>]*\bdata-tag\s*=\s*(["'])video\1[^>]*>[\s\S]*?<\/iframe>/i;

const closingBoundary = /<\/[a-z][^>]*>\s*\n(?=[^\s<])/gi;
const CUSTOM_BUTTON_PATTERN =
  /<custom-button-after-content\b[\s\S]*?<\/custom-button-after-content>/gi;

type MatchResult = { start: number; end: number };
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

const normalizeQuotedMermaidContent = (raw: string, keepText: boolean) => {
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
  return `${leadingLine}${mermaidMatch[0]}${trailingLine}`;
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

const isIndexInRanges = (index: number, ranges: FenceRange[]) =>
  ranges.some(({ start, end }) => index >= start && index < end);

const findFirstMatchOutsideFence = (
  raw: string,
  pattern: RegExp,
  fenceRanges: FenceRange[]
) => {
  const flags = pattern.flags.includes("g")
    ? pattern.flags
    : `${pattern.flags}g`;
  const matcher = new RegExp(pattern.source, flags);
  let match: RegExpExecArray | null;

  while ((match = matcher.exec(raw)) !== null) {
    if (!isIndexInRanges(match.index, fenceRanges)) {
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

const findInlineSandboxMatch = (raw: string): MatchResult | null => {
  let earliest: MatchResult | null = null;

  INLINE_SANDBOX_PATTERNS.forEach((pattern) => {
    const match = pattern.exec(raw);
    if (!match || typeof match.index !== "number") return;
    const start = match.index;
    const end = match.index + match[0].length;

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
  fenceRanges: FenceRange[]
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
  fenceRanges: FenceRange[]
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

const extractTableBlock = (
  raw: string
): { start: number; block: string; end: number } | null => {
  const tableMatch = raw.match(/^\s*\|.+\|\s*$/m);
  if (!tableMatch || typeof tableMatch.index !== "number") return null;

  const leadingSpaces = tableMatch[0].match(/^\s*/)?.[0].length ?? 0;
  const tableStart = tableMatch.index + leadingSpaces;

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

// Split incoming markdown content into markdown and sandbox HTML segments
export const splitContentSegments = (
  raw: string,
  keepText = false
): RenderSegment[] => {
  const source = normalizeQuotedMermaidContent(raw, keepText);
  const finalizeSegments = (segments: RenderSegment[]) =>
    splitCustomButtonsFromSandbox(segments);

  const fenceBlock = extractFirstFenceBlock(source);
  if (fenceBlock) {
    if (!fenceBlock.complete) {
      if (keepText) {
        return finalizeSegments([{ type: "markdown", value: source }]);
      }
      return finalizeSegments([{ type: "markdown", value: fenceBlock.block }]);
    }

    if (!keepText) {
      return finalizeSegments([{ type: "markdown", value: fenceBlock.block }]);
    }

    const segments: RenderSegment[] = [];
    const before = source.slice(0, fenceBlock.start);
    const normalizedBefore = normalizeBeforeFenceText(before);
    if (normalizedBefore.trim()) {
      segments.push({ type: "text", value: normalizedBefore });
    }

    segments.push({ type: "markdown", value: fenceBlock.block });

    const after = source.slice(fenceBlock.end);
    if (after.trim()) {
      segments.push(...splitContentSegments(after, true));
    }

    return finalizeSegments(segments);
  }

  const fenceRanges = getFenceRanges(source);
  // Avoid treating fenced code blocks as sandbox content.
  const sandboxStartIndex = findFirstMatchOutsideFence(
    source,
    SANDBOX_START_PATTERN,
    fenceRanges
  );
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
      if (before.trim()) {
        segments.push({ type: "text", value: before });
      }
      segments.push({ type: "markdown", value: svgBlock });
      if (after.trim()) {
        segments.push(...splitContentSegments(after, true));
      }
      return finalizeSegments(segments);
    }

    if (closeIdx === -1) {
      return finalizeSegments([{ type: "markdown", value: svgBlock }]);
    }
  }

  const tableBlock = extractTableBlock(source);
  if (tableBlock) {
    const segments: RenderSegment[] = [];
    const before = source.slice(0, tableBlock.start);
    if (keepText && before.trim()) {
      segments.push(...splitContentSegments(before, true));
    }
    segments.push({ type: "markdown", value: tableBlock.block });
    const after = source.slice(tableBlock.end);
    const hasProgress = after.length < source.length;
    if (after.trim() && hasProgress) {
      segments.push(
        ...(keepText
          ? splitContentSegments(after, true)
          : splitContentSegments(after))
      );
    }
    return finalizeSegments(segments);
  }

  const inlineMatch = findInlineSandboxMatch(source);
  const markdownImageMatch = findMarkdownImageMatch(source, fenceRanges);
  const markdownVideoIframeMatch = findMarkdownVideoIframeMatch(
    source,
    fenceRanges
  );
  const inlineCandidate = pickEarliestMatch(
    inlineMatch,
    markdownImageMatch,
    markdownVideoIframeMatch
  );

  if (sandboxStartIndex === -1 && !inlineCandidate) {
    if (keepText && source.trim()) {
      return finalizeSegments([{ type: "text", value: source }]);
    }
    return [];
  }

  const shouldUseInline =
    !!inlineCandidate &&
    (sandboxStartIndex === -1 || inlineCandidate.start <= sandboxStartIndex);

  const startIndex = shouldUseInline
    ? inlineCandidate!.start
    : sandboxStartIndex;
  const blockEnd = shouldUseInline
    ? inlineCandidate!.end
    : findHtmlBlockEnd(source, startIndex);

  const segments: RenderSegment[] = [];
  const before = source.slice(0, startIndex);
  const matchedBlock = source.slice(startIndex, blockEnd);
  const isVideoIframeMatch =
    shouldUseInline && isMarkdownVideoIframe(matchedBlock);
  const normalizedBefore = isVideoIframeMatch ? before.trimEnd() : before;
  const after = source.slice(blockEnd);
  const normalizedAfter = isVideoIframeMatch ? after.trimStart() : after;

  if (keepText && normalizedBefore.trim()) {
    segments.push({ type: "text", value: normalizedBefore });
  }

  segments.push({
    type: shouldUseInline ? "markdown" : "sandbox",
    value: matchedBlock,
  });

  if (normalizedAfter.trim()) {
    segments.push(...splitContentSegments(normalizedAfter, keepText));
  }

  return finalizeSegments(segments);
};
