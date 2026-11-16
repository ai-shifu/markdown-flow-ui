import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
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
const mermaidRequire = createRequire(require.resolve("mermaid"));

test("does not force the KaTeX dependency version", () => {
  const manifest = require("../../package.json");
  assert.equal(manifest.overrides?.katex, undefined);
  assert.equal(manifest.pnpm?.overrides?.katex, undefined);
});

test("uses the same KaTeX version for Markdown rendering and its stylesheet", () => {
  assert.equal(rendererKatex.version, stylesheetKatex.version);
});

test("Mermaid's math stylesheet and shared fonts match its renderer", () => {
  const normalizeVersion = (css) =>
    css.replace(
      /(\.katex-version:after\{content:")[^"]+("\})/,
      "$1<version>$2"
    );
  const actualStyles = readFileSync(
    mermaidRequire.resolve("katex/dist/katex.min.css"),
    "utf8"
  );
  const suppliedStyles = readFileSync(
    require.resolve("katex-mermaid-css/dist/katex.min.css"),
    "utf8"
  );
  assert.equal(
    normalizeVersion(suppliedStyles),
    normalizeVersion(actualStyles)
  );
  const fonts = (name) =>
    join(dirname(require.resolve(`${name}/package.json`)), "dist/fonts");
  const markdownFonts = fonts("katex");
  const mermaidFonts = fonts("katex-mermaid-css");
  const actualMermaidFonts = join(
    dirname(mermaidRequire.resolve("katex/package.json")),
    "dist/fonts"
  );
  const files = readdirSync(mermaidFonts).sort();
  assert.deepEqual(files, readdirSync(markdownFonts).sort());
  for (const file of files) {
    assert.deepEqual(
      readFileSync(join(markdownFonts, file)),
      readFileSync(join(mermaidFonts, file)),
      file
    );
    assert.deepEqual(
      readFileSync(join(actualMermaidFonts, file)),
      readFileSync(join(mermaidFonts, file)),
      file
    );
  }
});

test("the actual Markdown renderer blocks inherited trust for links and images", () => {
  const previous = Object.getOwnPropertyDescriptor(Object.prototype, "trust");
  Object.defineProperty(Object.prototype, "trust", {
    configurable: true,
    writable: true,
    value: true,
  });
  try {
    const expression = String.raw`\includegraphics{https://example.invalid/a.png}`;
    // Confirm the installed KaTeX is vulnerable under this precondition.
    assert.match(rendererKatex.renderToString(expression, {}), /<img/);
    for (const source of [
      String.raw`$\href{https://example.invalid/}{click}$`,
      `$${expression}$`,
      "```math\n" + expression + "\n```",
      `<span class="math-inline">${expression}</span>`,
      `<iframe data-tag="video"></iframe>\n\n$${expression}$`,
    ]) {
      const markup = renderToStaticMarkup(
        React.createElement(ContentRender, { content: source })
      );
      assert.match(markup, /class="katex"/);
      assert.doesNotMatch(markup, /(?:href|src)="https:\/\/example\.invalid/i);
    }
  } finally {
    if (previous) Object.defineProperty(Object.prototype, "trust", previous);
    else delete Object.prototype.trust;
  }
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

    assert.match(markup, /class="base"/);
    assert.match(markup, /class="vlist"/);
    assert.match(css, /\.katex\s+\.base\s*\{/);
    assert.match(css, /\.katex-base\s*\{/);
    assert.match(css, /\.vlist\s*\{/);
    assert.doesNotMatch(markup, /class="katex-error"/);
  });
}
