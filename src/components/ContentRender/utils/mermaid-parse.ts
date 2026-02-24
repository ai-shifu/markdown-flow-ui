export function parseMarkdownSegments(markdown: string) {
  const segments: Array<
    | { type: "text"; value: string }
    | { type: "mermaid"; value: string; complete: boolean }
    | { type: "svg"; value: string; complete: boolean }
  > = [];

  // Match:
  // 1. Generic code blocks (including mermaid): ``` ... ```
  // 2. SVG blocks: <svg ... </svg>
  const regex = /```[\s\S]*?```|<svg[\s\S]*?<\/svg>/g;

  const getLineRange = (index: number) => {
    const lineStart = markdown.lastIndexOf("\n", index - 1) + 1;
    const nextBreak = markdown.indexOf("\n", index);
    const lineEnd = nextBreak === -1 ? markdown.length : nextBreak;
    return { lineStart, lineEnd };
  };

  const isIndexInsideMarkdownTableLine = (index: number) => {
    const { lineStart, lineEnd } = getLineRange(index);
    const line = markdown.slice(lineStart, lineEnd).trimStart();
    return line.startsWith("|");
  };

  const isIndexInsideInlineCode = (index: number) => {
    const { lineStart, lineEnd } = getLineRange(index);
    const line = markdown.slice(lineStart, lineEnd);
    const relativeIndex = index - lineStart;
    let cursor = 0;
    let inCode = false;
    let delimiterLength = 0;

    while (cursor < relativeIndex) {
      if (line[cursor] !== "`") {
        cursor += 1;
        continue;
      }

      let runEnd = cursor;
      while (runEnd < line.length && line[runEnd] === "`") {
        runEnd += 1;
      }
      const runLength = runEnd - cursor;

      if (!inCode) {
        inCode = true;
        delimiterLength = runLength;
      } else if (runLength === delimiterLength) {
        inCode = false;
        delimiterLength = 0;
      }

      cursor = runEnd;
    }

    return inCode;
  };

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(markdown)) !== null) {
    const start = match.index;
    const end = regex.lastIndex;
    const rawMatch = match[0];

    if (
      rawMatch.startsWith("<svg") &&
      (isIndexInsideMarkdownTableLine(start) || isIndexInsideInlineCode(start))
    ) {
      continue;
    }

    // Preceding plain text
    if (start > lastIndex) {
      segments.push({
        type: "text",
        value: markdown.slice(lastIndex, start),
      });
    }

    // Complete mermaid block, generic code block, or svg block
    if (rawMatch.startsWith("```mermaid")) {
      const code = rawMatch
        .replace(/^```mermaid/, "")
        .replace(/```$/, "")
        .trim();
      segments.push({
        type: "mermaid",
        value: code,
        complete: true,
      });
    } else if (rawMatch.startsWith("```")) {
      // Generic code block - treat as text so ReactMarkdown renders it
      segments.push({
        type: "text",
        value: rawMatch,
      });
    } else {
      // SVG block
      segments.push({
        type: "svg",
        value: rawMatch,
        complete: true,
      });
    }

    lastIndex = end;
  }

  // Handle unfinished svg block to avoid leaking raw tags while streaming
  let incompleteSvgStart = markdown.lastIndexOf("<svg");
  const lastSvgClose = markdown.lastIndexOf("</svg>");

  // If we haven't found an open <svg tag (or the last one is closed),
  // check if the string ends with a partial <svg tag (<s, <sv).
  if (
    incompleteSvgStart === -1 ||
    (lastSvgClose !== -1 && lastSvgClose > incompleteSvgStart)
  ) {
    if (markdown.endsWith("<sv")) {
      incompleteSvgStart = markdown.length - 3;
    } else if (markdown.endsWith("<s")) {
      incompleteSvgStart = markdown.length - 2;
    }
  }

  // Check if we are inside an unclosed code block
  // If an unclosed code block starts AFTER the last complete segment (lastIndex),
  // and BEFORE the potential SVG start, then the SVG is inside the code block.
  const incompleteCodeBlockStart = markdown.indexOf("```", lastIndex);
  const isInsideCodeBlock =
    incompleteCodeBlockStart !== -1 &&
    incompleteCodeBlockStart < incompleteSvgStart;

  const hasIncompleteSvg =
    !isInsideCodeBlock &&
    incompleteSvgStart !== -1 &&
    (lastSvgClose === -1 || lastSvgClose < incompleteSvgStart) &&
    incompleteSvgStart >= lastIndex;

  if (hasIncompleteSvg) {
    if (incompleteSvgStart > lastIndex) {
      segments.push({
        type: "text",
        value: markdown.slice(lastIndex, incompleteSvgStart),
      });
    }

    segments.push({
      type: "svg",
      value: markdown.slice(incompleteSvgStart),
      complete: false,
    });
    return segments;
  }

  // Check whether there is an unfinished mermaid block
  // Only if we are NOT inside a generic incomplete code block that started earlier
  // Actually, standard mermaid block starts with ```mermaid, so it IS a code block start.
  // We just need to check if it's specifically mermaid.
  const incompleteStart = markdown.lastIndexOf("```mermaid");
  if (
    incompleteStart !== -1 &&
    incompleteStart >= lastIndex &&
    // Ensure this mermaid block isn't inside another code block (unlikely but safe to check)
    // Actually, incompleteCodeBlockStart would capture this "```mermaid" as just "```"
    // so we need to be careful.
    // If incompleteCodeBlockStart points to THIS mermaid block, we process it as mermaid.
    incompleteStart === incompleteCodeBlockStart
  ) {
    const code = markdown.slice(incompleteStart + 10);
    segments.push({
      type: "mermaid",
      value: code.trim(),
      complete: false,
    });

    if (incompleteStart > lastIndex) {
      segments.push({
        type: "text",
        value: markdown.slice(lastIndex, incompleteStart),
      });
    }

    return segments;
  }

  // Remaining text
  if (lastIndex < markdown.length) {
    segments.push({
      type: "text",
      value: markdown.slice(lastIndex),
    });
  }

  return segments;
}

export function parseMermaidBlocks(fullMarkdown: string) {
  const blocks = [];
  const lines: string[] = fullMarkdown.split(/\r?\n/);

  let inside = false;
  let current: string[] = [];
  let startLine = 0;

  lines.forEach((line, index) => {
    if (!inside) {
      if (line.trim().startsWith("```mermaid")) {
        inside = true;
        startLine = index;
        current = [];
      }
      return;
    }

    // inside mermaid mode
    if (line.trim() === "```") {
      // block complete
      blocks.push({
        code: current.join("\n").trim(),
        startLine,
        endLine: index,
        complete: true,
      });
      inside = false;
      return;
    }

    current.push(line);
  });

  // if still inside → incomplete block
  if (inside) {
    blocks.push({
      code: current.join("\n").trim(),
      startLine,
      endLine: null,
      complete: false,
    });
  }

  return blocks;
}

/**
 * Determine whether the mermaid block for the given codeString is fully closed.
 * @param fullMarkdown Full markdown text (grows over time in streaming scenarios)
 * @param codeString Mermaid block code passed to the renderer (children)
 */
export function mermaidBlockIsComplete(
  fullMarkdown: string,
  codeString: string
) {
  const cleaned = codeString.trim();
  const blocks = parseMermaidBlocks(fullMarkdown);
  // Locate the block that matches the current codeString
  const block = blocks.find((b) => b.code === cleaned);

  if (!block) return false;

  // Block is complete when the closing fence already exists
  return block.complete;
}
