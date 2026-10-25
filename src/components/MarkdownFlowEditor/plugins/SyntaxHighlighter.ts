import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import { getMarkdownSourceAnalysis } from "../../ContentRender/utils/inline-code-ranges";
import { INTERACTION_CONTENT_SOURCE, isEscape } from "remark-flow";

import {
  findVariableMarkers,
  findDocumentVariableMarkers,
  trimVariablePadding,
} from "../utils";

const commentRegex = /<!--[\s\S]*?-->/g;

// An unfinished marker still owns its tail, so nested syntax stays literal while typing.
const interactionVariableRanges = (text: string) => {
  const markers = findVariableMarkers(text);
  const pending = text.indexOf("{{", markers.at(-1)?.end ?? 0);
  return pending === -1
    ? markers
    : [...markers, { start: pending, end: text.length, name: null }];
};
// The grammar's own definition of where an interaction ends, so a `\]` an option escaped does
// not cut the highlight short, and the same `(?!\()` the parser uses, so `?[text](url)` stays a
// markdown link. Taken from remark-flow rather than written again here: the editor and the
// parser have to agree about what they are looking at.
const controlBlockRegex = new RegExp(
  `\\?\\[(${INTERACTION_CONTENT_SOURCE})\\](?!\\()`,
  "g"
);

const documentControlRanges = (text: string) =>
  getMarkdownSourceAnalysis(text).interactions;

export interface SyntaxHighlightRange {
  from: number;
  to: number;
  className: string;
}

function collectMultilineFixedOutputRanges(
  docText: string,
  isInsideVariable: (position: number) => boolean
): SyntaxHighlightRange[] {
  const ranges: SyntaxHighlightRange[] = [];
  let pendingStart: number | null = null;
  let lineStart = 0;

  while (lineStart <= docText.length) {
    const newlineIndex = docText.indexOf("\n", lineStart);
    const lineEnd = newlineIndex === -1 ? docText.length : newlineIndex;
    const lineText = docText.slice(lineStart, lineEnd);

    if (lineText.trim() === "!===" && !isInsideVariable(lineStart)) {
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
  commentRanges: SyntaxHighlightRange[],
  isInsideVariable: (position: number) => boolean
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
      if (
        !isNegated &&
        !isInsideComment(markerIndex) &&
        !isInsideVariable(markerIndex)
      ) {
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

function collectCommentRanges(
  docText: string,
  isInsideVariable: (position: number) => boolean
): SyntaxHighlightRange[] {
  const ranges: SyntaxHighlightRange[] = [];
  let match;

  commentRegex.lastIndex = 0;
  while ((match = commentRegex.exec(docText)) !== null) {
    if (isInsideVariable(match.index)) continue;
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
  const variables = findDocumentVariableMarkers(docText);
  const isInsideVariable = (position: number) =>
    variables.some(
      (marker) => position >= marker.start && position < marker.end
    );
  const commentRanges = collectCommentRanges(docText, isInsideVariable);
  const blockRanges = [
    ...collectMultilineFixedOutputRanges(docText, isInsideVariable),
    ...collectSingleLineFixedOutputRanges(
      docText,
      commentRanges,
      isInsideVariable
    ),
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
  const documentVariables = findDocumentVariableMarkers(docText);
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

  // 1. Outer block ranges win over any syntax inside them.
  for (const range of collectOuterBlockRanges(docText)) {
    addMatch(range.from, range.to, range.className);
  }

  // 2. Control Blocks
  for (const control of documentControlRanges(docText)) {
    // Native Markdown owns document boundaries. The shared token grammar still
    // supplies the exact source offsets used for individual editor decorations.
    controlBlockRegex.lastIndex = control.start;
    const match = controlBlockRegex.exec(docText);
    if (
      !match ||
      match.index !== control.start ||
      match.index + match[0].length !== control.end
    )
      continue;
    const fullStart = match.index;
    const fullEnd = match.index + match[0].length;
    const content = match[1];
    const contentStart = fullStart + 2; // after ?[
    if (
      isOverlapping(fullStart, fullEnd) ||
      documentVariables.some(
        (marker) => marker.start <= fullStart && fullStart < marker.end
      )
    ) {
      continue;
    }

    // Outer brackets and question mark
    addMatch(fullStart, fullStart + 1, "syntax-keyword"); // ?
    addMatch(fullStart + 1, fullStart + 2, "syntax-bracket"); // [
    addMatch(fullEnd - 1, fullEnd, "syntax-bracket"); // ]

    const variables = interactionVariableRanges(content);
    const firstVariable = variables[0];
    const percentIndex = firstVariable ? firstVariable.start - 1 : -1;
    const hasLeadingAssignment =
      percentIndex >= 0 &&
      content[percentIndex] === "%" &&
      trimVariablePadding(content.slice(0, percentIndex)) === "";
    if (content.startsWith("%") || hasLeadingAssignment) {
      // Input / Select
      let percentClass = "syntax-percent-invalid";
      if (firstVariable && hasLeadingAssignment) {
        const varFrom = contentStart + firstVariable.start;
        const varTo = contentStart + firstVariable.end;
        const cursorInsideVar = isCursorInside(varFrom, varTo);
        percentClass =
          firstVariable.name !== null && !cursorInsideVar
            ? "syntax-percent-valid"
            : "syntax-percent-invalid";
      }
      const percentStart =
        contentStart + (hasLeadingAssignment ? percentIndex : 0);
      addMatch(percentStart, percentStart + 1, percentClass); // %

      const operatorRanges: { from: number; to: number }[] = [];
      const variableRanges: { from: number; to: number; className: string }[] =
        [];
      const appliedTokenRanges: { from: number; to: number }[] = [];

      // Keep a variable name atomic even when it contains option punctuation.
      for (const variable of variables) {
        variableRanges.push({
          from: contentStart + variable.start,
          to: contentStart + variable.end,
          className:
            variable.name === null
              ? "syntax-variable-invalid"
              : "syntax-variable",
        });
      }

      // Inner operators | || ... -- skipping any an option escaped, the way the parser does.
      // Painted as separators, they told the author the grammar had split an option that it
      // had in fact left whole.
      let scanIndex = 0;
      while (scanIndex < content.length) {
        const variable = variableRanges.find(
          (range) => contentStart + scanIndex === range.from
        );
        if (variable) {
          scanIndex = variable.to - contentStart;
          continue;
        }
        if (isEscape(content, scanIndex)) {
          scanIndex += 2;
          continue;
        }
        const operator = content.startsWith("||", scanIndex)
          ? "||"
          : content[scanIndex] === "|"
            ? "|"
            : content.startsWith("...", scanIndex)
              ? "..."
              : null;
        if (!operator) {
          scanIndex += 1;
          continue;
        }
        operatorRanges.push({
          from: contentStart + scanIndex,
          to: contentStart + scanIndex + operator.length,
        });
        scanIndex += operator.length;
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
      const stringStart = percentStart + 1;
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

      for (const variable of interactionVariableRanges(content)) {
        variableRanges.push({
          from: contentStart + variable.start,
          to: contentStart + variable.end,
          className:
            variable.name === null
              ? "syntax-variable-invalid"
              : "syntax-variable",
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
  for (const variable of documentVariables) {
    if (
      variable.name !== null &&
      !isCursorInside(variable.start, variable.end)
    ) {
      addMatch(variable.start, variable.end, "syntax-variable");
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
