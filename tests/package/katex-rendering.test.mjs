import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { after, test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html>", { pretendToBeVisual: true });
globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(
  dom.window
);
globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(
  dom.window
);
for (const key of [
  "document",
  "window",
  "DOMParser",
  "Node",
  "Element",
  "HTMLElement",
  "NodeFilter",
  "MutationObserver",
]) {
  globalThis[key] = key === "window" ? dom.window : dom.window[key];
}
after(() => dom.window.close());

const require = createRequire(import.meta.url);
const { ContentRender } = require("../../dist/renderer.cjs");
const rendererRequire = createRequire(require.resolve("rehype-katex"));
const rendererKatex = rendererRequire("katex");
const stylesheetKatex = require("katex");

test("uses the same KaTeX version for Markdown rendering and its stylesheet", () => {
  assert.equal(rendererKatex.version, stylesheetKatex.version);
});

test("the Markdown math renderer rejects inherited trust settings", () => {
  const inheritedOptions = Object.create({ trust: true });
  const markup = rendererKatex.renderToString(
    String.raw`\href{javascript:alert(1)}{click}`,
    inheritedOptions
  );
  assert.doesNotMatch(markup, /href=/);
});

for (const stylesheet of [
  "dist/markdown-flow-ui.css",
  "dist/markdown-flow-ui-lib.css",
]) {
  test(`${stylesheet} matches the built renderer's fraction layout classes`, () => {
    const markup = renderToStaticMarkup(
      React.createElement(ContentRender, {
        content: "$$\n\\frac{1}{2} + x^2\n$$",
      })
    );
    const css = readFileSync(
      new URL(`../../${stylesheet}`, import.meta.url),
      "utf8"
    );

    assert.match(markup, /class="katex-base"/);
    assert.match(markup, /class="vlist"/);
    assert.match(css, /\.katex-base\s*\{/);
    assert.match(css, /\.vlist\s*\{/);
    assert.doesNotMatch(markup, /class="katex-error"/);
  });
}
