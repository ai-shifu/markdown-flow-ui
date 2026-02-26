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

const closingBoundary = /<\/[a-z][^>]*>\s*\n(?=[^\s<])/gi;
const CUSTOM_BUTTON_PATTERN =
  /<custom-button-after-content\b[\s\S]*?<\/custom-button-after-content>/gi;

type MatchResult = { start: number; end: number };
type FenceRange = { start: number; end: number };

const WRAPPED_QUOTES_PATTERN = /^"[\s\S]*"$/;
const MERMAID_BLOCK_PATTERN = /```mermaid[\s\S]*?```/i;

const firstNonEmptyLine = (content: string) =>
  content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean) ?? "";

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

  const fenceStart = source.indexOf("```");
  if (keepText && fenceStart !== -1) {
    const closingFence = source.indexOf("```", fenceStart + 3);
    if (closingFence === -1) {
      return finalizeSegments([{ type: "markdown", value: source }]);
    }
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
  if (svgOpenIndex !== -1 && !hasSandboxBeforeSvg) {
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
      segments.push({ type: "text", value: before });
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
  const inlineCandidate =
    inlineMatch && markdownImageMatch
      ? inlineMatch.start <= markdownImageMatch.start
        ? inlineMatch
        : markdownImageMatch
      : (inlineMatch ?? markdownImageMatch);

  if (sandboxStartIndex === -1 && !inlineCandidate) {
    if (keepText && source.trim()) {
      return finalizeSegments([{ type: "text", value: source }]);
    }
    return [];
  }

  const shouldUseInline =
    !!inlineCandidate &&
    (sandboxStartIndex === -1 || inlineCandidate.start < sandboxStartIndex);

  const startIndex = shouldUseInline
    ? inlineCandidate!.start
    : sandboxStartIndex;
  const blockEnd = shouldUseInline
    ? inlineCandidate!.end
    : findHtmlBlockEnd(source, startIndex);

  const segments: RenderSegment[] = [];
  const before = source.slice(0, startIndex);
  const matchedBlock = source.slice(startIndex, blockEnd);
  const after = source.slice(blockEnd);

  if (keepText && before.trim()) {
    segments.push({ type: "text", value: before });
  }

  segments.push({
    type: shouldUseInline ? "markdown" : "sandbox",
    value: matchedBlock,
  });

  if (after.trim()) {
    segments.push(...splitContentSegments(after, keepText));
  }

  return finalizeSegments(segments);
};
