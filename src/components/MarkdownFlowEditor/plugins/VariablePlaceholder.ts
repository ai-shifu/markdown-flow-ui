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

const variableContextRegexp = /\{\{([^}]+)\}\}/gi;

const variableUrlMatcher = new MatchDecorator({
  regexp: variableContextRegexp,
  decoration: (match, view) =>
    Decoration.replace({
      widget: new PlaceholderWidget(
        match?.[0],
        {
          tag: "variable",
          title: match?.[1],
        },
        "tag-variable",
        SelectedOption.Variable,
        view
      ),
    }),
});

const VariablePlaceholder = ViewPlugin.fromClass(
  class {
    placeholders: DecorationSet;
    constructor(view: EditorView) {
      this.placeholders = variableUrlMatcher.createDeco(view);
    }
    update(update: ViewUpdate) {
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
