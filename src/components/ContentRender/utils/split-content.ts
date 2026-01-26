export type RenderSegment =
  | { type: "markdown"; value: string }
  | { type: "sandbox"; value: string };

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

// Split incoming markdown content into markdown and sandbox HTML segments
export const splitContentSegments = (raw: string): RenderSegment[] => {
  const sandboxStartIndex = raw.search(SANDBOX_START_PATTERN);
  const inlineMatch = findInlineSandboxMatch(raw);

  if (sandboxStartIndex === -1 && !inlineMatch) {
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
  const matchedBlock = raw.slice(startIndex, blockEnd);
  const after = raw.slice(blockEnd);

  segments.push({
    type: shouldUseInline ? "markdown" : "sandbox",
    value: matchedBlock,
  });

  if (after.trim()) {
    segments.push(...splitContentSegments(after));
  }

  return segments;
};
