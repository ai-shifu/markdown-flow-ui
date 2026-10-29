import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { after, test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";

const require = createRequire(import.meta.url);
const dom = new JSDOM("<!doctype html><html><body></body></html>");
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.DOMParser = dom.window.DOMParser;
after(() => dom.window.close());

for (const format of ["esm", "cjs"]) {
  const { ContentRender } =
    format === "esm"
      ? await import("markdown-flow-ui/renderer")
      : require("markdown-flow-ui/renderer");

  for (const separator of ["&#32;", "&#x20;", "&#9;", "&#x09;"]) {
    test(`the ${format} renderer rejects class injection through ${separator} in a code language`, () => {
      const markup = renderToStaticMarkup(
        React.createElement(ContentRender, {
          content: `\`\`\`js${separator}security-probe\nconst value = 1;\n\`\`\``,
          enableTypewriter: false,
        })
      );

      assert.match(markup, /class="[^"]*\blanguage-js\b/);
      assert.doesNotMatch(markup, /\bsecurity-probe\b/);
    });
  }

  test(`the ${format} renderer preserves normal code highlighting and task lists`, () => {
    const markup = renderToStaticMarkup(
      React.createElement(ContentRender, {
        content: "```js\nconst value = 1;\n```\n\n- [x] Complete",
        enableTypewriter: false,
      })
    );

    assert.match(markup, /class="[^"]*\blanguage-js\b/);
    assert.match(markup, /class="[^"]*\bhljs-keyword\b/);
    assert.match(markup, /type="checkbox"[^>]*checked/);
    assert.match(markup, /Complete/);
  });
}
