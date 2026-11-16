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
const { ContentRender: EsmContentRender } =
  await import("../../dist/renderer.es.js");
const rendererKatex = require("../../dist/node_modules/katex/dist/katex.cjs");
const stylesheetKatex = require("katex");

test("production dependencies use patched KaTeX without an override", () => {
  const manifest = require("../../package.json");
  const lock = require("../../package-lock.json");
  assert.equal(manifest.overrides?.katex, undefined);
  assert.equal(manifest.pnpm?.overrides?.katex, undefined);
  assert.equal(manifest.dependencies["remark-math"], undefined);
  assert.equal(manifest.dependencies["rehype-katex"], undefined);
  for (const [path, entry] of Object.entries(lock.packages)) {
    if (!path.endsWith("/katex") || entry.dev) continue;
    const [major, minor, patch] = entry.version.split(".").map(Number);
    assert.ok(
      major > 0 || minor > 18 || (minor === 18 && patch >= 2),
      `Vulnerable production KaTeX: ${path}@${entry.version}`
    );
  }
});

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

test("the actual Markdown renderer ignores inherited trust for links and images", () => {
  const previous = Object.getOwnPropertyDescriptor(Object.prototype, "trust");
  Object.defineProperty(Object.prototype, "trust", {
    configurable: true,
    writable: true,
    value: true,
  });
  try {
    for (const source of [
      String.raw`$\href{javascript:alert(1)}{click}$`,
      String.raw`$\includegraphics{https://example.invalid/a.png}$`,
    ]) {
      const markup = renderToStaticMarkup(
        React.createElement(ContentRender, { content: source })
      );
      assert.match(markup, /class="katex"/);
      assert.doesNotMatch(
        markup,
        /href="javascript:|<img[^>]+example\.invalid/i
      );
    }
    const normal = renderToStaticMarkup(
      React.createElement(ContentRender, { content: String.raw`$x^2$` })
    );
    assert.match(normal, /class="katex"/);
  } finally {
    if (previous) Object.defineProperty(Object.prototype, "trust", previous);
    else delete Object.prototype.trust;
  }
});

for (const [format, Component] of [
  ["CJS", ContentRender],
  ["ESM", EsmContentRender],
]) {
  test(`${format} preserves ordinary and escaped Markdown math`, () => {
    for (const source of [
      "Before $x^2$ after",
      "$$\n\\frac{1}{2}\n$$",
      "```math\nx^2\n```",
    ]) {
      const markup = renderToStaticMarkup(
        React.createElement(Component, { content: source })
      );
      assert.match(markup, /class="katex"/);
      assert.doesNotMatch(markup, /class="katex-error"/);
    }
    for (const source of ["`$x$`", String.raw`\$x\$`]) {
      const markup = renderToStaticMarkup(
        React.createElement(Component, { content: source })
      );
      assert.doesNotMatch(markup, /class="katex"/);
    }
  });
}

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
