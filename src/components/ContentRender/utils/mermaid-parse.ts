export function parseMarkdownSegments(markdown: string) {
  const segments: Array<
    | { type: "text"; value: string }
    | { type: "mermaid"; value: string; complete: boolean }
  > = [];

  const regex = /```mermaid([\s\S]*?)```/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(markdown)) !== null) {
    const start = match.index;
    const end = regex.lastIndex;
    const code = match[1].trim();

    // Preceding plain text
    if (start > lastIndex) {
      segments.push({
        type: "text",
        value: markdown.slice(lastIndex, start),
      });
    }

    // Complete mermaid block
    segments.push({
      type: "mermaid",
      value: code,
      complete: true,
    });

    lastIndex = end;
  }

  // Check whether there is an unfinished mermaid block
  const incompleteStart = markdown.lastIndexOf("```mermaid");
  if (incompleteStart !== -1 && incompleteStart >= lastIndex) {
    const code = markdown.slice(incompleteStart + 10);
    segments.push({
      type: "mermaid",
      value: code.trim(),
      complete: false,
    });

    if (incompleteStart > lastIndex) {
      segments.unshift({
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
