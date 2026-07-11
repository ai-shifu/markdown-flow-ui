import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import { createVariableExpressionRegexp } from "../utils";

const broadVariableRegex = /\{\{.*?\}\}/g;
const commentRegex = /<!--[\s\S]*?-->/g;
const controlBlockRegex = /\?\[(.*?)\]/g;

export interface SyntaxHighlightRange {
  from: number;
  to: number;
  className: string;
}

function collectMultilineFixedOutputRanges(
  docText: string
): SyntaxHighlightRange[] {
  const ranges: SyntaxHighlightRange[] = [];
  let pendingStart: number | null = null;
  let lineStart = 0;

  while (lineStart <= docText.length) {
    const newlineIndex = docText.indexOf("\n", lineStart);
    const lineEnd = newlineIndex === -1 ? docText.length : newlineIndex;
    const lineText = docText.slice(lineStart, lineEnd);

    if (lineText.trim() === "!===") {
      if (pendingStart === null) {
        pendingStart = lineStart;
      } else {
        ranges.push({
          from: pendingStart,
          to: lineEnd,
          className: "syntax-fixed",
        });
        pendingStart = null;
      }
    }

    if (newlineIndex === -1) {
      break;
    }

    lineStart = newlineIndex + 1;
  }

  return ranges;
}

function collectSingleLineFixedOutputRanges(
  docText: string,
  commentRanges: SyntaxHighlightRange[]
): SyntaxHighlightRange[] {
  const ranges: SyntaxHighlightRange[] = [];
  let commentIndex = 0;

  const isInsideComment = (index: number) => {
    while (
      commentIndex < commentRanges.length &&
      commentRanges[commentIndex].to <= index
    ) {
      commentIndex++;
    }

    const range = commentRanges[commentIndex];
    return !!range && index >= range.from && index < range.to;
  };

  let lineStart = 0;
  while (lineStart <= docText.length) {
    const newlineIndex = docText.indexOf("\n", lineStart);
    const lineEnd = newlineIndex === -1 ? docText.length : newlineIndex;
    const lineText = docText.slice(lineStart, lineEnd);
    const markerPositions: number[] = [];
    let searchFrom = 0;

    while (searchFrom < lineText.length) {
      const markerOffset = lineText.indexOf("===", searchFrom);
      if (markerOffset === -1) {
        break;
      }

      const markerIndex = lineStart + markerOffset;
      const isNegated = markerIndex > 0 && docText[markerIndex - 1] === "!";
      if (!isNegated && !isInsideComment(markerIndex)) {
        markerPositions.push(markerIndex);
      }

      searchFrom = markerOffset + 3;
    }

    for (let i = 0; i + 1 < markerPositions.length; i += 2) {
      ranges.push({
        from: markerPositions[i],
        to: markerPositions[i + 1] + 3,
        className: "syntax-fixed",
      });
    }

    if (newlineIndex === -1) {
      break;
    }

    lineStart = newlineIndex + 1;
  }

  return ranges;
}

function collectCommentRanges(docText: string): SyntaxHighlightRange[] {
  const ranges: SyntaxHighlightRange[] = [];
  let match;

  commentRegex.lastIndex = 0;
  while ((match = commentRegex.exec(docText)) !== null) {
    ranges.push({
      from: match.index,
      to: match.index + match[0].length,
      className: "syntax-comment",
    });
  }

  return ranges;
}

/**
 * Collects non-overlapping fixed-output and comment wrapper ranges.
 *
 * @param docText - Document text to scan.
 * @returns Outer syntax highlight ranges sorted by document position.
 */
export function collectOuterBlockRanges(
  docText: string
): SyntaxHighlightRange[] {
  const commentRanges = collectCommentRanges(docText);
  const blockRanges = [
    ...collectMultilineFixedOutputRanges(docText),
    ...collectSingleLineFixedOutputRanges(docText, commentRanges),
    ...commentRanges,
  ].sort((a, b) => {
    if (a.from !== b.from) return a.from - b.from;
    return b.to - a.to;
  });

  const outerRanges: SyntaxHighlightRange[] = [];

  for (const range of blockRanges) {
    const lastOuter = outerRanges[outerRanges.length - 1];
    if (!lastOuter || range.from >= lastOuter.to) {
      outerRanges.push(range);
    }
  }

  return outerRanges;
}

/**
 * Collects all custom syntax highlight ranges for editor decorations.
 *
 * @param docText - Document text to scan.
 * @param isCursorInside - Returns true when the current cursor is inside a range.
 * @returns Non-overlapping syntax highlight ranges sorted by document position.
 */
export function collectSyntaxHighlightRanges(
  docText: string,
  isCursorInside: (from: number, to: number) => boolean = () => false
): SyntaxHighlightRange[] {
  const matches: SyntaxHighlightRange[] = [];
  const occupied: { from: number; to: number }[] = [];

  controlBlockRegex.lastIndex = 0;

  // Prevent overlapping decorations so styling stays deterministic
  const isOverlapping = (from: number, to: number) =>
    occupied.some((range) => !(to <= range.from || from >= range.to));

  const addMatch = (from: number, to: number, className: string) => {
    if (from >= to) return false;
    if (isOverlapping(from, to)) return false;
    occupied.push({ from, to });
    matches.push({ from, to, className });
    return true;
  };

  const classifyVariable = (raw: string) => {
    const inner = raw.slice(2, -2).trim();
    if (!inner) return { className: "syntax-variable-invalid", valid: false };
    const strict = createVariableExpressionRegexp();
    const strictMatch = strict.exec(raw);
    const valid =
      !!strictMatch && strictMatch.index === 0 && strictMatch[0] === raw;
    return {
      className: valid ? "syntax-variable" : "syntax-variable-invalid",
      valid,
    };
  };

  let match;

  // 1. Outer block ranges win over any syntax inside them.
  for (const range of collectOuterBlockRanges(docText)) {
    addMatch(range.from, range.to, range.className);
  }

  // 2. Control Blocks
  while ((match = controlBlockRegex.exec(docText)) !== null) {
    const fullStart = match.index;
    const fullEnd = match.index + match[0].length;
    const content = match[1];
    const contentStart = fullStart + 2; // after ?[
    if (isOverlapping(fullStart, fullEnd)) {
      continue;
    }

    // Outer brackets and question mark
    addMatch(fullStart, fullStart + 1, "syntax-keyword"); // ?
    addMatch(fullStart + 1, fullStart + 2, "syntax-bracket"); // [
    addMatch(fullEnd - 1, fullEnd, "syntax-bracket"); // ]

    if (content.startsWith("%")) {
      // Input / Select
      const contentVariableRegex = /\{\{.*?\}\}/g;
      const firstVariableMatch = contentVariableRegex.exec(content);
      contentVariableRegex.lastIndex = 0;
      let percentClass = "syntax-percent-invalid";
      if (firstVariableMatch) {
        const classification = classifyVariable(firstVariableMatch[0]);
        const varFrom = contentStart + firstVariableMatch.index;
        const varTo = varFrom + firstVariableMatch[0].length;
        const cursorInsideVar = isCursorInside(varFrom, varTo);
        percentClass =
          classification.valid && !cursorInsideVar
            ? "syntax-percent-valid"
            : "syntax-percent-invalid";
      }
      addMatch(contentStart, contentStart + 1, percentClass); // %

      const operatorRanges: { from: number; to: number }[] = [];
      const variableRanges: { from: number; to: number; className: string }[] =
        [];
      const appliedTokenRanges: { from: number; to: number }[] = [];

      // Inner operators | || ...
      const innerRegex = /(\|\||\||\.\.\.)/g;
      let innerMatch;
      while ((innerMatch = innerRegex.exec(content)) !== null) {
        operatorRanges.push({
          from: contentStart + innerMatch.index,
          to: contentStart + innerMatch.index + innerMatch[0].length,
        });
      }

      // Variables inside control block content
      let innerVariableMatch;
      const innerVariableRegex = /\{\{.*?\}\}/g;
      while ((innerVariableMatch = innerVariableRegex.exec(content)) !== null) {
        const rawVariable = innerVariableMatch[0];
        const classification = classifyVariable(rawVariable);
        variableRanges.push({
          from: contentStart + innerVariableMatch.index,
          to: contentStart + innerVariableMatch.index + rawVariable.length,
          className: classification.className,
        });
      }

      const allTokens = [
        ...operatorRanges.map((range) => ({
          ...range,
          className: "syntax-keyword",
        })),
        ...variableRanges.map((range) => ({
          ...range,
          className: range.className,
        })),
      ].sort((a, b) => {
        if (a.from !== b.from) return a.from - b.from;
        return a.to - b.to;
      });

      for (const token of allTokens) {
        if (
          token.className.startsWith("syntax-variable") &&
          isCursorInside(token.from, token.to)
        ) {
          continue;
        }
        if (addMatch(token.from, token.to, token.className)) {
          appliedTokenRanges.push({ from: token.from, to: token.to });
        }
      }

      // Content (Dark Blue) for remaining text segments
      const stringStart = contentStart + 1;
      const stringEnd = fullEnd - 1;
      let cursor = stringStart;
      const sortedApplied = appliedTokenRanges.sort((a, b) => {
        if (a.from !== b.from) return a.from - b.from;
        return a.to - b.to;
      });

      for (const token of sortedApplied) {
        if (cursor < token.from) {
          addMatch(cursor, token.from, "syntax-string");
        }
        cursor = Math.max(cursor, token.to);
      }
      if (cursor < stringEnd) {
        addMatch(cursor, stringEnd, "syntax-string");
      }
    } else {
      // Button ?[text]
      const variableRanges: { from: number; to: number; className: string }[] =
        [];
      const appliedVariableRanges: { from: number; to: number }[] = [];

      let innerVariableMatch;
      const innerVariableRegex = /\{\{.*?\}\}/g;
      while ((innerVariableMatch = innerVariableRegex.exec(content)) !== null) {
        const rawVariable = innerVariableMatch[0];
        const classification = classifyVariable(rawVariable);
        variableRanges.push({
          from: contentStart + innerVariableMatch.index,
          to: contentStart + innerVariableMatch.index + rawVariable.length,
          className: classification.className,
        });
      }

      const sortedVariables = variableRanges.sort((a, b) => {
        if (a.from !== b.from) return a.from - b.from;
        return a.to - b.to;
      });

      for (const variable of sortedVariables) {
        if (
          variable.className.startsWith("syntax-variable") &&
          isCursorInside(variable.from, variable.to)
        ) {
          continue;
        }
        if (addMatch(variable.from, variable.to, variable.className)) {
          appliedVariableRanges.push({ from: variable.from, to: variable.to });
        }
      }

      const buttonTextStart = contentStart;
      const buttonTextEnd = fullEnd - 1;
      let cursor = buttonTextStart;

      for (const variable of appliedVariableRanges) {
        if (cursor < variable.from) {
          addMatch(cursor, variable.from, "syntax-button-text");
        }
        cursor = Math.max(cursor, variable.to);
      }
      if (cursor < buttonTextEnd) {
        addMatch(cursor, buttonTextEnd, "syntax-button-text");
      }
    }
  }

  // 3. Variables (only if not already decorated; invalid ones stay default outside control blocks)
  broadVariableRegex.lastIndex = 0;
  while ((match = broadVariableRegex.exec(docText)) !== null) {
    const text = match[0];
    const classification = classifyVariable(text);
    if (
      classification.valid &&
      !isCursorInside(match.index, match.index + match[0].length)
    ) {
      addMatch(
        match.index,
        match.index + match[0].length,
        classification.className
      );
    }
  }

  // Sort matches by 'from' asc, then 'to' desc (longest first)
  matches.sort((a, b) => {
    if (a.from !== b.from) return a.from - b.from;
    return b.to - a.to;
  });

  return matches;
}

function buildDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const docText = view.state.doc.toString();
  const matches = collectSyntaxHighlightRanges(docText, (from, to) => {
    return view.state.selection.ranges.some((range) => {
      return range.from >= from && range.to <= to;
    });
  });

  for (const m of matches) {
    if (m.from < m.to) {
      try {
        builder.add(m.from, m.to, Decoration.mark({ class: m.className }));
      } catch (e) {
        console.warn("SyntaxHighlighter: Failed to add decoration", m, e);
      }
    }
  }

  return builder.finish();
}

const SyntaxHighlighter = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged || update.selectionSet) {
        this.decorations = buildDecorations(update.view);
      }
    }
  },
  {
    decorations: (instance) => instance.decorations,
  }
);

export default SyntaxHighlighter;
