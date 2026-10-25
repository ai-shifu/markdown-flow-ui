import {
  EditorView,
  Decoration,
  DecorationSet,
  ViewPlugin,
  ViewUpdate,
  MatchDecorator,
} from "@codemirror/view";
import { SelectedOption } from "../types";
import { findDocumentVariableMarkers, unwrapFixedOutput } from "../utils";
import PlaceholderWidget from "./PlaceholderWidget";
import { mediaPlaceholderLabels } from "./mediaPlaceholderLabels";

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
      text: alt,
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

const createImageUrlMatcher = (view: EditorView) => {
  const variables = findDocumentVariableMarkers(
    view.state.doc.toString()
  ).filter((marker) => marker.name !== null);
  return new MatchDecorator({
    regexp: agiImgContextRegexp,
    decoration: (match, view, from) => {
      const to = from + match[0].length;
      if (variables.some((marker) => from < marker.end && to > marker.start)) {
        return null;
      }
      const info = getImageMatchInfo(match);
      return Decoration.replace({
        widget: new PlaceholderWidget(
          info.text || view.state.facet(mediaPlaceholderLabels).image,
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
};

const ImgPlaceholder = ViewPlugin.fromClass(
  class {
    placeholders: DecorationSet;
    matcher: MatchDecorator;
    constructor(view: EditorView) {
      this.matcher = createImageUrlMatcher(view);
      this.placeholders = this.matcher.createDeco(view);
    }
    update(update: ViewUpdate) {
      if (update.docChanged) {
        this.matcher = createImageUrlMatcher(update.view);
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

export default ImgPlaceholder;
