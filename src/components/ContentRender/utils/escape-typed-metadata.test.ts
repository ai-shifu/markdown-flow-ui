import { describe, expect, it } from "vitest";
import { escapeTypedMarkdownMetadata } from "./escape-typed-metadata";

const source = '[Read](/lesson "<figure>Title</figure>")';
const range = { start: source.indexOf("("), end: source.length };

describe("typed Markdown metadata render protection", () => {
  it("escapes only an unfinished metadata tail", () => {
    for (let length = 0; length <= source.length; length += 1) {
      const visible = source.slice(0, length);
      const expected =
        length === source.length
          ? visible
          : visible.slice(0, range.start) +
            visible.slice(range.start).replace(/</g, "&lt;");
      expect(escapeTypedMarkdownMetadata(visible, [range])).toBe(expected);
    }
  });

  it("preserves received HTML in the link label", () => {
    const video = '<iframe data-tag="video"></iframe>';
    const raw = `[Watch ${video}](/lesson "<svg>Title</svg>")`;
    const visible = raw.slice(0, -1);
    expect(
      escapeTypedMarkdownMetadata(visible, [
        { start: raw.indexOf("](") + 1, end: raw.length },
      ])
    ).toBe(visible.replace("<svg>", "&lt;svg>").replace("</svg>", "&lt;/svg>"));
  });

  it("uses absolute metadata coordinates for a later rich segment", () => {
    const offset = "<div>Card</div>\r\n\r\n".length;
    expect(
      escapeTypedMarkdownMetadata(
        source.slice(0, -1),
        [{ start: offset + range.start, end: offset + range.end }],
        offset
      )
    ).toBe(source.slice(0, -1).replace(/</g, "&lt;"));
  });

  it("keeps earlier completed titles and already escaped text unchanged", () => {
    const earlier = '[One](/one "<span>One</span>") ';
    const later = '[Two](/two "&lt;literal> <details>Two</details>")';
    const visible = earlier + later.slice(0, -1);
    const ranges = Object.freeze([
      Object.freeze({ start: earlier.indexOf("("), end: earlier.length - 1 }),
      Object.freeze({
        start: earlier.length + later.indexOf("("),
        end: earlier.length + later.length,
      }),
    ]);
    expect(escapeTypedMarkdownMetadata(visible, ranges)).toBe(
      earlier + later.slice(0, -1).replace(/</g, "&lt;")
    );
  });

  it("protects a pending snapshot at its fully typed EOF", () => {
    const pending = '[reference]: /lesson "<figure>Title</figure>';
    expect(
      escapeTypedMarkdownMetadata(pending, [
        { start: 0, end: pending.length, pending: true },
      ])
    ).toBe(pending.replace(/</g, "&lt;"));
  });

  it("returns prefixes outside metadata unchanged", () => {
    expect(escapeTypedMarkdownMetadata("<em>Label</em>", [])).toBe(
      "<em>Label</em>"
    );
    expect(escapeTypedMarkdownMetadata(`${source} Later`, [range])).toBe(
      `${source} Later`
    );
  });

  it("protects reference alt until its definition is visible", () => {
    const image = "![<figure>Example</figure>][image]";
    const raw = `${image}\n\n[image]: /image`;
    const metadata = {
      start: 2,
      end: image.length,
      imageAltEnd: image.indexOf("][image]"),
      imageResolveEnd: raw.length,
    };
    for (let length = image.length; length < raw.length; length += 1) {
      const visible = raw.slice(0, length);
      expect(escapeTypedMarkdownMetadata(visible, [metadata])).toBe(
        visible.replace(/</g, "&lt;")
      );
    }
    expect(escapeTypedMarkdownMetadata(raw, [metadata])).toBe(raw);
  });

  it("preserves escaped less-than signs and entities in protected alt text", () => {
    const raw = "![\\<figure> &lt;svg> <iframe>";
    expect(
      escapeTypedMarkdownMetadata(raw, [
        { start: 2, end: raw.length, imageAltEnd: raw.length, pending: true },
      ])
    ).toBe("![\\<figure> &lt;svg> &lt;iframe>");
  });

  it("protects image alt and an unfinished title separately", () => {
    const raw = '![<figure>Alt</figure>](/image "<svg>Title</svg>")';
    const metadata = {
      start: 2,
      end: raw.length,
      imageAltEnd: raw.indexOf("]("),
    };
    const visible = raw.slice(0, -1);
    expect(escapeTypedMarkdownMetadata(visible, [metadata])).toBe(
      visible.replace(/</g, "&lt;")
    );
    expect(escapeTypedMarkdownMetadata(raw, [metadata])).toBe(raw);
  });
});
