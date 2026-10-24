import {
  EditorView,
  Decoration,
  DecorationSet,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import { SelectedOption } from "../types";
import PlaceholderWidget from "./PlaceholderWidget";
import { findDocumentVariableMarkers } from "../utils";

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

const buildPlaceholders = (
  view: EditorView,
  markers: ReturnType<typeof findDocumentVariableMarkers>
): DecorationSet => {
  const text = view.state.doc.toString();
  return Decoration.set(
    markers.flatMap((marker) => {
      const rawMarker = text.slice(marker.start, marker.end);
      if (
        marker.name === null ||
        // CodeMirror inline widgets cannot replace line breaks in marker padding.
        rawMarker.includes("\n") ||
        selectionInsideVariableExpression(view, marker.start, marker.end)
      ) {
        return [];
      }
      return [
        Decoration.replace({
          widget: new PlaceholderWidget(
            rawMarker,
            { tag: "variable", title: marker.name },
            "tag-variable",
            SelectedOption.Variable,
            view
          ),
        }).range(marker.start, marker.end),
      ];
    })
  );
};

const selectedMarkers = (
  view: EditorView,
  markers: ReturnType<typeof findDocumentVariableMarkers>
) =>
  markers
    .filter((marker) =>
      selectionInsideVariableExpression(view, marker.start, marker.end)
    )
    .map((marker) => marker.start)
    .join(",");

const VariablePlaceholder = ViewPlugin.fromClass(
  class {
    placeholders: DecorationSet;
    markers: ReturnType<typeof findDocumentVariableMarkers>;
    selectionSignature: string;
    constructor(view: EditorView) {
      this.markers = findDocumentVariableMarkers(view.state.doc.toString());
      this.selectionSignature = selectedMarkers(view, this.markers);
      this.placeholders = buildPlaceholders(view, this.markers);
    }
    update(update: ViewUpdate) {
      if (update.docChanged)
        this.markers = findDocumentVariableMarkers(update.state.doc.toString());
      if (update.docChanged || update.selectionSet) {
        const signature = selectedMarkers(update.view, this.markers);
        if (update.docChanged || signature !== this.selectionSignature) {
          this.selectionSignature = signature;
          this.placeholders = buildPlaceholders(update.view, this.markers);
        }
      }
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
