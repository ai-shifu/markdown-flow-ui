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

const biliVideoContextRegexp =
  /===\s*<iframe\s[^>]*data-tag="video"[^>]*><\/iframe>\s*===|<iframe\s[^>]*data-tag="video"[^>]*><\/iframe>/gi;

const extractAttrValue = (markup: string, attr: string) => {
  const escapedAttr = attr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regexp = new RegExp(`${escapedAttr}="([^"]*)"`, "i");
  const match = markup.match(regexp);
  return match ? match[1] : "";
};

const decodeHtmlEntities = (value: string) =>
  value.replace(/&quot;/g, '"').replace(/&amp;/g, "&");

const createBiliUrlMatcher = (view: EditorView) => {
  const variables = findDocumentVariableMarkers(
    view.state.doc.toString()
  ).filter((marker) => marker.name !== null);
  return new MatchDecorator({
    regexp: biliVideoContextRegexp,
    decoration: (match, view, from) => {
      const to = from + match[0].length;
      if (variables.some((marker) => from < marker.end && to > marker.start)) {
        return null;
      }
      const source = match?.[0] || "";
      const iframeMarkup = unwrapFixedOutput(source);
      const fixedOutput = /^\s*===/.test(source);
      const srcValueRaw = extractAttrValue(iframeMarkup, "src");
      const titleAttrRaw = extractAttrValue(iframeMarkup, "data-title");
      const dataUrlAttrRaw = extractAttrValue(iframeMarkup, "data-url");
      const titleAttr = titleAttrRaw ? decodeHtmlEntities(titleAttrRaw) : "";
      const decodedSrcValue = srcValueRaw
        ? decodeHtmlEntities(srcValueRaw)
        : "";
      const storedDataUrl = dataUrlAttrRaw
        ? decodeHtmlEntities(dataUrlAttrRaw)
        : "";
      // Extract and decode the original URL from stored attributes or API endpoint
      let originalUrl = storedDataUrl || decodedSrcValue;
      try {
        if (!storedDataUrl && decodedSrcValue) {
          const urlParams = new URLSearchParams(
            new URL(decodedSrcValue).search
          );
          const encodedUrl = urlParams.get("url");
          if (encodedUrl) {
            originalUrl = decodeURIComponent(encodedUrl);
          }
        }
      } catch (error) {
        console.warn("Failed to decode video URL:", error);
      }

      return Decoration.replace({
        widget: new PlaceholderWidget(
          titleAttr || view.state.facet(mediaPlaceholderLabels).video,
          {
            tag: "video",
            url: originalUrl, // Decoded original Bilibili URL
            title: titleAttr, // title from data-title attribute
            fixedOutput,
          },
          "tag-video",
          SelectedOption.Video,
          view
        ),
      });
    },
  });
};

const VideoPlaceholder = ViewPlugin.fromClass(
  class {
    placeholders: DecorationSet;
    matcher: MatchDecorator;
    constructor(view: EditorView) {
      this.matcher = createBiliUrlMatcher(view);
      this.placeholders = this.matcher.createDeco(view);
    }
    update(update: ViewUpdate) {
      if (update.docChanged) {
        this.matcher = createBiliUrlMatcher(update.view);
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

export default VideoPlaceholder;
