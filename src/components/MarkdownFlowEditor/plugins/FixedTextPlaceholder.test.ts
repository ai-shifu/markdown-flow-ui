// @vitest-environment jsdom
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { describe, expect, it } from "vitest";

import createFixedTextPlaceholder from "./FixedTextPlaceholder";

const placeholder = "Add preserved output";
const tooltip = "Preserved output";

const createView = (doc: string) =>
  new EditorView({
    state: EditorState.create({
      doc,
      extensions: [createFixedTextPlaceholder(placeholder, tooltip)],
    }),
    parent: document.body,
  });

const expectSingleTooltipSource = (view: EditorView, text: string) => {
  const tags = view.dom.querySelectorAll<HTMLElement>("[data-tooltip]");
  expect(tags).toHaveLength(1);
  expect(tags[0].textContent).toBe(text);
  expect(tags[0].dataset.tooltip).toBe(tooltip);
  expect(tags[0].closest("[title]")).toBeNull();
};

describe("preserved output placeholder tooltips", () => {
  it.each([
    ["======", placeholder],
    ["===Hello===", "Hello"],
  ])("uses only the CSS tooltip for %s", (doc, text) => {
    const view = createView(doc);
    try {
      expectSingleTooltipSource(view, text);
      expect(view.state.doc.toString()).toBe(doc);
    } finally {
      view.destroy();
    }
  });

  it("keeps one tooltip source when an empty preserved output is filled and cleared", () => {
    const view = createView("======");
    try {
      view.dispatch({ changes: { from: 3, insert: "Hello" } });
      expectSingleTooltipSource(view, "Hello");
      view.dispatch({ changes: { from: 3, to: 8 } });
      expectSingleTooltipSource(view, placeholder);
      expect(view.state.doc.toString()).toBe("======");
    } finally {
      view.destroy();
    }
  });
});
