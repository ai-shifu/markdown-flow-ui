import {
  Decoration,
  DecorationSet,
  EditorView,
  MatchDecorator,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";

const dividerRegexp = /^(?: {0,3})([-_*])(?:\s*\1){2,}(?:\s*)$/gm;

const lineHeaderIcon = new URL(
  "../assets/line_header.svg",
  import.meta.url
).toString();

class DividerWidget extends WidgetType {
  constructor(private view: EditorView) {
    super();
  }

  private getPosition() {
    let from = -1;
    let to = -1;
    const decorations = this.view.state.facet(EditorView.decorations);
    for (const deco of decorations) {
      const decoSet = typeof deco === "function" ? deco(this.view) : deco;
      decoSet.between(
        0,
        this.view.state.doc.length,
        (start: number, end: number, decoration: Decoration) => {
          if (decoration.spec.widget === this) {
            from = start;
            to = end;
            return false;
          }
        }
      );
      if (from !== -1) break;
    }
    return from !== -1 && to !== -1 ? ([from, to] as const) : null;
  }

  toDOM() {
    const container = document.createElement("div");
    container.className = "tag-divider";

    const icon = document.createElement("img");
    icon.src = lineHeaderIcon;
    icon.alt = "divider icon";
    icon.width = 24;
    icon.height = 24;
    icon.draggable = false;

    const line = document.createElement("span");
    line.className = "tag-divider-line";

    container.appendChild(icon);
    container.appendChild(line);

    container.addEventListener("mousedown", (event) => {
      event.preventDefault();
      this.view.focus();
      const range = this.getPosition();
      if (range) {
        const [from, to] = range;
        this.view.dispatch({
          selection: { anchor: from, head: to },
        });
      }
    });

    return container;
  }

  ignoreEvent() {
    return false;
  }
}

const dividerMatcher = new MatchDecorator({
  regexp: dividerRegexp,
  decoration: (match, view) =>
    Decoration.replace({
      widget: new DividerWidget(view),
    }),
});

const DividerPlaceholder = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = dividerMatcher.createDeco(view);
    }
    update(update: ViewUpdate) {
      this.decorations = dividerMatcher.updateDeco(update, this.decorations);
    }
  },
  {
    decorations: (instance) => instance.decorations,
  }
);

export default DividerPlaceholder;
