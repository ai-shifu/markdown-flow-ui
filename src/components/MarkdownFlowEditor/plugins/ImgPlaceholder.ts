import {
  EditorView,
  Decoration,
  DecorationSet,
  ViewPlugin,
  ViewUpdate,
  MatchDecorator,
} from "@codemirror/view";
import { SelectedOption } from "../types";
import { unwrapFixedOutput } from "../utils";
import PlaceholderWidget from "./PlaceholderWidget";

const imageMarkupRegexp = /!\[([^\]]*)\]\(([^)]+)\)|<img\b[^>]*>/i;
const agiImgContextRegexp =
  /===\s*(?:!\[[^\]]*\]\([^)]+\)|<img\b[^>]*>)\s*===|!\[[^\]]*\]\([^)]+\)|<img\b[^>]*>/gi;

const extractAttributeValue = (tag: string, attribute: string) => {
  const regexp = new RegExp(
    `${attribute}\\s*=\\s*("(.*?)"|'(.*?)'|([^\\s"'<>]+))`,
    "i"
  );
  const match = tag.match(regexp);
  if (!match) return undefined;
  return match[2] ?? match[3] ?? match[4];
};

const clampScalePercent = (value: number) =>
  Math.max(1, Math.min(1000, Math.round(value)));

const getImageMatchInfo = (match: RegExpMatchArray) => {
  const source = match?.[0] ?? "";
  const raw = unwrapFixedOutput(source);
  const fixedOutput = /^\s*===/.test(source);
  if (/^<img\b/i.test(raw)) {
    const src = extractAttributeValue(raw, "src") ?? "";
    const alt =
      extractAttributeValue(raw, "alt") ??
      extractAttributeValue(raw, "title") ??
      "";
    const widthAttr = extractAttributeValue(raw, "width");
    let scalePercent: number | undefined;
    if (widthAttr) {
      const numeric = Number.parseFloat(widthAttr);
      if (Number.isFinite(numeric)) {
        scalePercent = clampScalePercent(numeric);
      }
    }
    return {
      text: alt || "Image",
      url: src,
      title: alt,
      scalePercent,
      fixedOutput,
    };
  }
  const markdownMatch = raw.match(imageMarkupRegexp);
  const title = markdownMatch?.[1] ?? "";
  const url = markdownMatch?.[2] ?? "";
  return {
    text: title,
    url,
    title,
    scalePercent: undefined,
    fixedOutput,
  };
};

const imageUrlMatcher = new MatchDecorator({
  regexp: agiImgContextRegexp,
  decoration: (match, view) => {
    const info = getImageMatchInfo(match);
    return Decoration.replace({
      widget: new PlaceholderWidget(
        info.text,
        {
          tag: "image",
          url: info.url,
          title: info.title,
          scalePercent: info.scalePercent,
          fixedOutput: info.fixedOutput,
        },
        "tag-image",
        SelectedOption.Image,
        view
      ),
    });
  },
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
