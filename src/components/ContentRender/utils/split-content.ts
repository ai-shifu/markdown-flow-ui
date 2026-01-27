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

// Split incoming markdown content into markdown and sandbox HTML segments
export const splitContentSegments = (
  raw: string,
  keepText = false
): RenderSegment[] => {
  const svgOpenIndex = raw.search(/<svg\b/i);
  if (svgOpenIndex !== -1 && raw.indexOf("</svg>", svgOpenIndex) === -1) {
    return [{ type: "markdown", value: raw }];
  }

  const completeSvgMatch = raw.match(/<svg[\s\S]*?<\/svg>/i);
  if (completeSvgMatch && keepText) {
    if (!raw.trim().toLowerCase().endsWith("</svg>")) {
      return [{ type: "markdown", value: `${raw}</svg>` }];
    }
    return [{ type: "markdown", value: raw }];
  }

  const sandboxStartIndex = raw.search(SANDBOX_START_PATTERN);
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
