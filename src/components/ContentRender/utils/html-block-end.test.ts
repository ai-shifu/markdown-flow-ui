import { describe, expect, it } from "vitest";
import { findStreamingHtmlBlockEnd } from "./html-block-end";

describe("findStreamingHtmlBlockEnd", () => {
  it("ends a closed root before prose on the same line", () => {
    const html = "<div>Card</div>";
    const source = `${html}Following prose`;
    expect(findStreamingHtmlBlockEnd(source, 0)).toBe(html.length);
  });

  it("returns an absolute boundary when HTML follows introductory text", () => {
    const intro = "Introduction\n";
    const html = "<section>Card</section>";
    const source = `${intro}${html}\nFollowing prose`;
    expect(findStreamingHtmlBlockEnd(source, intro.length)).toBe(
      intro.length + html.length
    );
  });

  it("does not split text after an inner closing tag from its enclosing root", () => {
    const html =
      "<div><section><p>Inner</p>\nStill inside section</section>\nStill inside div</div>";
    expect(findStreamingHtmlBlockEnd(`${html}\nOutside`, 0)).toBe(html.length);
  });

  it("tracks nested roots with the same tag name", () => {
    const html = "<div><div>Inner</div>\nInside outer</div>";
    expect(findStreamingHtmlBlockEnd(`${html}Outside`, 0)).toBe(html.length);
  });

  it.each([
    "<div>",
    "<div><p>Received text",
    "<div><p>Received</p>\nMore text",
    "<div><section>Received</section>",
    '<div title="Received > text',
  ])("returns the received end for an unfinished root: %s", (html) => {
    expect(findStreamingHtmlBlockEnd(html, 0)).toBe(html.length);
  });

  it.each(["<", "<di", "<div ", '<div title="', "</di", "</div"])(
    "keeps a partially received tail tag: %s",
    (tail) => {
      const source = `<div>Card</div>\n${tail}`;
      expect(findStreamingHtmlBlockEnd(source, 0)).toBe(source.length);
    }
  );

  it("keeps consecutive HTML siblings together across whitespace and comments", () => {
    const html = [
      "<div>Card</div>",
      "<!-- between HTML siblings -->",
      "<style>.card::after { content: '< >'; }</style>",
      '<script>if (1 < 2) { window.card = ">"; }</script>',
      "<section>Another card</section>",
    ].join("\n \t");
    expect(findStreamingHtmlBlockEnd(`${html}\nProse`, 0)).toBe(html.length);
  });

  it("keeps sibling HTML when no whitespace separates the roots", () => {
    const html = "<div>First</div><div>Second</div>";
    expect(findStreamingHtmlBlockEnd(`${html}Prose`, 0)).toBe(html.length);
  });

  it("keeps an incomplete sibling without waiting for its close", () => {
    const source = "<div>Card</div>\n<style>.card { color: red;";
    expect(findStreamingHtmlBlockEnd(source, 0)).toBe(source.length);
  });

  it("does not end a tag at a greater-than sign inside attribute quotes", () => {
    const html = "<div title=\"a > b\" data-other='c > d'>Card</div>";
    expect(findStreamingHtmlBlockEnd(`${html}Prose`, 0)).toBe(html.length);
  });

  it("ignores apparent HTML tags and comparison operators in script bodies", () => {
    const html =
      '<div>Card</div><script>if (a < b && b > c) { const text = "<div></div>"; }</script>';
    expect(findStreamingHtmlBlockEnd(`${html}Prose`, 0)).toBe(html.length);
  });

  it("ignores apparent HTML tags in style bodies", () => {
    const html = '<style>.card::after { content: "</div><section>"; }</style>';
    expect(findStreamingHtmlBlockEnd(`${html}Prose`, 0)).toBe(html.length);
  });

  it("keeps partially received script bodies through the received end", () => {
    const source = '<script>if (a < b) { const text = "<div>"; }';
    expect(findStreamingHtmlBlockEnd(source, 0)).toBe(source.length);
  });

  it("ignores fake closing roots inside comments", () => {
    const html = "<div><!-- </div> -->\nStill inside</div>";
    expect(findStreamingHtmlBlockEnd(`${html}Prose`, 0)).toBe(html.length);
  });

  it("retains a comment after the root and excludes subsequent prose", () => {
    const html = "<div>Card</div> <!-- comment containing <div> -->";
    expect(findStreamingHtmlBlockEnd(`${html}\nProse`, 0)).toBe(html.length);
  });

  it("keeps incomplete comments at the received end", () => {
    const source = "<div>Card</div><!-- comment";
    expect(findStreamingHtmlBlockEnd(source, 0)).toBe(source.length);
  });

  it("does not expect closing tags for void elements", () => {
    const html = '<div><img src="card.png"><br><input value="x"></div>';
    expect(findStreamingHtmlBlockEnd(`${html}Prose`, 0)).toBe(html.length);
  });

  it("allows void elements as siblings before the prose boundary", () => {
    const html = '<div>Card</div><link href="card.css"><img src="card.png">';
    expect(findStreamingHtmlBlockEnd(`${html}Prose`, 0)).toBe(html.length);
  });

  it("recognizes explicitly self-closing elements", () => {
    const html = '<section><custom-card value="x" /></section><hr />';
    expect(findStreamingHtmlBlockEnd(`${html}Prose`, 0)).toBe(html.length);
  });

  it("keeps a doctype and its complete HTML document together", () => {
    const html =
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Card</title></head><body><div>Card</div></body></html>';
    expect(findStreamingHtmlBlockEnd(`${html}Prose`, 0)).toBe(html.length);
  });

  it("handles quoted greater-than signs in a doctype", () => {
    const html = '<!DOCTYPE html SYSTEM "a>b"><html><body>Card</body></html>';
    expect(findStreamingHtmlBlockEnd(`${html}Prose`, 0)).toBe(html.length);
  });

  it("matches HTML tag names and raw-text closing tags case-insensitively", () => {
    const html = '<DIV>Card</DIV><SCRIPT>const text = "< >";</SCRIPT>';
    expect(findStreamingHtmlBlockEnd(`${html}Prose`, 0)).toBe(html.length);
  });

  it("retains trailing whitespace when no prose has arrived", () => {
    const source = "<div>Card</div>\n \t";
    expect(findStreamingHtmlBlockEnd(source, 0)).toBe(source.length);
  });

  it("does not include an ordinary less-than comparison after a closed root", () => {
    const html = "<div>Card</div>";
    expect(findStreamingHtmlBlockEnd(`${html} < 3`, 0)).toBe(html.length);
  });
});
