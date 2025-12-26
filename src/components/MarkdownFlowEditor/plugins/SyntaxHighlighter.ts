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
const fixedOutputRegex = /===.*?===/g;
const controlBlockRegex = /\?\[(.*?)\]/g;

function buildDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const docText = view.state.doc.toString();

  const matches: { from: number; to: number; className: string }[] = [];
  const occupied: { from: number; to: number }[] = [];

  commentRegex.lastIndex = 0;
  fixedOutputRegex.lastIndex = 0;
  controlBlockRegex.lastIndex = 0;

  // Prevent overlapping decorations so styling stays deterministic
  const isOverlapping = (from: number, to: number) =>
    occupied.some((range) => !(to <= range.from || from >= range.to));

  const isCursorInside = (from: number, to: number) => {
    return view.state.selection.ranges.some((range) => {
      return range.from >= from && range.to <= to;
    });
  };

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

  // 1. Comments
  let match;
  while ((match = commentRegex.exec(docText)) !== null) {
    addMatch(match.index, match.index + match[0].length, "syntax-comment");
  }

  // 2. Fixed Output (Multiline) - only when both markers are alone on their lines
  const lineCount = view.state.doc.lines;
  let pendingStart: { from: number; line: number } | null = null;
  for (let i = 1; i <= lineCount; i++) {
    const lineInfo = view.state.doc.line(i);
    const trimmed = lineInfo.text.trim();
    if (trimmed === "!===") {
      if (!pendingStart) {
        pendingStart = { from: lineInfo.from, line: i };
        continue;
      }
      const startFrom = pendingStart.from;
      const endTo = lineInfo.to;
      addMatch(startFrom, endTo, "syntax-fixed");
      pendingStart = null;
    }
  }

  // 3. Fixed Output (Single line, skip "!===...!===")
  while ((match = fixedOutputRegex.exec(docText)) !== null) {
    const startIndex = match.index;
    const isNegated = startIndex > 0 && docText[startIndex - 1] === "!";
    if (isNegated) {
      continue;
    }
    addMatch(startIndex, startIndex + match[0].length, "syntax-fixed");
  }

  // 4. Control Blocks
  broadVariableRegex.lastIndex = 0;
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

  // 5. Variables (only if not already decorated; invalid ones stay default outside control blocks)
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
