import { describe, expect, it } from "vitest";
import { splitContentSegments } from "./split-content";
import { getMarkdownSourceAnalysis } from "./inline-code-ranges";

const examples = [
  "<figure>Example</figure>",
  "<svg><text>Example</text></svg>",
  '<iframe data-tag="video"></iframe>',
];

const expectInertImage = (raw: string) => {
  const segments = splitContentSegments(raw, true, true);
  expect(segments.some((segment) => segment.type === "sandbox")).toBe(false);
  expect(
    segments.some((segment) => segment.type === "markdown" && segment.immediate)
  ).toBe(false);
  expect(segments.some((segment) => segment.value.startsWith("<svg"))).toBe(
    false
  );
  expect(segments.map((segment) => segment.value).join("")).toBe(raw);
};

describe("streaming image alt literals", () => {
  it.each(examples)("preserves simple inline image segmentation: %s", (alt) => {
    const raw = `![${alt}](/image)`;
    expect(splitContentSegments(raw, true, true)).toEqual([
      { type: "markdown", value: raw },
    ]);
    expectInertImage(raw);
  });

  it.each(examples)("keeps reference image alt inert: %s", (alt) => {
    const raw = `![${alt}][image]\n\n[image]: /image`;
    expect(raw).toContain("\n\n");
    const paragraph = getMarkdownSourceAnalysis(raw).tree.children[0];
    expect(paragraph.type === "paragraph" && paragraph.children[0].type).toBe(
      "imageReference"
    );
    expectInertImage(raw);
  });

  it.each(examples)("keeps nested bracket image alt inert: %s", (alt) => {
    expectInertImage(`![a [nested] ${alt}](/image)`);
  });

  it.each(examples)("keeps received image label prefixes inert: %s", (alt) => {
    const raw = `![${alt}](/image)`;
    for (let length = 2; length <= raw.length; length += 1)
      expectInertImage(raw.slice(0, length));
  });

  it("releases a new paragraph after an unfinished image label", () => {
    const prefix = "![<figure>Example\n \t\n";
    const html = "<figure>Actual</figure>";
    expect(splitContentSegments(`${prefix}${html}`, true, true)).toEqual([
      { type: "text", value: prefix },
      { type: "sandbox", value: html },
    ]);
  });

  it("releases actual HTML when an image suffix is invalid", () => {
    const html = "<figure>Actual</figure>";
    expect(splitContentSegments(`![${html}]broken`, true, true)).toEqual([
      { type: "text", value: "![" },
      { type: "sandbox", value: html },
      { type: "text", value: "]broken" },
    ]);
  });
});
