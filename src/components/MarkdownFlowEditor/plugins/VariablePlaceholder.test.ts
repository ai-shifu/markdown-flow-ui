// @vitest-environment jsdom
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { expect, it } from "vitest";
import VariablePlaceholder from "./VariablePlaceholder";

it.each(["你的性别是？", "Which-option?", "user_name", "\ufeffkey\ufeff"])(
  "keeps the exact key %s in a quick-edit placeholder and reveals it while editing",
  (name) => {
    const doc = `Before {{ ${name} }} after`;
    const view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [VariablePlaceholder],
      }),
      parent: document.body,
    });
    try {
      const getLabel = () =>
        view.dom.querySelector<HTMLElement>(".tag-variable [data-title]");
      expect(getLabel()?.dataset.title).toBe(name);
      view.dispatch({ selection: { anchor: doc.indexOf(name) + 1 } });
      expect(getLabel()).toBeNull();
      view.dispatch({ selection: { anchor: doc.length } });
      expect(getLabel()?.dataset.title).toBe(name);
      expect(view.state.doc.toString()).toBe(doc);
    } finally {
      view.destroy();
    }
  }
);
