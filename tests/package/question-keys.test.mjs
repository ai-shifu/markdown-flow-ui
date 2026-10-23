import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { after, test } from "node:test";
import React from "react";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html>");
for (const key of [
  "document",
  "window",
  "DOMParser",
  "Node",
  "Element",
  "HTMLElement",
  "NodeFilter",
]) {
  globalThis[key] = key === "window" ? dom.window : dom.window[key];
}
const require = createRequire(import.meta.url);
const { ContentRender } = require("../../dist/renderer.cjs");
const { cleanup, fireEvent, render } = await import("@testing-library/react");
after(() => dom.window.close());

for (const key of [
  "你的性别是？",
  "Which-option?",
  "user_name",
  "\ufeffkey\ufeff",
]) {
  test(`the built renderer submits the unchanged key ${JSON.stringify(key)}`, () => {
    let sent;
    const { container } = render(
      React.createElement(ContentRender, {
        content: `?[%{{ ${key} }} 男//male | 女//female | 秘密//secret]`,
        onSend: (params) => {
          sent = params;
        },
      })
    );
    try {
      const buttons = [...container.querySelectorAll("button")];
      assert.deepEqual(
        buttons.map((button) => button.textContent.trim()),
        ["男", "女", "秘密"]
      );
      fireEvent.click(buttons[1]);
      assert.deepEqual(sent, { variableName: key, buttonText: "female" });
    } finally {
      cleanup();
    }
  });
}
