import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { after, test } from "node:test";
import React from "react";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  pretendToBeVisual: true,
});
for (const key of [
  "document",
  "window",
  "navigator",
  "Node",
  "Element",
  "HTMLElement",
  "MutationObserver",
  "getComputedStyle",
]) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    writable: true,
    value: key === "window" ? dom.window : dom.window[key],
  });
}
globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(
  dom.window
);
globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(
  dom.window
);

const require = createRequire(import.meta.url);
const { cleanup, render } = await import("@testing-library/react");
after(() => dom.window.close());

for (const format of ["esm", "cjs"]) {
  const loadEditor = () =>
    format === "esm"
      ? import("markdown-flow-ui/editor")
      : require("markdown-flow-ui/editor");
  const loadUtils = () =>
    format === "esm"
      ? import("../../dist/components/MarkdownFlowEditor/utils.es.js")
      : require("../../dist/components/MarkdownFlowEditor/utils.cjs");

  test(`the built ${format} editor preserves its variable helper bindings`, async () => {
    const {
      findDocumentVariableMarkers,
      findVariableMarkers,
      trimVariablePadding,
    } = await loadUtils();

    assert.equal(trimVariablePadding("\u0085\u001clearner\u001f"), "learner");
    assert.deepEqual(findVariableMarkers("{{ learner }}"), [
      { start: 0, end: 13, rawName: " learner ", name: "learner" },
    ]);
    assert.deepEqual(findDocumentVariableMarkers("{{\n learner\n }}"), [
      { start: 0, end: 15, rawName: "\n learner\n ", name: "learner" },
    ]);
  });

  test(`the built ${format} public editor entry mounts and accepts content updates`, async () => {
    const { MarkdownFlowEditor } = await loadEditor();
    const content = "# Course\n\nHello {{ learner }}";
    const { container, rerender } = render(
      React.createElement(MarkdownFlowEditor, {
        content,
        editMode: "quickEdit",
      })
    );
    try {
      assert.ok(container.querySelector(".cm-editor"));
      assert.ok(
        container
          .querySelector(".cm-content")
          .textContent.includes("{{ learner }}")
      );
      rerender(
        React.createElement(MarkdownFlowEditor, {
          content: "Updated {{ learner }}",
          editMode: "quickEdit",
        })
      );
      assert.ok(
        container
          .querySelector(".cm-content")
          .textContent.includes("Updated {{ learner }}")
      );
    } finally {
      cleanup();
    }
  });
}
