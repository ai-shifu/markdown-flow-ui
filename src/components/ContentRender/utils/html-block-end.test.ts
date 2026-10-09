import { describe, expect, it } from "vitest";
import {
  findStreamingHtmlBlockEnd,
  findStreamingHtmlElementEnd,
  readHtmlMarkup,
} from "./html-block-end";

describe("findStreamingHtmlBlockEnd", () => {
  it.each([
    [
      "a closed root followed by prose on the same line",
      "<div>Card</div>",
      "Following prose",
    ],
    [
      "an absolute boundary after introductory text",
      "<section>Card</section>",
      "\nFollowing prose",
      "Introduction\n",
    ],
    [
      "text after inner tags that still belongs to the enclosing root",
      "<div><section><p>Inner</p>\nStill inside section</section>\nStill inside div</div>",
      "\nOutside",
    ],
    [
      "nested roots with the same tag name",
      "<div><div>Inner</div>\nInside outer</div>",
      "Outside",
    ],
    [
      "consecutive HTML siblings across whitespace and comments",
      [
        "<div>Card</div>",
        "<!-- between HTML siblings -->",
        "<style>.card::after { content: '< >'; }</style>",
        '<script>if (1 < 2) { window.card = ">"; }</script>',
        "<section>Another card</section>",
      ].join("\n \t"),
      "\nProse",
    ],
    [
      "sibling roots without separating whitespace",
      "<div>First</div><div>Second</div>",
    ],
    [
      "greater-than signs inside attribute quotes",
      "<div title=\"a > b\" data-other='c > d'>Card</div>",
    ],
    [
      "apparent tags and comparison operators in script bodies",
      '<div>Card</div><script>if (a < b && b > c) { const text = "<div></div>"; }</script>',
    ],
    [
      "apparent tags in style bodies",
      '<style>.card::after { content: "</div><section>"; }</style>',
    ],
    [
      "fake closing roots inside comments",
      "<div><!-- </div> -->\nStill inside</div>",
    ],
    [
      "a comment after the root",
      "<div>Card</div> <!-- comment containing <div> -->",
      "\nProse",
    ],
    [
      "void elements inside a root",
      '<div><img src="card.png"><br><input value="x"></div>',
    ],
    [
      "void elements as siblings",
      '<div>Card</div><link href="card.css"><img src="card.png">',
    ],
    [
      "explicitly self-closing elements",
      '<section><custom-card value="x" /></section><hr />',
    ],
    [
      "a doctype and its complete HTML document",
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Card</title></head><body><div>Card</div></body></html>',
    ],
    [
      "quoted greater-than signs in a doctype",
      '<!DOCTYPE html SYSTEM "a>b"><html><body>Card</body></html>',
    ],
    [
      "case-insensitive tag names and raw-text closing tags",
      '<DIV>Card</DIV><SCRIPT>const text = "< >";</SCRIPT>',
    ],
    [
      "an ordinary less-than comparison after a closed root",
      "<div>Card</div>",
      " < 3",
    ],
  ])(
    "ends HTML before prose for %s",
    (_name, html, prose = "Prose", intro = "") => {
      const source = `${intro}${html}${prose}`;
      expect(findStreamingHtmlBlockEnd(source, intro.length)).toBe(
        intro.length + html.length
      );
    }
  );

  it.each([
    ["an opening root", "<div>"],
    ["text inside an unfinished nested root", "<div><p>Received text"],
    ["text after a closed child", "<div><p>Received</p>\nMore text"],
    ["an unfinished parent", "<div><section>Received</section>"],
    ["an unfinished quoted attribute", '<div title="Received > text'],
    ["an incomplete sibling", "<div>Card</div>\n<style>.card { color: red;"],
    [
      "a partially received script body",
      '<script>if (a < b) { const text = "<div>"; }',
    ],
    ["an incomplete comment", "<div>Card</div><!-- comment"],
    ["trailing whitespace without prose", "<div>Card</div>\n \t"],
    ...["<", "<di", "<div ", '<div title="', "</di", "</div"].map((tail) => [
      `a partially received tail tag ${tail}`,
      `<div>Card</div>\n${tail}`,
    ]),
  ])("keeps the received end for %s", (_name, source) => {
    expect(findStreamingHtmlBlockEnd(source, 0)).toBe(source.length);
  });
});

describe("streaming HTML lexer contracts", () => {
  it("can stop before a known sibling root with an unfinished header", () => {
    const first = "<div>Card</div>";
    expect(
      findStreamingHtmlBlockEnd(`${first}<pre title=\"received`, 0, () => true)
    ).toBe(first.length);
    const ambiguous = `${first}<pr`;
    expect(findStreamingHtmlBlockEnd(ambiguous, 0, () => true)).toBe(
      ambiguous.length
    );
  });

  it.each([
    "<div><div>Nested</div></div>",
    '<script>const tag = "<div>";</script>',
    '<img title="a > b" />',
  ])("returns only one completed element: %s", (element) => {
    const intro = "Intro ";
    const source = `${intro}${element} \n<section>Sibling</section>`;
    expect(findStreamingHtmlElementEnd(source, intro.length)).toBe(
      intro.length + element.length
    );
  });

  it("retains an incomplete element through the received end", () => {
    const source = '<div title="a > b"><p>Received';
    expect(findStreamingHtmlElementEnd(source, 0)).toBe(source.length);
  });

  it("does not interpret quoted tag text as markup", () => {
    const header = "<span title=\"<figure> > text\" data-other='<div>'>";
    expect(readHtmlMarkup(`${header}Content`, 0)).toEqual({
      kind: "tag",
      name: "span",
      end: header.length,
      closing: false,
      selfClosing: false,
    });
  });
});
