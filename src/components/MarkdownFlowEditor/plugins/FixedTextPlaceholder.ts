import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";

const START_TAG = "===";
const END_TAG = "===";

class FixedTextPlaceholderWidget extends WidgetType {
  constructor(
    private placeholder: string,
    private tooltip: string,
    private view: EditorView,
    private position: number
  ) {
    super();
  }

  toDOM() {
    const span = document.createElement("span");
    span.className = "tag-fixed-text-placeholder";
    span.textContent = this.placeholder;
    span.title = this.tooltip;
    span.dataset.tooltip = this.tooltip;
    span.setAttribute("aria-hidden", "true");
    span.style.cursor = "text";
    span.addEventListener("mousedown", (event) => {
      event.preventDefault();
      this.view.focus();
      this.view.dispatch({
        selection: { anchor: this.position },
      });
    });
    return span;
  }

  ignoreEvent() {
    return false;
  }
}

const createDecorations = (
  view: EditorView,
  placeholder: string,
  tooltip: string
) => {
  const ranges: ReturnType<Decoration["range"]>[] = [];
  const text = view.state.doc.toString();
  const regexp = /={3}([\s\S]*?)={3}/gi;
  let match: RegExpExecArray | null;

  while ((match = regexp.exec(text)) !== null) {
    const matchText = match[0] ?? "";
    const innerText = match[1] ?? "";
    const startIndex = match.index ?? 0;

    const startTagFrom = startIndex;
    const startTagTo = startIndex + START_TAG.length;
    const endTagFrom = startIndex + matchText.length - END_TAG.length;
    const endTagTo = startIndex + matchText.length;

    ranges.push(Decoration.replace({}).range(startTagFrom, startTagTo));
    ranges.push(Decoration.replace({}).range(endTagFrom, endTagTo));

    if (endTagFrom > startTagTo) {
      ranges.push(
        Decoration.mark({
          class: "tag-fixed-text",
          attributes: {
            title: tooltip,
            "data-tooltip": tooltip,
          },
        }).range(startTagTo, endTagFrom)
      );
    }

    if (!innerText.length) {
      ranges.push(
        Decoration.widget({
          widget: new FixedTextPlaceholderWidget(
            placeholder,
            tooltip,
            view,
            startTagTo
          ),
          side: 1,
        }).range(startTagTo)
      );
    }
  }

  if (!ranges.length) {
    return Decoration.none;
  }
  return Decoration.set(ranges, true);
};

const createFixedTextPlaceholder = (placeholder: string, tooltip: string) =>
  ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      constructor(view: EditorView) {
        this.decorations = createDecorations(view, placeholder, tooltip);
      }
      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = createDecorations(
            update.view,
            placeholder,
            tooltip
          );
        }
      }
    },
    {
      decorations: (instance) => instance.decorations,
      provide: (plugin) =>
        EditorView.atomicRanges.of((view) => {
          return view.plugin(plugin)?.decorations ?? Decoration.none;
        }),
    }
  );

export default createFixedTextPlaceholder;
