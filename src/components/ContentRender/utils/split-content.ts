export type RenderSegment =
  | { type: "markdown"; value: string }
  | { type: "sandbox"; value: string };

// Split incoming markdown content into markdown and sandbox HTML segments
export const splitContentSegments = (raw: string): RenderSegment[] => {
  const startPattern =
    /<(script|style|link|iframe|html|head|body|meta|title|base|template|div|section|article|main)[\s>]/i;

  const startIndex = raw.search(startPattern);
  if (startIndex === -1) {
    return [{ type: "markdown", value: raw }];
  }

  const closingBoundary = /<\/[a-z][^>]*>\s*\n(?=[^\s<])/gi;
  let blockEnd = raw.length;
  let match: RegExpExecArray | null;

  while ((match = closingBoundary.exec(raw))) {
    if (match.index <= startIndex) continue;
    blockEnd = match.index + match[0].length - 1;
    break;
  }

  const segments: RenderSegment[] = [];
  const before = raw.slice(0, startIndex);
  const htmlBlock = raw.slice(startIndex, blockEnd);
  const after = raw.slice(blockEnd);

  if (before.trim()) {
    segments.push({ type: "markdown", value: before });
  }

  segments.push({ type: "sandbox", value: htmlBlock });

  if (after.trim()) {
    segments.push(...splitContentSegments(after));
  }

  return segments;
};
