// @vitest-environment jsdom
import React, { useEffect, useRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { EditorState, type TransactionSpec } from "@codemirror/state";
import type { CompletionContext } from "@codemirror/autocomplete";
import { createSlashCommands } from "./utils";
import { collectSyntaxHighlightRanges } from "./plugins/SyntaxHighlighter";
import Editor, { EditMode } from "./MarkdownFlowEditor";

vi.mock("@uiw/react-codemirror", () => ({
  default: function MockCodeMirror({
    value,
    extensions,
    onChange,
  }: {
    value: string;
    extensions: { value?: (update: unknown) => void }[];
    onChange: (value: string) => void;
  }) {
    const view = useRef<{
      state: EditorState;
      dispatch: (spec: TransactionSpec) => void;
      focus: () => void;
    }>({
      state: EditorState.create({ doc: value }),
      dispatch: (spec: TransactionSpec) => {
        view.current.state = view.current.state.update(spec).state;
        onChange(view.current.state.doc.toString());
      },
      focus: vi.fn(),
    });
    useEffect(() => {
      extensions.at(-1)?.value?.({ view: view.current, selectionSet: false });
    }, [extensions]);
    return (
      <textarea
        aria-label="Source"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  },
}));

beforeEach(() => vi.stubGlobal("React", React));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it.each([EditMode.CodeEdit, EditMode.QuickEdit])(
  "authors questions without variable controls in %s",
  (mode) => {
    const onChange = vi.fn();
    const { container } = render(
      <Editor
        questionMode
        editMode={mode}
        locale="en-US"
        content=""
        onChange={onChange}
        variables={[{ name: "hidden" }]}
      />
    );
    expect(screen.queryByTitle("Insert existing variable")).toBeNull();
    expect(container.querySelector(".lucide-braces")).toBeNull();
    fireEvent.click(screen.getByTitle("Insert single choice"));
    expect(onChange).toHaveBeenLastCalledWith(
      "?[%{{ Your question }} Option 1 | Option 2]"
    );
  }
);

it.each([EditMode.CodeEdit, EditMode.QuickEdit])(
  "keeps removed variable controls absent across question mode transitions in %s",
  (editMode) => {
    const onChange = vi.fn();
    const { container, rerender } = render(
      <Editor editMode={editMode} locale="en-US" onChange={onChange} />
    );
    for (const questionMode of [true, false]) {
      rerender(
        <Editor
          editMode={editMode}
          locale="en-US"
          questionMode={questionMode}
          onChange={onChange}
        />
      );
      expect(screen.queryByTitle("Insert existing variable")).toBeNull();
      expect(container.querySelector(".lucide-braces")).toBeNull();
      expect(
        container.querySelector(".markdown-flow-editor-variable-search")
      ).toBeNull();
    }
    fireEvent.click(screen.getByTitle("Insert single choice"));
    expect(onChange).toHaveBeenLastCalledWith("?[%{{  }} Option 1 | Option 2]");
  }
);

it.each([
  ["Insert multi choice", "?[%{{ Your question }} Option 1 || Option 2]"],
  ["Insert input", "?[%{{ Your question }}...Please enter]"],
])("inserts a question for %s", (button, expected) => {
  const onChange = vi.fn();
  render(<Editor questionMode locale="en-US" onChange={onChange} />);
  fireEvent.click(screen.getByTitle(button));
  expect(onChange).toHaveBeenLastCalledWith(expected);
});

it("preserves standalone braces and punctuation in source edits", () => {
  const onChange = vi.fn();
  render(<Editor questionMode locale="zh-CN" onChange={onChange} />);
  const source =
    "{{ordinary text}} ?[%{{ Which [path] | level//hint...? }} A | B]";
  fireEvent.change(screen.getByLabelText("Source"), {
    target: { value: source },
  });
  expect(onChange).toHaveBeenLastCalledWith(source);
});

it("preserves the default blank interaction marker without variable controls", () => {
  const onChange = vi.fn();
  const { container } = render(<Editor locale="en-US" onChange={onChange} />);
  expect(screen.queryByTitle("Insert existing variable")).toBeNull();
  expect(container.querySelector(".lucide-braces")).toBeNull();
  fireEvent.click(screen.getByTitle("Insert single choice"));
  expect(onChange).toHaveBeenLastCalledWith("?[%{{  }} Option 1 | Option 2]");
});

it("omits variable slash completions while retaining media commands", () => {
  const context = {
    matchBefore: () => ({ from: 0, to: 1, text: "/" }),
  } as unknown as CompletionContext;
  const commands = createSlashCommands(vi.fn())(context);
  expect(commands?.options.map((option) => option.label)).toEqual([
    "Image",
    "Video",
  ]);
});

it("highlights the authored question while leaving standalone braces ordinary", () => {
  const source = "{{literal}} ?[%{{ Which [path] | level//hint...? }} A | B]";
  const ranges = collectSyntaxHighlightRanges(source, undefined, true);
  expect(
    ranges
      .filter((range) => range.className === "syntax-variable")
      .map((range) => source.slice(range.from, range.to))
  ).toEqual(["{{ Which [path] | level//hint...? }}"]);
});
