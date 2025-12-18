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

const biliVideoContextRegexp =
  /<iframe\s[^>]*data-tag="video"[^>]*><\/iframe>/gi;

const extractAttrValue = (markup: string, attr: string) => {
  const escapedAttr = attr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regexp = new RegExp(`${escapedAttr}="([^"]*)"`, "i");
  const match = markup.match(regexp);
  return match ? match[1] : "";
};

const decodeHtmlEntities = (value: string) =>
  value.replace(/&quot;/g, '"').replace(/&amp;/g, "&");

const biliUrlMatcher = new MatchDecorator({
  regexp: biliVideoContextRegexp,
  decoration: (match, view) => {
    const iframeMarkup = match?.[0] || "";
    const srcValueRaw = extractAttrValue(iframeMarkup, "src");
    const titleAttrRaw = extractAttrValue(iframeMarkup, "data-title");
    const dataUrlAttrRaw = extractAttrValue(iframeMarkup, "data-url");
    const titleAttr = titleAttrRaw ? decodeHtmlEntities(titleAttrRaw) : "";
    const decodedSrcValue = srcValueRaw ? decodeHtmlEntities(srcValueRaw) : "";
    const storedDataUrl = dataUrlAttrRaw
      ? decodeHtmlEntities(dataUrlAttrRaw)
      : "";
    // Extract and decode the original URL from stored attributes or API endpoint
    let originalUrl = storedDataUrl || decodedSrcValue;
    try {
      if (!storedDataUrl && decodedSrcValue) {
        const urlParams = new URLSearchParams(new URL(decodedSrcValue).search);
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
        titleAttr || "Video", // Display title from data-title
        {
          tag: "video",
          url: originalUrl, // Decoded original Bilibili URL
          title: titleAttr, // title from data-title attribute
        },
        "tag-video",
        SelectedOption.Video,
        view
      ),
    });
  },
});

const VideoPlaceholder = ViewPlugin.fromClass(
  class {
    placeholders: DecorationSet;
    constructor(view: EditorView) {
      this.placeholders = biliUrlMatcher.createDeco(view);
    }
    update(update: ViewUpdate) {
      this.placeholders = biliUrlMatcher.updateDeco(update, this.placeholders);
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
