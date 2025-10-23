import { EditorView, Decoration, WidgetType } from "@codemirror/view";
import { SelectedOption } from "../types";

const SVG_NS = "http://www.w3.org/2000/svg";

const createSvgElement = (tag: string) => document.createElementNS(SVG_NS, tag);
// TODO: if use renderToStaticMarkup & createElement, it will cause react & react-dom version mismatch
// so we use lucide-react to build the icon
// lucide-react image icon
const buildImageIcon = () => {
  const svg = createSvgElement("svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "14");
  svg.setAttribute("height", "14");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.5");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");

  const rect = createSvgElement("rect");
  rect.setAttribute("width", "18");
  rect.setAttribute("height", "18");
  rect.setAttribute("x", "3");
  rect.setAttribute("y", "3");
  rect.setAttribute("rx", "2");
  rect.setAttribute("ry", "2");

  const circle = createSvgElement("circle");
  circle.setAttribute("cx", "9");
  circle.setAttribute("cy", "9");
  circle.setAttribute("r", "2");

  const path = createSvgElement("path");
  path.setAttribute("d", "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21");

  svg.append(rect, circle, path);
  return svg;
};

// lucide-react image icon
const buildVideoIcon = () => {
  const svg = createSvgElement("svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "14");
  svg.setAttribute("height", "14");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.5");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");

  const rect = createSvgElement("rect");
  rect.setAttribute("width", "18");
  rect.setAttribute("height", "18");
  rect.setAttribute("x", "3");
  rect.setAttribute("y", "3");
  rect.setAttribute("rx", "2");

  const path = createSvgElement("path");
  path.setAttribute("d", "m9 8 6 4-6 4Z");

  svg.append(rect, path);
  return svg;
};

class PlaceholderWidget extends WidgetType {
  constructor(
    private text: string,
    private dataset: {
      tag: "image" | "video" | "variable";
      title?: string;
      url?: string;
      scalePercent?: number;
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
    span.addEventListener("click", (e) => {
      const [from, to] = this.getPosition() ?? [-1, -1];
      const event = new CustomEvent("globalTagClick", {
        detail: {
          view: this.view,
          type: this.type,
          dataset: this.dataset,
          content: span.textContent,
          from,
          to,
          target: e.currentTarget,
        },
      });
      window.dispatchEvent(event);
    });
    if (this.dataset.tag === "image" || this.dataset.tag === "video") {
      const iconWrapper = document.createElement("span");
      iconWrapper.className = "tag-placeholder-icon";

      const icon =
        this.dataset.tag === "image" ? buildImageIcon() : buildVideoIcon();
      iconWrapper.appendChild(icon);
      container.appendChild(iconWrapper);
    }
    container.appendChild(span);
    // container.appendChild(icon);
    return container;
  }

  ignoreEvent() {
    return false;
  }
}

export default PlaceholderWidget;
