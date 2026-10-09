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
