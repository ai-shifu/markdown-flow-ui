import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const packageRoot = new URL("../../", import.meta.url);
const manifest = JSON.parse(
  readFileSync(new URL("package.json", packageRoot), "utf8")
);

for (const entry of [
  "./dist/markdown-flow-ui.css",
  "./dist/markdown-flow-ui-lib.css",
]) {
  test(`${entry} includes code highlighting and math styles`, () => {
    const cssUrl = new URL(manifest.exports[entry].default, packageRoot);
    const css = readFileSync(cssUrl, "utf8");
    assert.match(css, /\.hljs-keyword\b/);
    assert.match(css, /\.katex\b/);
    assert.match(css, /font-family:\s*KaTeX_Main/);
    assert.match(css, /@font-face/);
    for (const [, fontPath] of css.matchAll(/url\(([^)]+KaTeX_[^)]+)\)/g)) {
      const path = fontPath.replaceAll(/["']/g, "");
      assert.ok(
        existsSync(new URL(path, cssUrl)),
        `Missing math font: ${path}`
      );
    }
  });
}
