import type { Element } from "./types";

type DiffHunk = {
  oldStart: number;
  lines: string[];
};

type ParsedUnifiedDiff = {
  targetIndex: number;
  hunks: DiffHunk[];
};

type DiffContentParts = {
  patchText?: string;
  trailingContent?: string;
};

const DIFF_BLOCK_PATTERN = /!\+\+\+\s*([\s\S]*?)\s*!\+\+\+/;
const HUNK_HEADER_PATTERN = /^@@\s+-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s+@@/;

const isComparableLineMatch = (sourceLine: string, expectedLine: string) =>
  sourceLine === expectedLine || sourceLine.trim() === expectedLine.trim();

export const splitDiffContent = (content?: string): DiffContentParts => {
  if (!content) {
    return {};
  }

  const matched = content.match(DIFF_BLOCK_PATTERN);

  if (!matched) {
    return {
      trailingContent: content.trim() || undefined,
    };
  }

  const patchText = matched[1]?.trim();
  const trailingContent = content
    .slice(matched.index + matched[0].length)
    .trim();

  return {
    patchText: patchText || undefined,
    trailingContent: trailingContent || undefined,
  };
};

export const parseUnifiedDiff = (
  patchText: string
): ParsedUnifiedDiff | null => {
  const lines = patchText.split("\n");
  const targetMatch = lines[0]?.match(/^---\s+a\/(\d+)/);
  const nextMatch = lines[1]?.match(/^\+\+\+\s+b\/(\d+)/);

  if (!targetMatch || !nextMatch || targetMatch[1] !== nextMatch[1]) {
    return null;
  }

  const hunks: DiffHunk[] = [];
  let currentHunk: DiffHunk | null = null;

  lines.slice(2).forEach((line) => {
    const headerMatch = line.match(HUNK_HEADER_PATTERN);

    if (headerMatch) {
      if (currentHunk) {
        hunks.push(currentHunk);
      }

      currentHunk = {
        oldStart: Number.parseInt(headerMatch[1], 10),
        lines: [],
      };
      return;
    }

    if (currentHunk) {
      currentHunk.lines.push(line);
    }
  });

  if (currentHunk) {
    hunks.push(currentHunk);
  }

  if (hunks.length === 0) {
    return null;
  }

  return {
    targetIndex: Number.parseInt(targetMatch[1], 10),
    hunks,
  };
};

export const applyUnifiedDiff = (
  source: string,
  patchText: string
): string | null => {
  const parsed = parseUnifiedDiff(patchText);

  if (!parsed) {
    return null;
  }

  const sourceLines = source.split("\n");
  const resultLines: string[] = [];
  let sourceCursor = 0;

  for (const hunk of parsed.hunks) {
    const hunkStartIndex = Math.max(hunk.oldStart - 1, 0);

    while (sourceCursor < hunkStartIndex && sourceCursor < sourceLines.length) {
      resultLines.push(sourceLines[sourceCursor]);
      sourceCursor += 1;
    }

    for (const line of hunk.lines) {
      const marker = line[0];
      const expectedLine = line.slice(1);

      if (marker === " ") {
        const currentLine = sourceLines[sourceCursor];

        if (
          currentLine == null ||
          !isComparableLineMatch(currentLine, expectedLine)
        ) {
          return null;
        }

        resultLines.push(currentLine);
        sourceCursor += 1;
        continue;
      }

      if (marker === "-") {
        const currentLine = sourceLines[sourceCursor];

        if (
          currentLine == null ||
          !isComparableLineMatch(currentLine, expectedLine)
        ) {
          return null;
        }

        sourceCursor += 1;
        continue;
      }

      if (marker === "+") {
        resultLines.push(expectedLine);
        continue;
      }

      if (marker === "\\") {
        continue;
      }
    }
  }

  while (sourceCursor < sourceLines.length) {
    resultLines.push(sourceLines[sourceCursor]);
    sourceCursor += 1;
  }

  return resultLines.join("\n");
};

export const applyDiffElement = (
  currentList: Element[],
  diffElement: Element
): Element[] | null => {
  const content =
    typeof diffElement.content === "string" ? diffElement.content : undefined;
  const { patchText, trailingContent } = splitDiffContent(content);

  if (!patchText) {
    return trailingContent
      ? [
          ...currentList,
          {
            ...diffElement,
            type: "text",
            content: trailingContent,
          },
        ]
      : null;
  }

  const parsed = parseUnifiedDiff(patchText);

  if (!parsed) {
    return null;
  }

  const targetElement = currentList[parsed.targetIndex];
  const targetContent =
    typeof targetElement?.content === "string"
      ? targetElement.content
      : undefined;

  if (!targetElement || !targetContent) {
    return null;
  }

  const patchedContent = applyUnifiedDiff(targetContent, patchText);

  if (!patchedContent) {
    return null;
  }

  const nextList = currentList.map((element, index) =>
    index === parsed.targetIndex
      ? {
          ...element,
          content: patchedContent,
        }
      : element
  );

  if (!trailingContent) {
    return nextList;
  }

  return [
    ...nextList,
    {
      ...diffElement,
      type: "text",
      content: trailingContent,
    },
  ];
};
