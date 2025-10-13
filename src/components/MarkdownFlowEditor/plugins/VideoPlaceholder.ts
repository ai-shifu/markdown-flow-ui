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

// Simple and safe regex - breaks down complex pattern into simpler parts
const biliVideoContextRegexp =
  /<iframe\s[^>]*data-tag="video"[^>]*data-title="([^"]+)"[^>]*src="([^"]+)"[^>]*><\/iframe>/gi;

const biliUrlMatcher = new MatchDecorator({
  regexp: biliVideoContextRegexp,
  decoration: (match, view) => {
    // Extract and decode the original URL from the API endpoint
    let originalUrl = match?.[2] || "";
    try {
      const urlParams = new URLSearchParams(new URL(originalUrl).search);
      const encodedUrl = urlParams.get("url");
      if (encodedUrl) {
        originalUrl = decodeURIComponent(encodedUrl);
      }
    } catch (error) {
      console.warn("Failed to decode video URL:", error);
    }

    return Decoration.replace({
      widget: new PlaceholderWidget(
        match?.[1] || "Video", // Display title from data-title
        {
          tag: "video",
          url: originalUrl, // Decoded original Bilibili URL
          title: match?.[1], // title from data-title attribute
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
