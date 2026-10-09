import { getInlineCodeRanges } from "./inline-code-ranges";

// Normalize inline HTML indentation to avoid Markdown treating it as code block
export const normalizeInlineHtml = (markdown: string) => {
  const lines = markdown.split(/\r?\n/);
  const inlineCodeRanges = getInlineCodeRanges(markdown);
  let inlineCodeIndex = 0;
  let nextLineOffset = 0;
  let inFence = false;

  const normalized = lines.map((line) => {
    const lineOffset = nextLineOffset;
    const lineEnd = lineOffset + line.length;
    // Markdown positions refer to the received string, before CRLF normalization.
    nextLineOffset =
      lineEnd +
      (markdown.startsWith("\r\n", lineEnd)
        ? 2
        : markdown[lineEnd] === "\n"
          ? 1
          : 0);
    const trimmedStart = line.trimStart();
    const contentOffset = lineOffset + line.length - trimmedStart.length;
    while (
      inlineCodeIndex < inlineCodeRanges.length &&
      inlineCodeRanges[inlineCodeIndex].end <= contentOffset
    ) {
      inlineCodeIndex += 1;
    }
    const inlineCodeRange = inlineCodeRanges[inlineCodeIndex];
    if (inlineCodeRange && inlineCodeRange.start <= contentOffset) return line;

    if (trimmedStart.startsWith("```")) {
      inFence = !inFence;
      return line;
    }
    if (inFence) return line;
    if (/^<[/!a-zA-Z]/.test(trimmedStart)) {
      return trimmedStart;
    }
    return line;
  });

  return normalized.join("\n");
};
