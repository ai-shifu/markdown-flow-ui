import { EditorView, Decoration, WidgetType } from "@codemirror/view";
import { SelectedOption } from "../types";

class PlaceholderWidget extends WidgetType {
  constructor(
    private text: string,
    private dataset: {
      tag: "image" | "video" | "variable";
      title?: string;
      url?: string;
    },
    private styleClass: string,
    private type: SelectedOption,
    private view: EditorView
  ) {
    super();
  }

  getPosition() {
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
    if (from !== -1 && to !== -1) {
      return [from, to];
    }
  }

  toDOM() {
    const container = document.createElement("span");
    container.className = this.styleClass;
    const span = document.createElement("span");
    span.textContent = this.text;
    span.dataset["tag"] = this.dataset.tag || "";
    span.dataset["url"] = this.dataset.url || "";
    span.dataset["title"] = this.dataset.title || "";
    // const icon = document.createElement("span");
    // icon.className = "tag-icon";
    // icon.innerHTML = "✕";
    // icon.addEventListener("click", (e) => {
    //   e.stopPropagation();
    //   const [from, to] = this.getPosition() ?? [-1, -1];
    //   if (from !== -1 && to !== -1) {
    //     this.view.dispatch({
    //       changes: { from, to, insert: "" },
    //     });
    //   }
    // });
    span.addEventListener("click", () => {
      const [from, to] = this.getPosition() ?? [-1, -1];
      const event = new CustomEvent("globalTagClick", {
        detail: {
          view: this.view,
          type: this.type,
          dataset: this.dataset,
          content: span.textContent,
          from,
          to,
        },
      });
      window.dispatchEvent(event);
    });
    container.appendChild(span);
    // container.appendChild(icon);
    return container;
  }

  ignoreEvent() {
    return false;
  }
}

export default PlaceholderWidget;
