const unescapeMarkdown = (markdownText: string): string => {
  // Escape character mapping table
  const escapeMap: Record<string, string> = {
    "\\\\": "\\", // Backslash
    "\\n": "\n", // Newline
    "\\r": "\r", // Carriage return
    "\\t": "\t", // Tab
    '\\"': '"', // Double quote
    "\\'": "'", // Single quote
    "\\b": "\b", // Backspace
    "\\f": "\f", // Form feed
  };

  // Regular expression for processing escape sequences
  const escapeRegex = /\\[\\nrt"'bf]|\\u([0-9a-fA-F]{4})/g;

  return markdownText.replace(
    escapeRegex,
    (match: string, hex?: string): string => {
      // Handle Unicode escape sequences (\uXXXX)
      if (hex) {
        return String.fromCharCode(parseInt(hex, 16));
      }

      // Handle other escape sequences
      return escapeMap[match] || match;
    }
  );
};

const processMarkdownText = (text: string): string => {
  // 1. Process escape characters
  let processed = unescapeMarkdown(text);

  // 2. Fix common double-escape issues
  processed = processed.replace(/\\\\n/g, "\n").replace(/\\\\t/g, "\t");

  // 3. Normalize line endings (Windows -> Unix)
  processed = processed.replace(/\r\n/g, "\n");

  // 4. Ensure double newlines between paragraphs
  processed = processed.replace(/\n{3,}/g, "\n\n");

  // 5. Handle special spaces
  processed = processed.replace(/&nbsp;|\u00A0/g, " ");

  return processed || "";
};

export { unescapeMarkdown, processMarkdownText };
