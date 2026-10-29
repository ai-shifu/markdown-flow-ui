import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { after, afterEach, test } from "node:test";
import React from "react";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  pretendToBeVisual: true,
});
for (const key of [
  "document",
  "window",
  "navigator",
  "DOMParser",
  "Node",
  "Element",
  "HTMLElement",
  "SVGElement",
  "NodeFilter",
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
const { cleanup, fireEvent, render } = await import("@testing-library/react");
afterEach(cleanup);
after(() => dom.window.close());

for (const format of ["esm", "cjs"]) {
  // Load the public built entry so the tests exercise its bundled parser.
  const { ContentRender } =
    format === "esm"
      ? await import("markdown-flow-ui/renderer")
      : require("markdown-flow-ui/renderer");

  for (const marker of ["{{goal}}", "%{{goal}}"]) {
    const name = `the built ${format} renderer with ${marker}`;

    test(`${name} submits and replays a named single choice`, () => {
      const sent = [];
      const content = `?[${marker} A//a | B//b]`;
      const onSend = (params) => sent.push(params);
      const { container, getByRole, rerender } = render(
        React.createElement(ContentRender, { content, onSend })
      );

      assert.deepEqual(
        [...container.querySelectorAll("button")].map(
          (button) => button.textContent
        ),
        ["A", "B"]
      );
      fireEvent.click(getByRole("button", { name: "B", exact: true }));
      assert.deepEqual(sent, [{ variableName: "goal", buttonText: "b" }]);

      rerender(
        React.createElement(ContentRender, {
          content,
          onSend,
          readonly: true,
          userInput: JSON.stringify({ buttonText: "b" }),
        })
      );
      const replayed = getByRole("button", { name: "B", exact: true });
      assert.equal(replayed.classList.contains("select"), true);
      assert.equal(replayed.disabled, true);
      fireEvent.click(replayed);
      assert.equal(sent.length, 1);
    });

    test(`${name} submits and replays named multiple choices`, () => {
      const sent = [];
      const content = `?[${marker} A//a || B//b]`;
      const onSend = (params) => sent.push(params);
      const props = { content, onSend, confirmButtonText: "Confirm" };
      const { getByRole, getAllByRole, rerender } = render(
        React.createElement(ContentRender, props)
      );

      assert.equal(getByRole("button", { name: "Confirm" }).disabled, true);
      fireEvent.click(getByRole("checkbox", { name: "A", exact: true }));
      fireEvent.click(getByRole("checkbox", { name: "B", exact: true }));
      fireEvent.click(getByRole("button", { name: "Confirm" }));
      assert.deepEqual(sent, [
        {
          variableName: "goal",
          selectedValues: ["a", "b"],
          inputText: undefined,
        },
      ]);

      rerender(
        React.createElement(ContentRender, {
          ...props,
          readonly: true,
          userInput: JSON.stringify({ selectedValues: ["a", "b"] }),
        })
      );
      for (const checkbox of getAllByRole("checkbox")) {
        assert.equal(checkbox.checked, true);
        assert.equal(checkbox.disabled, true);
      }
      assert.equal(getByRole("button", { name: "Confirm" }).disabled, true);
      fireEvent.click(getByRole("button", { name: "Confirm" }));
      assert.equal(sent.length, 1);
    });

    test(`${name} submits and replays a named mixed answer`, () => {
      const sent = [];
      const content = `?[${marker} A//a || B//b || ...Explain]`;
      const onSend = (params) => sent.push(params);
      const props = { content, onSend, confirmButtonText: "Confirm" };
      const { getByRole, rerender } = render(
        React.createElement(ContentRender, props)
      );

      fireEvent.click(getByRole("checkbox", { name: "A", exact: true }));
      fireEvent.change(getByRole("textbox", { name: "Explain" }), {
        target: { value: "A different goal" },
      });
      fireEvent.click(getByRole("button", { name: "Confirm" }));
      const answer = {
        variableName: "goal",
        selectedValues: ["a"],
        inputText: "A different goal",
      };
      assert.deepEqual(sent, [answer]);

      rerender(
        React.createElement(ContentRender, {
          ...props,
          readonly: true,
          userInput: JSON.stringify(answer),
        })
      );
      assert.equal(getByRole("checkbox", { name: "A" }).checked, true);
      assert.equal(getByRole("checkbox", { name: "B" }).checked, false);
      assert.equal(
        getByRole("textbox", { name: "Explain" }).value,
        "A different goal"
      );
      assert.equal(getByRole("textbox", { name: "Explain" }).disabled, true);
      assert.equal(getByRole("button", { name: "Confirm" }).disabled, true);
      assert.equal(sent.length, 1);
    });

    for (const [literalName, source, expectedElement] of [
      ["inline code", `\`?[${marker} A | B]\``, "code"],
      ["fenced code", `\`\`\`text\n?[${marker} A | B]\n\`\`\``, "code"],
      ["an escaped question", `\\?[${marker} A | B]`, null],
      [
        "an image with escaped punctuation",
        `![?[${marker} A | B]](/diagram\\(v1\\).png)`,
        "img",
      ],
    ]) {
      test(`${name} preserves ${literalName} as a literal`, () => {
        const sent = [];
        const { container } = render(
          React.createElement(ContentRender, {
            content: source,
            onSend: (params) => sent.push(params),
          })
        );

        assert.equal(
          container.querySelectorAll(".custom-variable-container").length,
          0
        );
        assert.equal(container.querySelectorAll("textarea").length, 0);
        if (expectedElement) {
          assert.ok(container.querySelector(expectedElement));
        }
        const literal = `?[${marker} A | B]`;
        if (expectedElement === "img") {
          assert.equal(
            container.querySelector("img").getAttribute("alt"),
            literal
          );
        } else {
          const rendered = expectedElement
            ? container.querySelector(expectedElement).textContent
            : container.textContent;
          assert.ok(rendered.includes(literal));
        }
        assert.deepEqual(sent, []);
      });
    }

    for (const [lineEndingName, lineEnding] of [
      ["LF", "\n"],
      ["CRLF", "\r\n"],
      ["CR", "\r"],
    ]) {
      for (const angleDestination of [false, true]) {
        for (const blockquote of [false, true]) {
          const destination = `/diagram\\${lineEnding}.png`;
          let source = `![?[${marker} A | B]](${angleDestination ? `<${destination}>` : destination})`;
          if (blockquote) {
            source = source
              .split(lineEnding)
              .map((line) => `> ${line}`)
              .join(lineEnding);
          }

          test(`${name} keeps the named question in an invalid ${angleDestination ? "angle" : "bare"} image destination with ${lineEndingName}${blockquote ? " in a quote" : ""}`, () => {
            let sent;
            const { container, getByRole } = render(
              React.createElement(ContentRender, {
                content: source,
                onSend: (params) => {
                  sent = params;
                },
              })
            );

            assert.equal(container.querySelectorAll("img").length, 0);
            assert.deepEqual(
              [...container.querySelectorAll("button")].map(
                (button) => button.textContent
              ),
              ["A", "B"]
            );
            fireEvent.click(getByRole("button", { name: "B", exact: true }));
            assert.deepEqual(sent, { variableName: "goal", buttonText: "B" });
          });
        }
      }
    }
  }
}
