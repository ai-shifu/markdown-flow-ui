// @vitest-environment jsdom
import { EditorSelection, EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { describe, expect, it, vi } from "vitest";
import ImgPlaceholder from "./ImgPlaceholder";
import VideoPlaceholder from "./VideoPlaceholder";

const mediaCases = [
  {
    kind: "Markdown image",
    source: "![avatar](https://example.com/avatar.png)",
    tag: "image",
    url: "https://example.com/avatar.png",
  },
  {
    kind: "HTML image",
    source: '<img src="https://example.com/avatar.png" alt="avatar">',
    tag: "image",
    url: "https://example.com/avatar.png",
  },
  {
    kind: "video",
    source:
      '<iframe src="https://example.com/video" data-tag="video" data-title="video"></iframe>',
    tag: "video",
    url: "https://example.com/video",
  },
];

const createView = (doc: string) =>
  new EditorView({
    state: EditorState.create({
      doc,
      extensions: [ImgPlaceholder, VideoPlaceholder],
    }),
    parent: document.body,
  });

describe.each(mediaCases)(
  "$kind inside variable names",
  ({ source, tag, url }) => {
    it.each(["{{", "?[%{{"])(
      "keeps the source and cursor editable in a %s marker while preserving outside media",
      (opener) => {
        const suffix = opener.startsWith("?[") ? " A | B]" : "";
        const firstLine = `Before ${opener} ${source} }}${suffix} after`;
        const doc = `${firstLine}\n\n${source}`;
        const view = createView(doc);
        const onTagClick = vi.fn();
        window.addEventListener("globalTagClick", onTagClick);
        try {
          expect(view.contentDOM.querySelector(".cm-line")?.textContent).toBe(
            firstLine
          );
          expect(view.dom.querySelectorAll(`.tag-${tag}`)).toHaveLength(1);

          const position = doc.indexOf("https") + 3;
          expect(
            view.moveByChar(EditorSelection.cursor(position), true).head
          ).toBe(position + 1);
          view.dispatch({ selection: { anchor: position } });
          view.dispatch(view.state.replaceSelection("X"));
          const editedSource = `${doc.slice(0, position)}X${doc.slice(position)}`;
          expect(view.state.doc.toString()).toBe(editedSource);
          expect(view.contentDOM.querySelector(".cm-line")?.textContent).toBe(
            `${firstLine.slice(0, position)}X${firstLine.slice(position)}`
          );
          expect(view.dom.querySelectorAll(`.tag-${tag}`)).toHaveLength(1);

          view.dom
            .querySelector<HTMLElement>(`.tag-${tag} .tag-placeholder-content`)!
            .click();
          expect(onTagClick).toHaveBeenCalledOnce();
          const event = onTagClick.mock.calls[0][0] as CustomEvent;
          expect(event.detail.dataset).toMatchObject({ tag, url });
          expect(
            view.state.doc.sliceString(event.detail.from, event.detail.to)
          ).toBe(source);
        } finally {
          window.removeEventListener("globalTagClick", onTagClick);
          view.destroy();
        }
      }
    );

    it.each([source, `=== ${source} ===`])(
      "updates an untouched media line when a multiline variable gains or loses its closing brace (%s)",
      (media) => {
        const doc = `Before {{\n${media}\n} after\n\n${media}`;
        const view = createView(doc);
        try {
          expect(view.dom.querySelectorAll(`.tag-${tag}`)).toHaveLength(2);
          const closingPosition = doc.indexOf("} after") + 1;
          view.dispatch({ changes: { from: closingPosition, insert: "}" } });
          expect(view.dom.querySelectorAll(`.tag-${tag}`)).toHaveLength(1);
          expect(
            view.contentDOM.querySelectorAll(".cm-line")[1].textContent
          ).toBe(media);
          view.dispatch({
            changes: {
              from: closingPosition,
              to: closingPosition + 1,
              insert: "",
            },
          });
          expect(view.dom.querySelectorAll(`.tag-${tag}`)).toHaveLength(2);
          expect(view.state.doc.toString()).toBe(doc);
        } finally {
          view.destroy();
        }
      }
    );
  }
);
