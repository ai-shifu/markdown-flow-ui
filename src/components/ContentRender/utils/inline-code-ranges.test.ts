import { describe, expect, it } from "vitest";
import {
  getInlineCodeRanges,
  getMarkdownCodeRanges,
  getMarkdownLiteralRanges,
  getMarkdownSourceAnalysis,
} from "./inline-code-ranges";

describe("inline code paragraph boundaries", () => {
  it.each(["style", "div"])(
    "does not hide a line-start %s block inside a preceding code marker",
    (tag) => {
      const raw = `Use \`value\n<${tag}>Card</${tag}>\n\``;
      expect(getInlineCodeRanges(raw)).toEqual([]);
    }
  );

  it.each([
    "Use `<div>\nLiteral</div>` after.",
    "Use `value\n<meta>\n` after.",
    "Use `value\n<template>\n` after.",
    "```x`<style>Code</style>```",
  ])("preserves a valid code span in %s", (raw) => {
    const ranges = getInlineCodeRanges(raw);
    expect(ranges).toHaveLength(1);
    const code = raw.slice(ranges[0].start, ranges[0].end);
    expect(code.startsWith("`")).toBe(true);
    expect(code.endsWith("`")).toBe(true);
    expect(code).toContain("<");
  });
});

describe("Markdown source comment ranges", () => {
  it.each(["<!-- <figure>example</figure> -->", "<!-- unfinished <figure>"])(
    "protects received comments with absolute source offsets: %s",
    (comment) => {
      const prefix = "Intro\n\n";
      const source = `${prefix}${comment}`;
      const analysis = getMarkdownSourceAnalysis(source);
      expect(analysis.comments).toEqual([
        { start: prefix.length, end: source.length },
      ]);
      expect(analysis.literal).toEqual(analysis.comments);
      expect(analysis.markdown).toEqual([]);
    }
  );

  it.each([
    "`<!-- code comment -->`",
    '<span title="<!-- quoted comment -->">Text</span>',
    '<script>const text = "<!-- raw comment -->";</script>',
    "<textarea><!-- raw comment --></textarea>",
  ])(
    "excludes comment-like text inside literals and HTML tokens: %s",
    (source) => {
      expect(getMarkdownSourceAnalysis(source).comments).toEqual([]);
    }
  );
});

describe("Markdown destination and title ranges", () => {
  it("protects the tail after a visible link label", () => {
    const raw = '[label](https://example.com "<figure></figure>")';
    const start = raw.indexOf("](") + 1;
    const analysis = getMarkdownSourceAnalysis(raw);
    expect(analysis.metadata).toEqual([{ start, end: raw.length }]);
    expect(analysis.literal).toEqual(analysis.metadata);
    expect(Reflect.set(analysis.metadata[0], "end", 0)).toBe(false);
    expect(Reflect.set(analysis.metadata, "0", {})).toBe(false);
  });

  it.each([
    '![a [nested] label](https://example.com "<figure></figure>")',
    '![escaped \\] label](https://example.com "<figure></figure>")',
  ])(
    "protects image alt and metadata without changing their offsets: %s",
    (raw) => {
      const analysis = getMarkdownSourceAnalysis(raw);
      expect(analysis.metadata).toEqual([
        { start: 2, end: raw.length, imageAltEnd: raw.indexOf("](") },
      ]);
      expect(analysis.literal).toEqual(analysis.metadata);
      expect(Reflect.set(analysis.metadata[0], "end", 0)).toBe(false);
      expect(Reflect.set(analysis.metadata, "0", {})).toBe(false);
    }
  );

  it.each([
    "<https://example.com/figure>",
    "https://example.com/figure",
    '[ref]: https://example.com "<figure></figure>"',
  ])("protects complete destinations or definitions: %s", (raw) => {
    expect(getMarkdownSourceAnalysis(raw).metadata).toEqual([
      { start: 0, end: raw.length },
    ]);
  });

  it("preserves child code offsets and real label HTML", () => {
    const raw = '[`code` <iframe data-tag="video"></iframe>](url "<figure>")';
    const analysis = getMarkdownSourceAnalysis(raw);
    expect(analysis.inline).toEqual([{ start: 1, end: 7 }]);
    expect(analysis.literal).toEqual([
      { start: 1, end: 7 },
      { start: raw.indexOf("](") + 1, end: raw.length },
    ]);
    expect(
      analysis.html.map((range) => raw.slice(range.start, range.end))
    ).toEqual(['<iframe data-tag="video">', "</iframe>"]);
  });

  it("does not treat title comment examples as source comments", () => {
    const link = '[`code`](url "<!-- <figure></figure>")';
    const comment = "<!-- actual -->";
    const raw = `${link}\n\n${comment}`;
    expect(getMarkdownSourceAnalysis(raw).comments).toEqual([
      { start: link.length + 2, end: raw.length },
    ]);
  });

  it("sorts image-in-link metadata before the parent link tail", () => {
    const raw = '[![alt](image "<figure>")](lesson "<canvas>")';
    const metadata = getMarkdownSourceAnalysis(raw).metadata;
    expect(metadata.map((range) => raw.slice(range.start, range.end))).toEqual([
      'alt](image "<figure>")',
      '(lesson "<canvas>")',
    ]);
    expect(metadata[0].end).toBeLessThan(metadata[1].start);
    expect(metadata.some((range) => range.pending)).toBe(false);
  });

  it.each([false, true])(
    "tracks reference resolution without extending the image literal when definition comes first: %s",
    (definitionFirst) => {
      const image = "![<figure>Example</figure>][image]";
      const definition = "[image]: /image";
      const raw = definitionFirst
        ? `${definition}\n\n${image}`
        : `${image}\n\n${definition}`;
      const start = raw.indexOf(image);
      const analysis = getMarkdownSourceAnalysis(raw);
      expect(raw).toContain("\n\n");
      const paragraph = analysis.tree.children.find(
        (node) => node.type === "paragraph"
      );
      expect(
        paragraph?.type === "paragraph" && paragraph.children[0].type
      ).toBe("imageReference");
      const range = analysis.metadata.find((entry) => entry.imageAltEnd);
      expect(range).toEqual({
        start: start + 2,
        end: start + image.length,
        imageAltEnd: start + image.indexOf("][image]"),
        imageResolveEnd: raw.length,
      });
      expect(raw.slice(range!.start, range!.end)).toBe(image.slice(2));
    }
  );

  it.each([
    '[docs](url "<figure></figure>',
    '[ref]: https://example.com "<figure></figure>',
    '[ref]: https://example.com\n  "<figure></figure>',
  ])("marks received, unresolved metadata as pending: %s", (raw) => {
    const metadata = getMarkdownSourceAnalysis(raw).metadata;
    expect(metadata).toHaveLength(1);
    expect(metadata[0].pending).toBe(true);
    expect(metadata[0].end).toBe(raw.length);
    expect(metadata[0].start).toBeLessThan(raw.indexOf("<figure>"));
    expect(Reflect.set(metadata[0], "pending", false)).toBe(false);
  });

  it("resumes metadata protection only after the actual HTML root closes", () => {
    const raw =
      '<aside>[docs](url "<figure>Actual</figure><!-- actual --></aside>';
    const analysis = getMarkdownSourceAnalysis(raw);
    expect(analysis.metadata).toEqual([]);
    expect(analysis.comments).toEqual([
      { start: raw.indexOf("<!--"), end: raw.indexOf("-->") + 3 },
    ]);
    const prose = ' [docs](url "<figure>Example</figure>")';
    const resumed = `${raw}${prose}`;
    const metadata = getMarkdownSourceAnalysis(resumed).metadata;
    expect(metadata).toEqual([
      { start: resumed.indexOf("](", raw.length) + 1, end: resumed.length },
    ]);
  });

  it.each(["", "\n\n"])(
    "preserves real HTML bodies across adjacent roots separated by %j",
    (separator) => {
      const first = "<aside>First</aside>";
      const second =
        '<aside>[Read](/lesson "<iframe data-tag="video"></iframe>';
      for (const ending of ["", "</aside>"]) {
        const raw = `${first}${separator}${second}${ending}`;
        expect(getMarkdownSourceAnalysis(raw).metadata).toEqual([]);
      }
    }
  );

  it.each([
    '[Read](/lesson broken <iframe data-tag="video"></iframe>',
    "[Read](/lesson broken <figure>Actual</figure>",
    '[Read](/lesson "complete title" broken <figure>Actual</figure>',
  ])(
    "does not guess metadata after an invalid link destination tail: %s",
    (raw) => {
      expect(getMarkdownSourceAnalysis(raw).metadata).toEqual([]);
    }
  );
});

describe("Markdown code source ranges", () => {
  it.each([
    '$<iframe data-tag="video"></iframe>$',
    '$$\n<iframe data-tag="video"></iframe>\n$$',
  ])(
    "protects math literal offsets without classifying math as code: %s",
    (math) => {
      const prefix = "Intro\n\n";
      const source = `${prefix}${math}`;
      expect(getMarkdownLiteralRanges(source)).toEqual([
        { start: prefix.length, end: source.length },
      ]);
      expect(getMarkdownCodeRanges(source)).toEqual([]);
      expect(getInlineCodeRanges(source)).toEqual([]);
    }
  );

  it.each(["```", "~~~"])(
    "uses raw offsets for complete and unfinished quoted %s fences",
    (marker) => {
      const prefix = "Intro\r\n\r\n> ";
      const code = `${marker}html\r\n> <div>example</div>`;
      for (const ending of ["", `\r\n> ${marker}`]) {
        const raw = `${prefix}${code}${ending}`;
        expect(getMarkdownCodeRanges(raw)).toEqual([
          { start: prefix.length, end: raw.length },
        ]);
        expect(getInlineCodeRanges(raw)).toEqual([]);
      }
    }
  );

  it("returns code blocks and inline spans without changing their source positions", () => {
    const inline = "`<div>inline</div>`";
    const prefix = `Use ${inline}.\n\n`;
    const code = "    <style>code</style>";
    const raw = `${prefix}${code}\n\n<style>real</style>`;

    expect(getMarkdownCodeRanges(raw)).toEqual([
      { start: "Use ".length, end: "Use ".length + inline.length },
      { start: prefix.length, end: prefix.length + code.length },
    ]);
    expect(getInlineCodeRanges(raw)).toEqual([
      { start: "Use ".length, end: "Use ".length + inline.length },
    ]);
  });
});
