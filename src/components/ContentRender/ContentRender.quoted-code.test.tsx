// @vitest-environment jsdom
import React from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ContentRender from "./ContentRender";

vi.mock("mermaid", () => ({ default: {} }));
vi.mock("./plugins/CustomVariable", () => ({ default: () => null }));
vi.mock("./IframeSandbox", () => ({
  default: ({ content }: { content: string }) => (
    <div data-testid="iframe-sandbox" data-content={content} />
  ),
}));

const htmlExample = [
  "<style data-test>body { color: red; }</style>",
  "<div data-quoted-html>Source-only HTML</div>",
].join("\n");

const quoteFence = (marker: string, code: string, closed: boolean) =>
  [
    `> ${marker}html`,
    ...code.split("\n").map((line) => `> ${line}`),
    ...(closed ? [`> ${marker}`] : []),
  ].join("\n");

const expectInertCode = (container: HTMLElement) => {
  expect(container.querySelector('[data-testid="iframe-sandbox"]')).toBeNull();
  expect(document.querySelector("style[data-test]")).toBeNull();
  expect(container.querySelector("div[data-quoted-html]")).toBeNull();
  expect(container.querySelector("iframe")).toBeNull();
  expect(container.querySelector("img[data-quoted-image]")).toBeNull();
  expect(container.querySelector("svg[data-quoted-svg]")).toBeNull();
  expect(container.querySelector(".content-render-svg")).toBeNull();
};

const renderCodeExample = (
  marker: string,
  code: string,
  closed: boolean,
  enableTypewriter: boolean
) => {
  const content = quoteFence(marker, code, closed);
  const onTypewriterStateChange = vi.fn();
  const { container } = render(
    <ContentRender
      content={content}
      enableTypewriter={enableTypewriter}
      typewriterPacing="content-aware"
      typingSpeed={30}
      onTypewriterStateChange={onTypewriterStateChange}
    />
  );

  expectInertCode(container);
  for (
    let tick = 0;
    enableTypewriter &&
    !onTypewriterStateChange.mock.lastCall?.[0].isComplete &&
    tick < content.length + 10;
    tick += 1
  ) {
    act(() => {
      vi.advanceTimersByTime(30);
    });
    expectInertCode(container);
  }

  expect(onTypewriterStateChange).toHaveBeenLastCalledWith(
    expect.objectContaining({
      isComplete: true,
      renderedLength: content.length,
      totalLength: content.length,
    })
  );
  const codeBlocks = container.querySelectorAll("blockquote pre code");
  expect(codeBlocks).toHaveLength(1);
  expect(codeBlocks[0].textContent?.trimEnd()).toBe(code);
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("ContentRender quoted code fences", () => {
  it.each(
    ["```", "~~~"].flatMap((marker) =>
      [false, true].flatMap((closed) =>
        [false, true].map((enableTypewriter) => ({
          marker,
          closed,
          enableTypewriter,
        }))
      )
    )
  )(
    "keeps style and div examples as code ($marker, closed=$closed, typewriter=$enableTypewriter)",
    ({ marker, closed, enableTypewriter }) => {
      renderCodeExample(marker, htmlExample, closed, enableTypewriter);
    }
  );

  it.each([
    {
      name: "native video",
      marker: "```",
      closed: true,
      code: '<iframe data-tag="video" title="Code example"></iframe>',
    },
    {
      name: "image",
      marker: "~~~",
      closed: false,
      code: '<img data-quoted-image alt="Code image" />',
    },
    {
      name: "SVG",
      marker: "```",
      closed: false,
      code: '<svg data-quoted-svg viewBox="0 0 10 10"><text>Code SVG</text></svg>',
    },
  ])("does not activate a quoted $name example while typing", (example) => {
    renderCodeExample(example.marker, example.code, example.closed, true);
  });
});
