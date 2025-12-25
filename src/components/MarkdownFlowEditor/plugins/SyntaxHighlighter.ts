import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";

const variableRegex = /\{\{.*?\}\}/g;
const commentRegex = /<!--[\s\S]*?-->/g;
const fixedOutputRegex = /===.*?===/g;
const multilineFixedOutputRegex = /!===[ \t]*\r?\n[\s\S]*?\r?\n[ \t]*!===/g;
const controlBlockRegex = /\?\[(.*?)\]/g;

function buildDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const docText = view.state.doc.toString();

  const matches: { from: number; to: number; className: string }[] = [];
  const occupied: { from: number; to: number }[] = [];

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

  // 1. Comments
  let match;
  while ((match = commentRegex.exec(docText)) !== null) {
    addMatch(match.index, match.index + match[0].length, "syntax-comment");
  }

  // 2. Fixed Output (Multiline)
  while ((match = multilineFixedOutputRegex.exec(docText)) !== null) {
    addMatch(match.index, match.index + match[0].length, "syntax-fixed");
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
  while ((match = controlBlockRegex.exec(docText)) !== null) {
    const fullStart = match.index;
    const fullEnd = match.index + match[0].length;
    const content = match[1];
    const contentStart = fullStart + 2; // after ?[
    if (isOverlapping(fullStart, fullEnd)) {
      continue;
    }

    // Outer brackets
    addMatch(fullStart, fullStart + 2, "syntax-keyword"); // ?[
    addMatch(fullEnd - 1, fullEnd, "syntax-keyword"); // ]

    if (content.startsWith("%")) {
      // Input / Select
      addMatch(contentStart, contentStart + 1, "syntax-keyword"); // %

      const operatorRanges: { from: number; to: number }[] = [];
      const variableRanges: { from: number; to: number }[] = [];
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
        variableRanges.push({
          from: contentStart + innerVariableMatch.index,
          to:
            contentStart +
            innerVariableMatch.index +
            innerVariableMatch[0].length,
        });
      }

      const allTokens = [
        ...operatorRanges.map((range) => ({
          ...range,
          className: "syntax-keyword",
        })),
        ...variableRanges.map((range) => ({
          ...range,
          className: "syntax-variable",
        })),
      ].sort((a, b) => {
        if (a.from !== b.from) return a.from - b.from;
        return a.to - b.to;
      });

      for (const token of allTokens) {
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
      const variableRanges: { from: number; to: number }[] = [];
      const appliedVariableRanges: { from: number; to: number }[] = [];
      let innerVariableMatch;
      const innerVariableRegex = /\{\{.*?\}\}/g;
      while ((innerVariableMatch = innerVariableRegex.exec(content)) !== null) {
        variableRanges.push({
          from: contentStart + innerVariableMatch.index,
          to:
            contentStart +
            innerVariableMatch.index +
            innerVariableMatch[0].length,
        });
      }

      const sortedVariables = variableRanges.sort((a, b) => {
        if (a.from !== b.from) return a.from - b.from;
        return a.to - b.to;
      });

      for (const variable of sortedVariables) {
        if (addMatch(variable.from, variable.to, "syntax-variable")) {
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

  // 5. Variables (only if not already decorated)
  while ((match = variableRegex.exec(docText)) !== null) {
    addMatch(match.index, match.index + match[0].length, "syntax-variable");
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
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildDecorations(update.view);
      }
    }
  },
  {
    decorations: (instance) => instance.decorations,
  }
);

export default SyntaxHighlighter;
