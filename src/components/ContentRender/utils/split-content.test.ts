import { describe, expect, it } from "vitest";

import { splitContentSegments } from "./split-content";

describe("splitContentSegments", () => {
  it("keeps inline svg and fenced code as markdown segments", () => {
    const raw =
      "```mermaid\ngraph TD\n    subgraph 大语言模型的诞生\n        A[初始模型<br>空白的“大脑”] --> B[预训练<br>海量数据“上学”]\n        B --> C[后训练<br>对齐与微调]\n        C --> D[大语言模型<br>具备语言与知识]\n    end\n```\n\n你有没有想过，为什么一夜之间，好像全世界都在谈论“大模型”？\n\n伴随 ChatGPT 一起爆火的，AI 真的和人很像。";

    const segments = splitContentSegments(raw);

    expect(segments).toHaveLength(1);
    segments.forEach((segment) => expect(segment.type).toBe("markdown"));
    expect(segments[0].value).toContain("```mermaid");
  });

  it("splits true html blocks into sandbox", () => {
    const raw = ["Intro", "<div><p>real html</p></div>", "Outro"].join("\n");

    const segments = splitContentSegments(raw);

    expect(segments).toHaveLength(1);
    expect(segments[0].type).toBe("sandbox");
  });

  it("extracts custom button from sandbox blocks", () => {
    const raw =
      "<div><p>real html</p></div><custom-button-after-content>Ask</custom-button-after-content>";

    const segments = splitContentSegments(raw);
    const sandboxSegments = segments.filter(
      (segment) => segment.type === "sandbox"
    );
    const customSegments = segments.filter(
      (segment) =>
        segment.type !== "sandbox" &&
        segment.value.includes("custom-button-after-content")
    );

    expect(sandboxSegments).toHaveLength(1);
    expect(sandboxSegments[0].value).not.toContain(
      "custom-button-after-content"
    );
    expect(customSegments).toHaveLength(1);
  });

  it("keeps script blocks inside sandbox when custom button follows", () => {
    const raw = [
      "<div><p>real html</p></div>",
      "<style>.demo{color:red;}</style>",
      "<script>console.log('demo');</script><custom-button-after-content>Ask</custom-button-after-content>",
    ].join("\n");

    const segments = splitContentSegments(raw, true);
    const sandboxValue = segments
      .filter((segment) => segment.type === "sandbox")
      .map((segment) => segment.value)
      .join("");

    expect(sandboxValue).toContain("<script>");
    expect(sandboxValue).not.toContain("custom-button-after-content");
  });

  it("treats iframe video blocks as markdown segments", () => {
    const raw =
      "Intro\n\n<iframe data-tag='video' src=\"https://example.com/video\"></iframe>\n\nOutro";

    const segments = splitContentSegments(raw, true);

    expect(segments).toHaveLength(3);
    expect(segments[0].type).toBe("text");
    expect(segments[1].type).toBe("markdown");
    expect(segments[1].value).toContain("data-tag='video'");
    expect(segments[2].type).toBe("text");
  });

  it.each([
    '<iframe title="a > b" data-tag="video" allowfullscreen="">',
    "<iframe title='a > b' allow='autoplay' data-tag='video'>",
  ])(
    "keeps an unfinished video header pending until its quoted attributes finish: %s",
    (opening) => {
      for (
        let length = "<iframe ".length;
        length < opening.length;
        length += 1
      ) {
        const received = opening.slice(0, length);
        expect(splitContentSegments(received, true, true)).toEqual([
          { type: "markdown", value: received, immediate: true, pending: true },
        ]);
      }
      expect(splitContentSegments(opening, true, true)).toEqual([
        { type: "markdown", value: opening, immediate: true },
      ]);
    }
  );

  it("keeps streamed video separate from following HTML and prose", () => {
    const video = '<iframe data-tag="video" allowfullscreen=""></iframe>';
    const raw = `Intro\n${video}<div>Card</div>\nOutro`;
    const segments = splitContentSegments(raw, true, true);

    expect(segments).toEqual([
      { type: "text", value: "Intro\n" },
      { type: "markdown", value: video, immediate: true },
      { type: "sandbox", value: "<div>Card</div>" },
      { type: "text", value: "\nOutro" },
    ]);
    expect(segments.map((segment) => segment.value).join("")).toBe(raw);
  });

  it.each([
    "Lesson",
    '`<iframe data-tag="video"></iframe>`',
    '<iframe data-tag="audio"></iframe>',
  ])("keeps an actual table video immediate after the cell %s", (firstCell) => {
    const video = '<iframe data-tag="video" src="/lesson"></iframe>';
    const raw = `Intro\n\n| Lesson | Media |\n| --- | --- |\n| ${firstCell} | ${video} |\n\nOutro`;
    const segments = splitContentSegments(raw, true, true);

    expect(segments).toContainEqual({
      type: "markdown",
      value: video,
      immediate: true,
    });
    expect(segments.map((segment) => segment.value).join("")).toBe(raw);
  });

  it("keeps incomplete table video headers pending without losing the table source", () => {
    const prefix = "| Lesson | Media |\n| --- | --- |\n| Lesson | ";
    const opening = '<iframe title="a > b" data-tag="video" src="/lesson">';
    for (let length = "<iframe ".length; length < opening.length; length += 1) {
      const received = opening.slice(0, length);
      const raw = `${prefix}${received}`;
      const segments = splitContentSegments(raw, true, true);
      expect(segments).toContainEqual({
        type: "markdown",
        value: received,
        immediate: true,
        pending: true,
      });
      expect(segments.map((segment) => segment.value).join("")).toBe(raw);
    }

    const raw = `${prefix}${opening}</iframe> |`;
    expect(splitContentSegments(raw, true, true)).toContainEqual({
      type: "markdown",
      value: `${opening}</iframe>`,
      immediate: true,
    });
    expect(
      splitContentSegments(raw, true, true)
        .map((segment) => segment.value)
        .join("")
    ).toBe(raw);
  });

  it.each([
    '`<iframe data-tag="video"></iframe>`',
    '``<iframe data-tag="video"></iframe>``',
    '\\<iframe data-tag="video"></iframe>',
  ])("keeps a table video example inert: %s", (example) => {
    const raw = `| Example |\n| --- |\n| ${example} |`;
    expect(splitContentSegments(raw, true, true)).toEqual([
      { type: "markdown", value: raw },
    ]);
  });

  it("preserves the legacy non-streaming table containing a native video", () => {
    const raw =
      '| Lesson | Media |\n| --- | --- |\n| Lesson | <iframe data-tag="video"></iframe> |';
    expect(splitContentSegments(raw, true)).toEqual([
      { type: "markdown", value: raw },
    ]);
  });

  it.each(["<div>Card</div>", '<iframe src="/generic"></iframe>'])(
    "keeps a video after %s on its native media path",
    (before) => {
      const video = '<iframe data-tag="video"></iframe>';
      const raw = `${before}\n${video}<style>.card { color: red; }</style>`;
      const segments = splitContentSegments(raw, true, true);
      expect(segments).toContainEqual({
        type: "markdown",
        value: video,
        immediate: true,
      });
      expect(segments.filter((segment) => segment.type === "sandbox")).toEqual([
        { type: "sandbox", value: before },
        { type: "sandbox", value: "<style>.card { color: red; }</style>" },
      ]);
      expect(segments.map((segment) => segment.value).join("")).toBe(raw);
    }
  );

  it.each([
    '<iframe title="data-tag=\'video\'" src="/generic">',
    '<iframe data-tag="audio" src="/generic">',
  ])("keeps generic iframe headers on the sandbox path: %s", (opening) => {
    expect(splitContentSegments(opening, true, true)).toEqual([
      { type: "sandbox", value: opening },
    ]);
  });

  it.each(["div", "script", "style"])(
    "keeps self-closing %s roots on the sandbox path as they arrive",
    (tag) => {
      for (const html of [`<${tag} `, `<${tag}/`, `<${tag}/>`]) {
        expect(splitContentSegments(`Intro\n${html}`, true, true)).toEqual([
          { type: "text", value: "Intro\n" },
          { type: "sandbox", value: html },
        ]);
      }
    }
  );

  it.each(["<", "The value is <", "Compare 1 < 2", "<!"])(
    "keeps an ordinary less-than sign in prose: %s",
    (raw) => {
      expect(splitContentSegments(raw, true, true)).toEqual([
        { type: "text", value: raw },
      ]);
    }
  );

  it.each([false, true])(
    "keeps tag names without a received boundary as literal prose (streaming=%s)",
    (streaming) => {
      for (const raw of [
        "The token is <div",
        "Compare <d",
        "Intro <di",
        "<!DOC",
        "<!DOCTYPE",
        "<i",
        "<iframe",
        "<script",
        "<style",
        "<dividend",
      ]) {
        expect(splitContentSegments(raw, true, streaming)).toEqual([
          { type: "text", value: raw },
        ]);
      }
    }
  );

  it.each([false, true])(
    "recognizes received HTML headers before their content is complete (streaming=%s)",
    (streaming) => {
      for (const html of [
        "<div ",
        "<div/",
        "<div>",
        '<div title="received',
        "<DIV>One",
        "<div>One and Two",
        "<script ",
        "<style>",
        "<!DOCTYPE>",
        "<!DOCTYPE html",
      ]) {
        expect(splitContentSegments(`Intro\n${html}`, true, streaming)).toEqual(
          [
            { type: "text", value: "Intro\n" },
            { type: "sandbox", value: html },
          ]
        );
      }
    }
  );

  it.each([
    "An unfinished `value.\n\n<div>Card</div>",
    "An unfinished `value.\n \t\n<div>Card</div>\n\nAnother ` paragraph.",
    "An unfinished `value.\r\n\r\n<div>Card</div>",
  ])("does not let inline code cross a blank paragraph: %s", (raw) => {
    const segments = splitContentSegments(raw, true, true);

    expect(segments.some((segment) => segment.type === "sandbox")).toBe(true);
    expect(
      segments
        .filter((segment) => segment.type === "sandbox")
        .map((segment) => segment.value)
        .join("")
    ).toContain("<div>Card</div>");
    expect(segments.map((segment) => segment.value).join("")).toBe(raw);
  });

  it("protects a multiline inline code span in its current paragraph", () => {
    const raw = "Use `<div>\nLiteral</div>` before continuing.";

    expect(splitContentSegments(raw, true, true)).toEqual([
      { type: "text", value: raw },
    ]);
  });

  it.each(["style", "div"])(
    "isolates a line-start %s block that interrupts a code paragraph",
    (tag) => {
      const html = `<${tag}>Card</${tag}>`;
      const raw = `Use \`value\n${html}\n\``;
      const segments = splitContentSegments(raw, true, true);
      expect(segments.filter((segment) => segment.type === "sandbox")).toEqual([
        { type: "sandbox", value: html },
      ]);
      expect(segments.map((segment) => segment.value).join("")).toBe(raw);
    }
  );

  it.each([
    ["HTML", "<div>Card</div>"],
    ["styles", "<style>body { color: red; }</style>"],
  ])("sandboxes %s after an unmatched inline backtick", (_name, html) => {
    const prose = "Use ` carefully ";

    expect(splitContentSegments(`${prose}${html}`, true, true)).toEqual([
      { type: "text", value: prose },
      { type: "sandbox", value: html },
    ]);
  });

  it.each([
    "Use ` carefully then ``<div>Code</div>`` and ",
    "Use \\` literally then ``<div>Code</div>`` and ",
    "Use `<div>Code</div>\\` and ",
    "Use \\\\`<div>Code</div>` and ",
  ])(
    "protects matched code after literal or escaped backticks: %s",
    (prose) => {
      const html = "<div>Card</div>";

      expect(splitContentSegments(`${prose}${html}`, true, true)).toEqual([
        { type: "text", value: prose },
        { type: "sandbox", value: html },
      ]);
    }
  );

  it("finds matched code after many unmatched delimiter lengths", () => {
    const unmatched = Array.from({ length: 128 }, (_value, index) =>
      "`".repeat(index + 3)
    ).join(" ");
    const prose = `Use ${unmatched} then \`\`<style>Code</style>\`\` and `;

    expect(splitContentSegments(`${prose}<div>Card</div>`, true, true)).toEqual(
      [
        { type: "text", value: prose },
        { type: "sandbox", value: "<div>Card</div>" },
      ]
    );
  });

  it("reclassifies HTML as inline code when its closing backtick arrives", () => {
    const initial = "Use `<div>Code</div>";
    expect(splitContentSegments(initial, true, true)).toEqual([
      { type: "text", value: "Use `" },
      { type: "sandbox", value: "<div>Code</div>" },
    ]);
    expect(splitContentSegments(`${initial}\``, true, true)).toEqual([
      { type: "text", value: `${initial}\`` },
    ]);
  });

  it.each(["~~~html\n<div>Source", "~~~html\n<div>Source</div>\n~~~"])(
    "keeps tilde-fenced HTML on the markdown path: %s",
    (raw) => {
      expect(splitContentSegments(raw, true, true)).toEqual([
        { type: "markdown", value: raw },
      ]);
    }
  );

  it.each([0, 1, 2, 3])(
    "preserves top-level fences with %s leading spaces",
    (spaces) => {
      const indent = " ".repeat(spaces);
      for (const marker of ["```", "~~~"]) {
        const opening = `${indent}${marker}html\n<div>example</div>`;
        for (const raw of [opening, `${opening}\n${indent}${marker}`]) {
          expect(splitContentSegments(raw, true, true)).toEqual([
            { type: "markdown", value: raw },
          ]);
        }
      }
    }
  );

  it.each(["```", "~~~"])(
    "protects complete and unfinished quoted %s fences using Markdown grammar",
    (marker) => {
      const opening = `Intro\n\n> ${marker}html\n> <div>example</div>`;
      for (const raw of [opening, `${opening}\n> ${marker}`]) {
        expect(splitContentSegments(raw, true, true)).toEqual([
          { type: "text", value: raw },
        ]);
      }
    }
  );

  it.each(["```", "~~~"])(
    "keeps a quoted %s code block intact before real HTML and video",
    (marker) => {
      const code = `> ${marker}html\n> <div>example</div>\n> ${marker}`;
      const html = "<style>.card { color: red; }</style>";
      const video = '<iframe data-tag="video"></iframe>';
      const raw = `${code}\n\n${html}\n${video}`;
      const segments = splitContentSegments(raw, true, true);

      expect(segments).toEqual([
        { type: "text", value: `${code}\n\n` },
        { type: "sandbox", value: html },
        { type: "text", value: "\n" },
        { type: "markdown", value: video, immediate: true },
      ]);
      expect(segments.map((segment) => segment.value).join("")).toBe(raw);
    }
  );

  it.each([
    "> ```html\n> <svg></svg><img src='/code'>\n> ```",
    "> ~~~html\n> ![Code](/code.png)\n> <iframe data-tag='video'></iframe>\n> ~~~",
    "- ```html\n  <div>example</div>\n  ```",
    "- ~~~html\n  <div>example</div>\n  ~~~",
    "    <div>example</div>",
    "\t<style>body { color: red; }</style>",
    "    | <div>example</div> |\n    | --- |",
  ])("keeps AST code blocks out of HTML and media segmentation: %s", (raw) => {
    expect(splitContentSegments(raw, true, true)).toEqual([
      { type: "text", value: raw },
    ]);
  });

  it("recognizes a longer closing tilde fence before a real HTML block", () => {
    const code = "  ~~~html\n<div>Source</div>\n  ~~~~";
    const raw = `${code}\n<div>Card</div>`;
    const segments = splitContentSegments(raw, true, true);

    expect(segments[0]).toEqual({ type: "markdown", value: code });
    expect(segments.filter((segment) => segment.type === "sandbox")).toEqual([
      { type: "sandbox", value: "<div>Card</div>" },
    ]);
    expect(segments.map((segment) => segment.value).join("")).toBe(raw);
  });

  it("does not close a four-backtick fence with a three-backtick line", () => {
    const raw = "````html\n```\n<div>Source</div>";

    expect(splitContentSegments(raw, true, true)).toEqual([
      { type: "markdown", value: raw },
    ]);
  });

  it.each([
    '<style>.card::before { content: "```html"; }</style>\n<div>Card</div>',
    '<script>const source = "```html\\n<div>Example</div>\\n```";</script>\n<div>Card</div>',
    "<script>const source = `\n```html\n<div>Example</div>\n```\n`;</script>\n<div>Card</div>",
  ])("keeps fence markers inside received HTML in its sandbox: %s", (raw) => {
    const segments = splitContentSegments(raw, true, true);

    expect(segments).toEqual([{ type: "sandbox", value: raw }]);
  });

  it("preserves an earlier HTML block before a later real code fence", () => {
    const raw =
      "Intro\n<div>Card</div>\nAfter\n~~~html\n<div>Source</div>\n~~~";
    const segments = splitContentSegments(raw, true, true);

    expect(segments.filter((segment) => segment.type === "sandbox")).toEqual([
      { type: "sandbox", value: "<div>Card</div>" },
    ]);
    expect(segments.map((segment) => segment.value).join("")).toBe(raw);
  });
});

describe("streaming source scanning", () => {
  it.each([
    "header",
    "footer",
    "nav",
    "aside",
    "figure",
    "details",
    "summary",
    "form",
    "table",
    "canvas",
    "video",
    "audio",
    "pre",
    "blockquote",
    "ul",
    "ol",
    "dl",
    "fieldset",
    "address",
    "hgroup",
    "center",
  ])("renders the backend's %s block root progressively", (tag) => {
    const opening = `<${tag} title="a > b">`;
    for (const html of [
      opening.slice(0, -1),
      opening,
      `${opening}Received`,
      `${opening}Received</${tag}>`,
    ]) {
      const prefix = "Intro\n";
      expect(splitContentSegments(`${prefix}${html}`, true, true)).toEqual([
        { type: "text", value: prefix },
        { type: "sandbox", value: html },
      ]);
    }
    const html = `${opening}Received</${tag}>`;
    expect(splitContentSegments(`${html} Following prose`, true, true)).toEqual(
      [
        { type: "sandbox", value: html },
        { type: "text", value: " Following prose" },
      ]
    );
    expect(splitContentSegments(`<${tag}>Received</${tag}>`, true)).toEqual([
      { type: "text", value: `<${tag}>Received</${tag}>` },
    ]);
  });

  it.each([
    '<!-- <div>Example</div><iframe data-tag="video"></iframe> -->',
    "<!-- <figure>Example</figure>",
    "<span title=\"<div>Example</div><iframe data-tag='video'></iframe>\">Text</span>",
    '<span title="<figure>Example</figure>',
    '<textarea><div>Example</div><iframe data-tag="video"></iframe></textarea>',
    "`<figure>Example</figure>`",
    "$<figure>Example</figure>$",
    "\\<figure>Example</figure>",
  ])("does not activate fake HTML roots in %s", (literal) => {
    expect(splitContentSegments(`Intro ${literal} After`, true, true)).toEqual([
      { type: "text", value: `Intro ${literal} After` },
    ]);
  });

  it("keeps comments and quoted attributes inert before later actual HTML", () => {
    const prefix =
      '<!-- <div>Comment</div> -->\n<span title="<!-- <figure>Attribute</figure>">Inline</span>\n';
    const html = '<figure title="a > b">Actual</figure>';
    const raw = `${prefix}${html} After`;
    expect(splitContentSegments(raw, true, true)).toEqual([
      { type: "text", value: prefix },
      { type: "sandbox", value: html },
      { type: "text", value: " After" },
    ]);
  });

  it.each([
    "`<figure>Example</figure>`",
    '``<iframe data-tag="video"></iframe>``',
    '$<iframe data-tag="video"></iframe>$',
    '$$\n<iframe data-tag="video"></iframe>\n$$',
  ])(
    "protects resumed Markdown prose without reparsing its suffix: %s",
    (literal) => {
      const first = "<div>First</div>";
      const last = "<figure>Last</figure>";
      const prose = ` Use ${literal} after. `;
      const raw = `${first}${prose}${last}`;
      expect(splitContentSegments(raw, true, true)).toEqual([
        { type: "sandbox", value: first },
        { type: "text", value: prose },
        { type: "sandbox", value: last },
      ]);
    }
  );

  it.each(["```", "~~~"])(
    "keeps a resumed %s fence and its comments literal",
    (marker) => {
      const first = "<div>First</div>";
      const code = `${marker}html\n<!-- <figure>Example</figure>\n${marker}`;
      const last = "<figure>Last</figure>";
      const raw = `${first}\nAfter\n${code}\n${last}`;
      expect(splitContentSegments(raw, true, true)).toEqual([
        { type: "sandbox", value: first },
        { type: "text", value: "\nAfter\n" },
        { type: "markdown", value: code },
        { type: "text", value: "\n" },
        { type: "sandbox", value: last },
      ]);
    }
  );

  it("does not extract custom buttons from comments, attributes, or raw script text", () => {
    const button =
      "<custom-button-after-content>Example</custom-button-after-content>";
    const raw = `<div title="${button}"><!-- ${button} --></div><script>const example = '${button}';</script>`;
    expect(splitContentSegments(raw, true, true)).toEqual([
      { type: "sandbox", value: raw },
    ]);
  });

  it("preserves source whitespace when extracting an actual custom button", () => {
    const before = "<div>Card</div>\n ";
    const button =
      "<custom-button-after-content>Ask</custom-button-after-content>";
    const raw = `${before}${button}\n\t`;
    const segments = splitContentSegments(raw, true, true);
    expect(segments).toContainEqual({ type: "markdown", value: button });
    expect(segments.map((segment) => segment.value).join("")).toBe(raw);
  });

  it("preserves all received snapshots across comments, roots, and native videos", () => {
    const raw =
      'Intro <!-- <div>Example</div> -->\n<figure title="a > b"><div>Card</div></figure> After\n<iframe title="a > b" data-tag="video"></iframe> End';
    for (let length = 0; length <= raw.length; length += 1) {
      const received = raw.slice(0, length);
      expect(
        splitContentSegments(received, true, true)
          .map((segment) => segment.value)
          .join("")
      ).toBe(received);
    }
  });
});
