import { getMarkdownCodeRanges } from "./inline-code-ranges";

// Normalize inline HTML indentation to avoid Markdown treating it as code block
export const normalizeInlineHtml = (
  markdown: string,
  codeRanges: readonly Readonly<{
    start: number;
    end: number;
  }>[] = getMarkdownCodeRanges(markdown)
) => {
  const lines = markdown.split(/\r?\n/);
  let codeIndex = 0;
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
      codeIndex < codeRanges.length &&
      codeRanges[codeIndex].end <= contentOffset
    ) {
      codeIndex += 1;
    }
    const codeRange = codeRanges[codeIndex];
    // Preserve inline and fenced block code, including container indentation.
    // Indented HTML alone still uses the existing HTML normalization behavior.
    const delimiter = codeRange && markdown[codeRange.start];
    if (
      codeRange &&
      codeRange.start <= contentOffset &&
      (delimiter === "`" || delimiter === "~")
    )
      return line;

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
