import {
  EditorView,
  Decoration,
  DecorationSet,
  ViewPlugin,
  ViewUpdate,
  MatchDecorator,
} from "@codemirror/view";
import { SelectedOption } from "../types";
import PlaceholderWidget from "./PlaceholderWidget";
import { createVariableExpressionRegexp } from "../utils";

const variableContextRegexp = createVariableExpressionRegexp();

const selectionInsideAnyVariable = (view: EditorView) => {
  const docText = view.state.doc.toString();
  if (!docText) return false;
  const regexp = createVariableExpressionRegexp();
  let match: RegExpExecArray | null;
  while ((match = regexp.exec(docText)) !== null) {
    const from = match.index ?? 0;
    const to = from + match[0].length;
    if (selectionInsideVariableExpression(view, from, to)) {
      return true;
    }
    if (regexp.lastIndex === match.index) {
      regexp.lastIndex++;
    }
  }
  return false;
};

const selectionInsideVariableExpression = (
  view: EditorView,
  from: number,
  to: number
) => {
  const innerStart = from + 2;
  const innerEnd = to - 2;
  if (innerEnd < innerStart) {
    return false;
  }
  return view.state.selection.ranges.some((range) => {
    const isAnchorInside =
      range.anchor >= innerStart && range.anchor <= innerEnd;
    const isHeadInside = range.head >= innerStart && range.head <= innerEnd;
    return isAnchorInside || isHeadInside;
  });
};

const variableUrlMatcher = new MatchDecorator({
  regexp: variableContextRegexp,
  decoration: (match, view, from) => {
    const rawMatch = match?.[0];
    if (!rawMatch) {
      return null;
    }
    const to = from + rawMatch.length;
    if (selectionInsideVariableExpression(view, from, to)) {
      return null;
    }
    return Decoration.replace({
      widget: new PlaceholderWidget(
        rawMatch,
        {
          tag: "variable",
          title: match?.[1],
        },
        "tag-variable",
        SelectedOption.Variable,
        view
      ),
    });
  },
});

const VariablePlaceholder = ViewPlugin.fromClass(
  class {
    placeholders: DecorationSet;
    selectionInsideVariable: boolean;
    constructor(view: EditorView) {
      this.selectionInsideVariable = selectionInsideAnyVariable(view);
      this.placeholders = variableUrlMatcher.createDeco(view);
    }
    update(update: ViewUpdate) {
      if (update.selectionSet || update.docChanged) {
        const insideNow = selectionInsideAnyVariable(update.view);
        if (insideNow !== this.selectionInsideVariable) {
          this.selectionInsideVariable = insideNow;
          this.placeholders = variableUrlMatcher.createDeco(update.view);
          return;
        }
      }
      this.placeholders = variableUrlMatcher.updateDeco(
        update,
        this.placeholders
      );
    }
  },
  {
    decorations: (instance) => instance.placeholders,
    provide: (plugin) =>
      EditorView.atomicRanges.of((view) => {
        return view.plugin(plugin)?.placeholders || Decoration.none;
      }),
  }
);

export default VariablePlaceholder;
