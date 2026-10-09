import { describe, expect, it, vi } from "vitest";
import * as markdownSource from "./inline-code-ranges";
import { splitContentSegments } from "./split-content";

const first = "<div>Card</div>";
const actual = "<figure>Actual</figure>";
const containers = [
  { name: "blockquote", opening: "> ", continuation: "> " },
  { name: "nested quotes", opening: ">> ", continuation: "> > " },
  { name: "bullet list", opening: "- ", continuation: "  " },
  { name: "ordered list", opening: "12. ", continuation: "    " },
  { name: "quoted list", opening: "> - ", continuation: ">   " },
  { name: "listed quote", opening: "- > ", continuation: "  > " },
  {
    name: "mixed nested containers",
    opening: "> 1. > - ",
    continuation: ">    >   ",
  },
  { name: "nested lists", opening: "- - ", continuation: "    " },
];

describe("fenced code in resumed Markdown containers", () => {
  it.each(containers)(
    "protects $name after a closed HTML root",
    (container) => {
      for (const marker of ["```", "~~~"]) {
        const opening = `${container.opening}${marker}html\n${container.continuation}<figure>example</figure>`;
        for (const complete of [false, true]) {
          const code = complete
            ? `${opening}\n${container.continuation}${marker}`
            : opening;
          const raw = `${first}\n${code}${complete ? `\n${actual}` : ""}`;
          const segments = splitContentSegments(raw, true, true);
          expect(segments.filter(({ type }) => type === "sandbox")).toEqual([
            { type: "sandbox", value: first },
            ...(complete ? [{ type: "sandbox", value: actual }] : []),
          ]);
          expect(segments).toContainEqual({ type: "markdown", value: code });
          expect(segments.map(({ value }) => value).join("")).toBe(raw);
        }
      }
    }
  );

  it.each(containers)(
    "ends an unfinished $name fence on container exit",
    (container) => {
      const code = `${container.opening}\`\`\`html\n${container.continuation}<figure>example</figure>\n`;
      const raw = `${first}\n${code}${actual}`;
      const segments = splitContentSegments(raw, true, true);
      expect(segments.filter(({ type }) => type === "sandbox")).toEqual([
        { type: "sandbox", value: first },
        { type: "sandbox", value: actual },
      ]);
      expect(segments.map(({ value }) => value).join("")).toBe(raw);
    }
  );

  it.each(["`", "~"])(
    "requires the full %s fence width after container prefixes",
    (marker) => {
      const code = `> - ${marker.repeat(4)}html\n>   ${marker.repeat(3)}\n>   <figure>example</figure>\n>   ${marker.repeat(5)}`;
      const raw = `${first}\n${code}\n${actual}`;
      expect(
        splitContentSegments(raw, true, true).filter(
          ({ type }) => type === "sandbox"
        )
      ).toEqual([
        { type: "sandbox", value: first },
        { type: "sandbox", value: actual },
      ]);
    }
  );

  it.each(["```", "~~~"])(
    "protects every received prefix inside a nested %s fence",
    (marker) => {
      const code = `> 1. > - ${marker}html\n>    >   <figure>example</figure>\n>    >   <iframe data-tag="video"></iframe>\n>    >   <!-- <div>example</div> -->\n>    >   ${marker}`;
      const raw = `${first}\n${code}`;
      for (let length = first.length; length <= raw.length; length += 1) {
        const received = raw.slice(0, length);
        const segments = splitContentSegments(received, true, true);
        expect(
          segments
            .filter(({ type }) => type === "sandbox")
            .map(({ value }) => value.trimEnd())
        ).toEqual([first]);
        expect(segments.some((segment) => "immediate" in segment)).toBe(false);
        expect(segments.map(({ value }) => value).join("")).toBe(received);
      }
    }
  );

  it.each([
    "<!-- example",
    '[Read](/lesson "<figure>example',
    "![<figure>example",
  ])("ends code-internal lexical state at its closing fence: %s", (literal) => {
    for (const marker of ["```", "~~~"]) {
      const code = `> ${marker}html\n> ${literal}\n> ${marker}`;
      const raw = `${first}\n${code}\n${actual}`;
      const segments = splitContentSegments(raw, true, true);
      expect(segments.filter(({ type }) => type === "sandbox")).toEqual([
        { type: "sandbox", value: first },
        { type: "sandbox", value: actual },
      ]);
      expect(segments).toContainEqual({ type: "markdown", value: code });
      expect(segments.map(({ value }) => value).join("")).toBe(raw);
    }
  });

  it.each(['[Read](/lesson "Title', "![Example"])(
    "keeps a native video after code-internal pending metadata: %s",
    async (literal) => {
      const [
        { createElement },
        { renderToStaticMarkup },
        { default: ContentRender },
      ] = await Promise.all([
        import("react"),
        import("react-dom/server"),
        import("../ContentRender"),
      ]);
      const raw = [
        "<aside>Card</aside>",
        "> ```html",
        `> ${literal}`,
        "> ```",
        '<iframe data-tag="video"></iframe>',
      ].join("\n");
      const html = renderToStaticMarkup(
        createElement(ContentRender, { content: raw, enableTypewriter: false })
      );
      expect(html.match(/<iframe\b/g) ?? []).toHaveLength(1);
    }
  );

  it("keeps a real comment after the resumed fence protected", () => {
    const code = "> ```html\n> <!-- example\n> ```";
    const comment = "<!-- Real <figure>comment</figure> -->";
    const raw = `${first}\n${code}\n${comment}\n${actual}`;
    const segments = splitContentSegments(raw, true, true);
    expect(segments.filter(({ type }) => type === "sandbox")).toEqual([
      { type: "sandbox", value: first },
      { type: "sandbox", value: actual },
    ]);
    expect(segments.map(({ value }) => value).join("")).toBe(raw);
  });

  it("requests one full-source analysis for repeated resumed container fences", () => {
    const raw = Array.from(
      { length: 100 },
      (_value, index) =>
        `<div>Card ${index}</div>\n> - ~~~html\n>   <figure>example</figure>\n>   ~~~`
    ).join("\n");
    const analyze = vi.spyOn(markdownSource, "getMarkdownSourceAnalysis");
    try {
      const segments = splitContentSegments(raw, true, true);
      expect(segments.filter(({ type }) => type === "sandbox")).toHaveLength(
        100
      );
      expect(segments.map(({ value }) => value).join("")).toBe(raw);
      expect(analyze).toHaveBeenCalledExactlyOnceWith(raw);
    } finally {
      analyze.mockRestore();
    }
  });

  it("preserves CRLF and variable quote indentation around a closing fence", () => {
    const code = " >  ```html\r\n> <figure>example</figure>\r\n  >   ````\t";
    const raw = `${first}\r\n${code}\r\n${actual}`;
    const segments = splitContentSegments(raw, true, true);
    expect(segments).toContainEqual({ type: "markdown", value: `${code}\r` });
    expect(segments.filter(({ type }) => type === "sandbox")).toEqual([
      { type: "sandbox", value: first },
      { type: "sandbox", value: actual },
    ]);
    expect(segments.map(({ value }) => value).join("")).toBe(raw);
  });
});
