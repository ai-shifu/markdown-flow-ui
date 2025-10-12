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

const agiImgContextRegexp = /!\[([^\]]*)\]\(([^)]+)\)/gi;

const imageUrlMatcher = new MatchDecorator({
  regexp: agiImgContextRegexp,
  decoration: (match, view) =>
    Decoration.replace({
      widget: new PlaceholderWidget(
        match?.[1],
        {
          tag: "image",
          url: match?.[2],
          title: match?.[1],
        },
        "tag-image",
        SelectedOption.Image,
        view
      ),
    }),
});

const ImgPlaceholder = ViewPlugin.fromClass(
  class {
    placeholders: DecorationSet;
    constructor(view: EditorView) {
      this.placeholders = imageUrlMatcher.createDeco(view);
    }
    update(update: ViewUpdate) {
      this.placeholders = imageUrlMatcher.updateDeco(update, this.placeholders);
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

export default ImgPlaceholder;
