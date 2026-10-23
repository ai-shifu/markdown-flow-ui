import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { after, test } from "node:test";
import React from "react";
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

const contract = JSON.parse(
  readFileSync(
    new URL("../fixtures/variable-name-contract.json", import.meta.url),
    "utf8"
  )
);
for (const { source, name, buttons: labels, values } of contract.interactions) {
  test(`the built renderer keeps the opaque key ${JSON.stringify(name)}`, () => {
    let sent;
    const { container } = render(
      React.createElement(ContentRender, {
        content: source,
        onSend: (params) => {
          sent = params;
        },
      })
    );
    try {
      const buttons = [...container.querySelectorAll("button")];
      assert.deepEqual(
        buttons.map((button) => button.textContent),
        labels
      );
      fireEvent.click(buttons.at(-1));
      assert.deepEqual(sent, { variableName: name, buttonText: values.at(-1) });
    } finally {
      cleanup();
    }
  });
}

test("the built renderer rejects raw NUL instead of storing a replacement-character alias", () => {
  let sent;
  const { container } = render(
    React.createElement(ContentRender, {
      content: "?[%{{ bad\u0000key }} A | B]",
      onSend: (params) => {
        sent = params;
      },
    })
  );
  try {
    assert.equal(container.querySelectorAll("button").length, 0);
    assert.equal(sent, undefined);
  } finally {
    cleanup();
  }
});

for (const example of contract.boundary_cases) {
  test(`the built renderer preserves marker boundaries in ${JSON.stringify(example.source)}`, () => {
    let sent;
    const { container } = render(
      React.createElement(ContentRender, {
        content: example.source,
        onSend: (params) => {
          sent = params;
        },
      })
    );
    try {
      const buttons = [...container.querySelectorAll("button")];
      if (!example.interaction_count) {
        assert.equal(buttons.length, 0);
        assert.equal(sent, undefined);
        return;
      }
      assert.deepEqual(
        buttons.map((button) => button.textContent),
        example.buttons
      );
      fireEvent.click(buttons.at(-1));
      assert.deepEqual(sent, {
        variableName: example.name ?? "",
        buttonText: example.values.at(-1),
      });
    } finally {
      cleanup();
    }
  });
}

test("the built renderer preserves BOM-prefixed replay selection", () => {
  const value = "\ufeff%{{ x]y }} A";
  const { container } = render(
    React.createElement(ContentRender, {
      content: "?[\ufeff%{{ x]y }} A | B]",
      userInput: value,
    })
  );
  try {
    assert.equal(
      container.querySelector("button").classList.contains("select"),
      true
    );
  } finally {
    cleanup();
  }
});

const containers = [
  { name: "paragraph", wrap: (source) => source },
  {
    name: "blockquote",
    wrap: (source) =>
      source
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n"),
  },
  {
    name: "list",
    wrap: (source) =>
      source
        .split("\n")
        .map((line, index) => `${index ? "  " : "- "}${line}`)
        .join("\n"),
  },
  {
    name: "quoted list",
    wrap: (source) =>
      source
        .split("\n")
        .map((line, index) => `${index ? ">    " : "> 1. "}${line}`)
        .join("\n"),
  },
];

for (const { name, wrap } of containers) {
  test(`the built renderer preserves multiline key padding in a ${name}`, () => {
    let sent;
    const { container } = render(
      React.createElement(ContentRender, {
        content: wrap("?[%{{\t\n good\ufffd题\t\r\n}} A//a | B//b]"),
        onSend: (params) => {
          sent = params;
        },
      })
    );
    try {
      const buttons = [...container.querySelectorAll("button")];
      assert.deepEqual(
        buttons.map((button) => button.textContent),
        ["A", "B"]
      );
      fireEvent.click(buttons[1]);
      assert.deepEqual(sent, { variableName: "good\ufffd题", buttonText: "b" });
    } finally {
      cleanup();
    }
  });

  test(`the built renderer rejects raw NUL in a multiline ${name} key`, () => {
    let sent;
    const { container } = render(
      React.createElement(ContentRender, {
        content: wrap("?[%{{\t\n bad🙂\ufffd\u0000\ufffdkey\t\r\n}} A | B]"),
        onSend: (params) => {
          sent = params;
        },
      })
    );
    try {
      assert.equal(container.querySelectorAll("button").length, 0);
      assert.equal(sent, undefined);
    } finally {
      cleanup();
    }
  });

  test(`the built renderer keeps a multiline standalone ${name} marker opaque`, () => {
    const { container } = render(
      React.createElement(ContentRender, {
        content: wrap("{{\n question ?[INNER | NEXT] \n}}\n\n?[Continue]"),
      })
    );
    try {
      assert.deepEqual(
        [...container.querySelectorAll("button")].map(
          (button) => button.textContent
        ),
        ["Continue"]
      );
      assert.ok(container.textContent.includes("?[INNER | NEXT]"));
    } finally {
      cleanup();
    }
  });
}

test("the built renderer keeps subsequent Markdown after an unfinished interaction with a closed key", () => {
  const { container } = render(
    React.createElement(ContentRender, {
      content: "?[%{{ name }} **strong**\n\n# Heading\n\n- Item",
    })
  );
  try {
    assert.equal(container.querySelectorAll("button").length, 0);
    assert.equal(container.querySelector("strong")?.textContent, "strong");
    assert.equal(container.querySelector("h1")?.textContent, "Heading");
    assert.equal(container.querySelector("li")?.textContent, "Item");
  } finally {
    cleanup();
  }
});

for (const [source, name] of [
  ["{{\n```key\n}} ?[A|B]", ""],
  ["?[%{{\n```key\n}} A|B]", "```key"],
  ["{{\n~~~key\n}} ?[A|B]", ""],
  ["?[%{{\n~~~key\n}} A|B]", "~~~key"],
]) {
  test(`the built renderer ignores fence syntax inside ${JSON.stringify(source)}`, () => {
    let sent;
    const { container } = render(
      React.createElement(ContentRender, {
        content: source,
        onSend: (params) => {
          sent = params;
        },
      })
    );
    try {
      const buttons = [...container.querySelectorAll("button")];
      assert.deepEqual(
        buttons.map((button) => button.textContent),
        ["A", "B"]
      );
      assert.equal(container.querySelector("pre, code, blockquote"), null);
      fireEvent.click(buttons[1]);
      assert.deepEqual(sent, { variableName: name, buttonText: "B" });
    } finally {
      cleanup();
    }
  });
}

for (const {
  id,
  source,
  name,
  buttons: labels,
  values,
} of contract.document_context_cases) {
  test(`the built renderer respects the ${id} document context`, () => {
    let sent;
    const { container, rerender } = render(
      React.createElement(ContentRender, {
        content: source,
        onSend: (params) => {
          sent = params;
        },
      })
    );
    try {
      const buttons = [...container.querySelectorAll("button")];
      assert.deepEqual(
        buttons.map((button) => button.textContent),
        labels
      );
      fireEvent.click(buttons.at(-1));
      assert.deepEqual(sent, {
        variableName: name ?? "",
        buttonText: values.at(-1),
      });
      rerender(
        React.createElement(ContentRender, {
          content: source,
          userInput: values.at(-1),
        })
      );
      assert.equal(
        container
          .querySelectorAll("button")
          [labels.length - 1].classList.contains("select"),
        true
      );
    } finally {
      cleanup();
    }
  });
}

for (const prefix of [
  "Show `{{` then ",
  "Show `{{`\n",
  "\\{{\n",
  'Text <span title="{{">\n',
  'Text <span title="before\n{{">\n',
  "Show \\{{ not a variable }} then ",
  "\\{{ example ",
  '[`code`](url "<!-- <figure></figure>")\n\n<!-- actual -->\n\n',
]) {
  test(`the built renderer protects markup in a real key after ${JSON.stringify(prefix)}`, () => {
    const name = '<svg><path data-name="`"></path></svg>';
    let sent;
    const { container } = render(
      React.createElement(ContentRender, {
        content: `${prefix}?[%{{ ${name} }} A//a|B//b]`,
        onSend: (params) => {
          sent = params;
        },
      })
    );
    try {
      const buttons = [...container.querySelectorAll("button")];
      assert.deepEqual(
        buttons.map((button) => button.textContent),
        ["A", "B"]
      );
      assert.equal(container.querySelector("svg, iframe"), null);
      fireEvent.click(buttons[1]);
      assert.deepEqual(sent, { variableName: name, buttonText: "b" });
    } finally {
      cleanup();
    }
  });
}

const documentBoundaries = JSON.parse(
  readFileSync(
    new URL("../fixtures/document-boundary-cases.json", import.meta.url),
    "utf8"
  )
);
for (const example of documentBoundaries) {
  test(`the built renderer does not invent a control across ${example.id}`, () => {
    let sent;
    const { container } = render(
      React.createElement(ContentRender, {
        content: example.source,
        onSend: (params) => {
          sent = params;
        },
      })
    );
    try {
      const buttons = [
        ...container.querySelectorAll(".custom-variable-container button"),
      ];
      if (!example.interaction_count) {
        assert.equal(buttons.length, 0);
        assert.equal(sent, undefined);
        return;
      }
      assert.deepEqual(
        buttons.map((button) => button.textContent),
        example.buttons
      );
      fireEvent.click(buttons[1]);
      assert.deepEqual(sent, { variableName: example.name, buttonText: "B" });
    } finally {
      cleanup();
    }
  });
}

for (const literal of ["$", "`", "resource"]) {
  test(`the built renderer keeps ${literal} syntax inside an interaction marker raw`, () => {
    const body =
      literal === "resource" ? '{{ [label](u "' : `${literal}{{ y${literal}`;
    const source = `?[%{{ q }} A ${body} | B]\n\n?[%{{ real }} C|D]`;
    let sent;
    const { container } = render(
      React.createElement(ContentRender, {
        content: source,
        onSend: (params) => {
          sent = params;
        },
      })
    );
    try {
      const buttons = [
        ...container.querySelectorAll(".custom-variable-container button"),
      ];
      assert.equal(buttons.length, 2);
      assert.equal(buttons[1].textContent, "D");
      fireEvent.click(buttons[1]);
      assert.deepEqual(sent, { variableName: "q", buttonText: "D" });
    } finally {
      cleanup();
    }
  });
}
