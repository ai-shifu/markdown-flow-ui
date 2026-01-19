// Normalize inline HTML indentation to avoid Markdown treating it as code block
export const normalizeInlineHtml = (markdown: string) => {
  const lines = markdown.split(/\r?\n/);
  let inFence = false;

  const normalized = lines.map((line) => {
    const trimmedStart = line.trimStart();
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
