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

const closingBoundary = /<\/[a-z][^>]*>\s*\n(?=[^\s<])/gi;

type MatchResult = { start: number; end: number };

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
  const fenceStart = raw.indexOf("```");
  if (keepText && fenceStart !== -1) {
    const closingFence = raw.indexOf("```", fenceStart + 3);
    if (closingFence === -1) {
      return [{ type: "markdown", value: raw }];
    }
  }

  const sandboxStartIndex = raw.search(SANDBOX_START_PATTERN);
  const svgOpenIndex = raw.search(/<svg\b/i);
  const hasSandboxBeforeSvg =
    sandboxStartIndex !== -1 &&
    svgOpenIndex !== -1 &&
    sandboxStartIndex < svgOpenIndex;
  if (svgOpenIndex !== -1 && !hasSandboxBeforeSvg) {
    const before = raw.slice(0, svgOpenIndex);
    const closeIdx = raw.indexOf("</svg>", svgOpenIndex);
    const svgBlock =
      closeIdx === -1
        ? `${raw.slice(svgOpenIndex)}</svg>`
        : raw.slice(svgOpenIndex, closeIdx + "</svg>".length);
    const after = closeIdx === -1 ? "" : raw.slice(closeIdx + "</svg>".length);

    if (keepText) {
      const segments: RenderSegment[] = [];
      if (before.trim()) {
        segments.push({ type: "text", value: before });
      }
      segments.push({ type: "markdown", value: svgBlock });
      if (after.trim()) {
        segments.push(...splitContentSegments(after, true));
      }
      return segments;
    }

    if (closeIdx === -1) {
      return [{ type: "markdown", value: svgBlock }];
    }
  }

  const tableBlock = extractTableBlock(raw);
  if (tableBlock) {
    const segments: RenderSegment[] = [];
    const before = raw.slice(0, tableBlock.start);
    if (keepText && before.trim()) {
      segments.push({ type: "text", value: before });
    }
    segments.push({ type: "markdown", value: tableBlock.block });
    const after = raw.slice(tableBlock.end);
    const hasProgress = after.length < raw.length;
    if (after.trim() && hasProgress) {
      segments.push(
        ...(keepText
          ? splitContentSegments(after, true)
          : splitContentSegments(after))
      );
    }
    return segments;
  }

  const inlineMatch = findInlineSandboxMatch(raw);

  if (sandboxStartIndex === -1 && !inlineMatch) {
    if (keepText && raw.trim()) {
      return [{ type: "text", value: raw }];
    }
    return [];
  }

  const shouldUseInline =
    !!inlineMatch &&
    (sandboxStartIndex === -1 || inlineMatch.start < sandboxStartIndex);

  const startIndex = shouldUseInline ? inlineMatch!.start : sandboxStartIndex;
  const blockEnd = shouldUseInline
    ? inlineMatch!.end
    : findHtmlBlockEnd(raw, startIndex);

  const segments: RenderSegment[] = [];
  const before = raw.slice(0, startIndex);
  const matchedBlock = raw.slice(startIndex, blockEnd);
  const after = raw.slice(blockEnd);

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

  return segments;
};
