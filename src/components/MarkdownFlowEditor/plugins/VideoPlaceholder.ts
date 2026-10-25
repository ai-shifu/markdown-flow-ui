import { EditorView, Decoration, MatchDecorator } from "@codemirror/view";
import { SelectedOption } from "../types";
import { findDocumentVariableMarkers, unwrapFixedOutput } from "../utils";
import PlaceholderWidget from "./PlaceholderWidget";
import { mediaPlaceholderLabels } from "./mediaPlaceholderLabels";
import { createMediaPlaceholderPlugin } from "./createMediaPlaceholderPlugin";

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

const VideoPlaceholder = createMediaPlaceholderPlugin(createBiliUrlMatcher);

export default VideoPlaceholder;
