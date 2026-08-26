import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ScrollToBottomButton from "./ScrollToBottomButton";
import ScrollToBottomControl from "./ScrollToBottomControl";

describe("scroll-to-bottom placement", () => {
  it("defaults to bottom-center without changing the bottom offset", () => {
    const markup = renderToStaticMarkup(
      <ScrollToBottomButton visible ariaLabel="Scroll to bottom" />
    );

    expect(markup).toContain('data-placement="bottom-center"');
    expect(markup).toContain("--scroll-to-bottom-bottom:20px");
    expect(markup).toContain("--scroll-to-bottom-position:absolute");
  });

  it("uses the same default placement through the complete control", () => {
    const markup = renderToStaticMarkup(
      <ScrollToBottomControl
        viewportRef={{ current: null }}
        ariaLabel="Scroll to bottom"
      />
    );

    expect(markup).toContain('data-placement="bottom-center"');
    expect(markup).toContain("--scroll-to-bottom-bottom:20px");
  });

  it("preserves explicit bottom-right placement and offsets", () => {
    const markup = renderToStaticMarkup(
      <ScrollToBottomButton
        visible
        ariaLabel="Scroll to bottom"
        placement="bottom-right"
        bottomOffset={32}
        horizontalOffset={24}
      />
    );

    expect(markup).toContain('data-placement="bottom-right"');
    expect(markup).toContain("--scroll-to-bottom-bottom:32px");
    expect(markup).toContain("--scroll-to-bottom-horizontal:24px");
  });
});
