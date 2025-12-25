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

  // 1. Comments
  let match;
  while ((match = commentRegex.exec(docText)) !== null) {
    matches.push({
      from: match.index,
      to: match.index + match[0].length,
      className: "syntax-comment",
    });
  }

  // 2. Fixed Output (Multiline)
  while ((match = multilineFixedOutputRegex.exec(docText)) !== null) {
    matches.push({
      from: match.index,
      to: match.index + match[0].length,
      className: "syntax-fixed",
    });
  }

  // 3. Fixed Output (Single line, skip "!===...!===")
  while ((match = fixedOutputRegex.exec(docText)) !== null) {
    const startIndex = match.index;
    const isNegated = startIndex > 0 && docText[startIndex - 1] === "!";
    if (isNegated) {
      continue;
    }
    matches.push({
      from: startIndex,
      to: startIndex + match[0].length,
      className: "syntax-fixed",
    });
  }

  // 4. Variables
  while ((match = variableRegex.exec(docText)) !== null) {
    matches.push({
      from: match.index,
      to: match.index + match[0].length,
      className: "syntax-variable",
    });
  }

  // 5. Control Blocks
  while ((match = controlBlockRegex.exec(docText)) !== null) {
    const fullStart = match.index;
    const fullEnd = match.index + match[0].length;
    const content = match[1];
    const contentStart = fullStart + 2; // after ?[

    // Outer brackets
    matches.push({
      from: fullStart,
      to: fullStart + 2,
      className: "syntax-keyword",
    }); // ?[
    matches.push({
      from: fullEnd - 1,
      to: fullEnd,
      className: "syntax-keyword",
    }); // ]

    if (content.startsWith("%")) {
      // Input / Select
      matches.push({
        from: contentStart,
        to: contentStart + 1,
        className: "syntax-keyword",
      }); // %

      // Content (Dark Blue)
      matches.push({
        from: contentStart,
        to: fullEnd - 1,
        className: "syntax-string",
      });

      // Inner operators | || ...
      const innerRegex = /(\|\||\||\.\.\.)/g;
      let innerMatch;
      while ((innerMatch = innerRegex.exec(content)) !== null) {
        matches.push({
          from: contentStart + innerMatch.index,
          to: contentStart + innerMatch.index + innerMatch[0].length,
          className: "syntax-keyword",
        });
      }
    } else {
      // Button ?[text]
      matches.push({
        from: contentStart,
        to: fullEnd - 1,
        className: "syntax-button-text",
      });
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
