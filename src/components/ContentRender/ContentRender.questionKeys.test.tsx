// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ContentRender from "./ContentRender";

vi.mock("mermaid", () => ({ default: {} }));
const sandbox = vi.hoisted(() =>
  vi.fn<(props: { content: string }) => null>(() => null)
);
vi.mock("./IframeSandbox", () => ({ default: sandbox }));

afterEach(() => {
  cleanup();
  sandbox.mockClear();
});

it("keeps a complete HTML header mounted before a real control", () => {
  const { container } = render(
    <ContentRender content={"<div>Card\n\n?[%{{ real }} A|B]"} />
  );
  expect(sandbox.mock.calls[0]?.[0]).toEqual(
    expect.objectContaining({ content: "<div>Card" })
  );
  expect(
    [...container.querySelectorAll(".custom-variable-container button")].map(
      (button) => button.textContent
    )
  ).toEqual(["A", "B"]);
});

it.each(["script", "style"])(
  "does not mount an incomplete %s header before a real control",
  (tag) => {
    render(
      <ContentRender
        content={`<${tag}\n\n{{ unfinished\n</${tag}>\n\n?[%{{ real }} A|B]`}
      />
    );
    expect(sandbox).not.toHaveBeenCalled();
  }
);

it.each([
  "你的性别是？",
  "Which-option?",
  "user_name",
  "école",
  "نام؟",
  "年齢🙂?",
  "\ufeffkey\ufeff",
])("renders and submits the exact question key %s", (name) => {
  const onSend = vi.fn();
  const { container } = render(
    <ContentRender
      content={`?[%{{ ${name} }} 男//male | 女//female | 秘密//secret]`}
      onSend={onSend}
    />
  );
  expect(
    Array.from(container.querySelectorAll("button"), (button) =>
      button.textContent?.trim()
    )
  ).toEqual(["男", "女", "秘密"]);
  expect(container.textContent).not.toContain(name);
  fireEvent.click(screen.getByRole("button", { name: "女" }));
  expect(onSend).toHaveBeenCalledWith({
    variableName: name,
    buttonText: "female",
  });
});

it("keeps the authored question text unchanged", () => {
  const { container } = render(
    <ContentRender
      content={"你的性别是？\n\n?[%{{你的性别是？}} 男 | 女 | 秘密]"}
    />
  );
  expect(container.textContent?.match(/你的性别是？/g)).toHaveLength(1);
  expect(screen.getByText("你的性别是？")).toBeTruthy();
});

it("submits multi-select values under a question key", () => {
  const onSend = vi.fn();
  render(
    <ContentRender
      content="?[%{{学过哪些？}} 数学//math || 英语//english]"
      confirmButtonText="Submit"
      onSend={onSend}
    />
  );
  fireEvent.click(screen.getByRole("checkbox", { name: "数学" }));
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
  expect(onSend).toHaveBeenCalledWith({
    variableName: "学过哪些？",
    selectedValues: ["math"],
    inputText: undefined,
  });
});

it("submits text input under a question key", () => {
  const onSend = vi.fn();
  render(
    <ContentRender content="?[%{{你的目标是？}} ...请回答]" onSend={onSend} />
  );
  const input = screen.getByPlaceholderText("请回答");
  fireEvent.change(input, { target: { value: "Learn" } });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(onSend).toHaveBeenCalledWith({
    variableName: "你的目标是？",
    inputText: "Learn",
  });
});

it("keeps a legal BOM-only key when deriving an assignment-only button", () => {
  const onSend = vi.fn();
  const { container } = render(
    <ContentRender content={"?[%{{\ufeff}}]"} onSend={onSend} />
  );
  const button = container.querySelector("button");
  expect(button?.textContent).toBe("\ufeff");
  fireEvent.click(button!);
  expect(onSend).toHaveBeenCalledWith({
    variableName: "\ufeff",
    buttonText: "\ufeff",
  });
});

import contract from "../../../tests/fixtures/variable-name-contract.json";
import { formatVariableAssignment } from "remark-flow";

it.each(contract.interactions)(
  "renders shared opaque key $name and submits its exact stored value",
  ({ source, name, buttons, values }) => {
    const onSend = vi.fn();
    const { container } = render(
      <ContentRender content={source} onSend={onSend} />
    );
    const rendered = [...container.querySelectorAll("button")];
    expect(rendered.map((button) => button.textContent)).toEqual(buttons);
    fireEvent.click(rendered[rendered.length - 1]);
    expect(onSend).toHaveBeenCalledWith({
      variableName: name,
      buttonText: values[values.length - 1],
    });
  }
);

it.each([
  "<div> card </div>",
  "<svg><path></path></svg>",
  "<script>literal</script>",
  "![image](https://example.com/image.png)",
  "```literal```",
  "`code` [choice] | level//hint...?",
  "{{inner",
  "a{b",
  "a}",
  "path\\",
  '"name"',
  "&amp;",
  "x & y < z",
])("keeps markup and delimiters in the key %s opaque", (name) => {
  const onSend = vi.fn();
  const { container } = render(
    <ContentRender
      content={`?[${formatVariableAssignment(name)} A//a | B//b]`}
      onSend={onSend}
    />
  );
  const buttons = [...container.querySelectorAll("button")];
  expect(buttons.map((button) => button.textContent)).toEqual(["A", "B"]);
  expect(container.querySelector("iframe, img, svg path, script")).toBeNull();
  fireEvent.click(buttons[1]);
  expect(onSend).toHaveBeenCalledWith({ variableName: name, buttonText: "b" });
});

it("keeps invalid raw NUL keys literal instead of creating replacement-character keys", () => {
  const onSend = vi.fn();
  const { container } = render(
    <ContentRender content={"?[%{{ bad\u0000key }} A | B]"} onSend={onSend} />
  );
  expect(container.querySelectorAll("button")).toHaveLength(0);
  expect(onSend).not.toHaveBeenCalled();
});

it("accepts a legal replacement-character key without changing it", () => {
  const onSend = vi.fn();
  const { container } = render(
    <ContentRender content={"?[%{{ bad\ufffdkey }} A | B]"} onSend={onSend} />
  );
  fireEvent.click(container.querySelectorAll("button")[0]);
  expect(onSend).toHaveBeenCalledWith({
    variableName: "bad\ufffdkey",
    buttonText: "A",
  });
});

it("keeps HTML in an incomplete streamed key inert until its marker closes", () => {
  const { container, rerender } = render(
    <ContentRender content="?[%{{ <svg><path></path></svg>" />
  );
  expect(container.querySelector("svg, iframe, button")).toBeNull();
  rerender(
    <ContentRender content="?[%{{ <svg><path></path></svg> }} A | B]" />
  );
  expect(
    [...container.querySelectorAll("button")].map(
      (button) => button.textContent
    )
  ).toEqual(["A", "B"]);
});

it("keeps an incomplete key literal in a Markdown run that follows a video", () => {
  const prefix =
    '<iframe data-tag="video" src="https://example.com/video"></iframe>\n\n';
  const { container, rerender } = render(
    <ContentRender content={`${prefix}?[%{{ <svg><path></path></svg>`} />
  );
  expect(container.querySelector("svg, button")).toBeNull();
  rerender(
    <ContentRender
      content={`${prefix}?[%{{ <svg><path></path></svg> }} A | B]`}
    />
  );
  expect(
    [...container.querySelectorAll("button")].map(
      (button) => button.textContent
    )
  ).toEqual(["A", "B"]);
});

it("keeps an opaque key whole in prose resumed after a closed HTML block", () => {
  const onSend = vi.fn();
  const { container } = render(
    <ContentRender
      content={"<div>Card</div>\n?[%{{ <svg><path></path></svg> }} A | B]"}
      onSend={onSend}
    />
  );
  const buttons = [...container.querySelectorAll("button")];
  expect(buttons.map((button) => button.textContent)).toEqual(["A", "B"]);
  fireEvent.click(buttons[0]);
  expect(onSend).toHaveBeenCalledWith({
    variableName: "<svg><path></path></svg>",
    buttonText: "A",
  });
});

it.each(contract.boundary_cases)(
  "keeps the shared variable boundary intact in $source",
  (example) => {
    const onSend = vi.fn();
    const { container } = render(
      <ContentRender content={example.source} onSend={onSend} />
    );
    const buttons = [...container.querySelectorAll("button")];
    if (!example.interaction_count) {
      expect(buttons).toHaveLength(0);
      expect(onSend).not.toHaveBeenCalled();
      return;
    }
    expect(buttons.map((button) => button.textContent)).toEqual(
      example.buttons
    );
    fireEvent.click(buttons[buttons.length - 1]);
    expect(onSend).toHaveBeenCalledWith({
      variableName: example.name ?? "",
      buttonText: example.values![example.values!.length - 1],
    });
  }
);

it("does not turn a question nested in a standalone opaque key into an interaction", () => {
  const { container } = render(<ContentRender content="{{ key ?[A|B] }}" />);
  expect(container.querySelectorAll("button")).toHaveLength(0);
  expect(container.textContent).toContain("{{ key ?[A|B] }}");
});

it.each(["{{ &amp; }}", "{{ key ?[A|B] }}", "{{ path\\ }}"])(
  "displays an unresolved raw reference literally: %s",
  (source) => {
    const { container } = render(<ContentRender content={source} />);
    expect(container.querySelector("button, img, iframe")).toBeNull();
    expect(container.textContent).toContain(source);
  }
);

it("replays a literal BOM-prefixed option without changing its selection identity", () => {
  const source = "?[\ufeff%{{ x]y }} A | B]";
  const value = "\ufeff%{{ x]y }} A";
  const { container, rerender } = render(
    <ContentRender content={source} userInput={value} />
  );
  expect(
    container.querySelectorAll("button")[0].classList.contains("select")
  ).toBe(true);
  rerender(<ContentRender content={source} defaultButtonText={value} />);
  expect(
    container.querySelectorAll("button")[0].classList.contains("select")
  ).toBe(true);
});

it.each([
  ["paragraph", (source: string) => source],
  [
    "blockquote",
    (source: string) =>
      source
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n"),
  ],
  [
    "list",
    (source: string) =>
      source
        .split("\n")
        .map((line, index) => `${index ? "  " : "- "}${line}`)
        .join("\n"),
  ],
  [
    "quoted list",
    (source: string) =>
      source
        .split("\n")
        .map((line, index) => `${index ? ">    " : "> 1. "}${line}`)
        .join("\n"),
  ],
] as const)("preserves multiline marker boundaries in a %s", (_name, wrap) => {
  const onSend = vi.fn();
  const { container, rerender } = render(
    <ContentRender
      content={wrap("?[%{{\t\n good\ufffd题\t\r\n}} A//a | B//b]")}
      onSend={onSend}
    />
  );
  const buttons = [...container.querySelectorAll("button")];
  expect(buttons.map((button) => button.textContent)).toEqual(["A", "B"]);
  fireEvent.click(buttons[1]);
  expect(onSend).toHaveBeenCalledWith({
    variableName: "good\ufffd题",
    buttonText: "b",
  });
  onSend.mockClear();
  rerender(
    <ContentRender
      content={wrap("?[%{{\t\n bad🙂\ufffd\u0000\ufffdkey\t\r\n}} A | B]")}
      onSend={onSend}
    />
  );
  expect(container.querySelectorAll("button")).toHaveLength(0);
  expect(onSend).not.toHaveBeenCalled();
  rerender(
    <ContentRender
      content={wrap("{{\n question ?[INNER | NEXT] \n}}\n\n?[Continue]")}
      onSend={onSend}
    />
  );
  expect(
    [...container.querySelectorAll("button")].map(
      (button) => button.textContent
    )
  ).toEqual(["Continue"]);
  expect(container.textContent).toContain("?[INNER | NEXT]");
});

it("preserves later Markdown when an interaction closes its key but not its bracket", () => {
  const { container } = render(
    <ContentRender
      content={"?[%{{ name }} **strong**\n\n# Heading\n\n- Item"}
    />
  );
  expect(container.querySelectorAll("button")).toHaveLength(0);
  expect(container.querySelector("strong")?.textContent).toBe("strong");
  expect(container.querySelector("h1")?.textContent).toBe("Heading");
  expect(container.querySelector("li")?.textContent).toBe("Item");
});

it.each([
  ["{{\n```key\n}} ?[A|B]", ""],
  ["?[%{{\n```key\n}} A|B]", "```key"],
  ["{{\n~~~key\n}} ?[A|B]", ""],
  ["?[%{{\n~~~key\n}} A|B]", "~~~key"],
])(
  "keeps a fence inside multiline marker padding opaque: %s",
  (source, name) => {
    const onSend = vi.fn();
    const { container } = render(
      <ContentRender content={source} onSend={onSend} />
    );
    const buttons = [...container.querySelectorAll("button")];
    expect(buttons.map((button) => button.textContent)).toEqual(["A", "B"]);
    expect(container.querySelector("pre, code, blockquote")).toBeNull();
    fireEvent.click(buttons[1]);
    expect(onSend).toHaveBeenCalledWith({
      variableName: name,
      buttonText: "B",
    });
  }
);

it.each(contract.document_context_cases)(
  "renders the real interaction after document context $id",
  ({ source, name, buttons, values }) => {
    const onSend = vi.fn();
    const { container, rerender } = render(
      <ContentRender content={source} onSend={onSend} />
    );
    const rendered = [...container.querySelectorAll("button")];
    expect(rendered.map((button) => button.textContent)).toEqual(buttons);
    fireEvent.click(rendered[rendered.length - 1]);
    expect(onSend).toHaveBeenCalledWith({
      variableName: name ?? "",
      buttonText: values[values.length - 1],
    });
    rerender(
      <ContentRender content={source} userInput={values[values.length - 1]} />
    );
    expect(
      container
        .querySelectorAll("button")
        [buttons.length - 1].classList.contains("select")
    ).toBe(true);
  }
);

it.each([
  "Show `{{` then ",
  "Show `{{`\n",
  "\\{{\n",
  'Text <span title="{{">\n',
  'Text <span title="before\n{{">\n',
  "Show \\{{ not a variable }} then ",
  "\\{{ example ",
  '[`code`](url "<!-- <figure></figure>")\n\n<!-- actual -->\n\n',
])("keeps a real markup-looking key opaque after %j", (prefix) => {
  const name = '<svg><path data-name="`"></path></svg>';
  const onSend = vi.fn();
  const { container } = render(
    <ContentRender
      content={`${prefix}?[${formatVariableAssignment(name)} A//a|B//b]`}
      onSend={onSend}
    />
  );
  const buttons = [...container.querySelectorAll("button")];
  expect(buttons.map((button) => button.textContent)).toEqual(["A", "B"]);
  expect(container.querySelector("svg, iframe")).toBeNull();
  fireEvent.click(buttons[1]);
  expect(onSend).toHaveBeenCalledWith({ variableName: name, buttonText: "b" });
});

import documentBoundaries from "../../../tests/fixtures/document-boundary-cases.json";

it.each(documentBoundaries)(
  "does not render a false interaction across $id",
  (example) => {
    const onSend = vi.fn();
    const { container } = render(
      <ContentRender content={example.source} onSend={onSend} />
    );
    const buttons = [
      ...container.querySelectorAll(".custom-variable-container button"),
    ];
    if (!example.interaction_count) {
      expect(buttons).toHaveLength(0);
      expect(onSend).not.toHaveBeenCalled();
      return;
    }
    expect(buttons.map((button) => button.textContent)).toEqual(
      example.buttons
    );
    fireEvent.click(buttons[1]);
    expect(onSend).toHaveBeenCalledWith({
      variableName: example.name,
      buttonText: "B",
    });
  }
);

it.each(["$", "`", "resource"])(
  "keeps %s syntax inside an interaction marker body literal",
  (literal) => {
    const body =
      literal === "resource" ? '{{ [label](u "' : `${literal}{{ y${literal}`;
    const source = `?[%{{ q }} A ${body} | B]\n\n?[%{{ real }} C|D]`;
    const onSend = vi.fn();
    const { container } = render(
      <ContentRender content={source} onSend={onSend} />
    );
    const buttons = [
      ...container.querySelectorAll(".custom-variable-container button"),
    ];
    expect(buttons).toHaveLength(2);
    expect(buttons[1].textContent).toBe("D");
    fireEvent.click(buttons[1]);
    expect(onSend).toHaveBeenCalledWith({ variableName: "q", buttonText: "D" });
  }
);
