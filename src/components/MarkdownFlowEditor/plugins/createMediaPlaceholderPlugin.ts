import {
  EditorView,
  Decoration,
  DecorationSet,
  ViewPlugin,
  ViewUpdate,
  MatchDecorator,
} from "@codemirror/view";
import { mediaPlaceholderLabels } from "./mediaPlaceholderLabels";

export const createMediaPlaceholderPlugin = (
  createMatcher: (view: EditorView) => MatchDecorator
) =>
  ViewPlugin.fromClass(
    class {
      placeholders: DecorationSet;
      matcher: MatchDecorator;
      constructor(view: EditorView) {
        this.matcher = createMatcher(view);
        this.placeholders = this.matcher.createDeco(view);
      }
      update(update: ViewUpdate) {
        if (update.docChanged) {
          this.matcher = createMatcher(update.view);
        }
        if (
          update.docChanged ||
          update.startState.facet(mediaPlaceholderLabels) !==
            update.state.facet(mediaPlaceholderLabels)
        ) {
          this.placeholders = this.matcher.createDeco(update.view);
          return;
        }
        this.placeholders = this.matcher.updateDeco(update, this.placeholders);
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
