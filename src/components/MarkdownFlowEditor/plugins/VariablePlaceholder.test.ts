// @vitest-environment jsdom
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { expect, it } from "vitest";
import VariablePlaceholder from "./VariablePlaceholder";

it.each([
  "你的性别是？",
  "Which-option?",
  "user_name",
  "\ufeffkey\ufeff",
  "first  name",
  "Which [path] | level//hint...?",
  "a{b",
  "a}",
  "{{inner",
  "path\\",
])(
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
      const existingLabel = getLabel();
      view.dispatch({ selection: { anchor: 1 } });
      expect(getLabel()).toBe(existingLabel);
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

it("does not turn a nested opener inside an invalid outer marker into a placeholder", () => {
  const doc = "Before {{ invalid\u0000{{inner }} after";
  const view = new EditorView({
    state: EditorState.create({ doc, extensions: [VariablePlaceholder] }),
    parent: document.body,
  });
  try {
    expect(view.dom.querySelector(".tag-variable")).toBeNull();
    expect(view.state.doc.toString()).toBe(doc);
  } finally {
    view.destroy();
  }
});

it("keeps multiline boundary padding editable without an inline replacement across lines", () => {
  const doc = "Before {{ \n name \n }} after";
  const view = new EditorView({
    state: EditorState.create({ doc, extensions: [VariablePlaceholder] }),
    parent: document.body,
  });
  try {
    expect(view.dom.querySelector(".tag-variable")).toBeNull();
    expect(view.state.doc.toString()).toBe(doc);
  } finally {
    view.destroy();
  }
});

import contract from "../../../../tests/fixtures/variable-name-contract.json";

it.each(contract.document_context_cases)(
  "keeps placeholder names within document context $id",
  ({ source, names }) => {
    const view = new EditorView({
      state: EditorState.create({
        doc: source,
        extensions: [VariablePlaceholder],
      }),
      parent: document.body,
    });
    try {
      expect(
        [
          ...view.dom.querySelectorAll<HTMLElement>(
            ".tag-variable [data-title]"
          ),
        ].map((label) => label.dataset.title)
      ).toEqual(names);
      expect(view.state.doc.toString()).toBe(source);
    } finally {
      view.destroy();
    }
  }
);

import documentBoundaries from "../../../../tests/fixtures/document-boundary-cases.json";

it.each(documentBoundaries)(
  "keeps placeholders within $id",
  ({ source, placeholders }) => {
    const view = new EditorView({
      state: EditorState.create({
        doc: source,
        extensions: [VariablePlaceholder],
      }),
      parent: document.body,
    });
    try {
      expect(
        [
          ...view.dom.querySelectorAll<HTMLElement>(
            ".tag-variable [data-title]"
          ),
        ].map((label) => label.dataset.title)
      ).toEqual(placeholders);
    } finally {
      view.destroy();
    }
  }
);
