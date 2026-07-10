import { describe, expect, it } from "vitest";

import {
  forceSandboxLinksToOpenInNewTab,
  mergeAnchorRelValue,
  shouldForceAnchorHrefToNewTab,
} from "./link-targets";

describe("shouldForceAnchorHrefToNewTab", () => {
  it("returns true for regular links", () => {
    expect(shouldForceAnchorHrefToNewTab("https://app.ai-shifu.cn")).toBe(true);
    expect(shouldForceAnchorHrefToNewTab("/docs/lesson")).toBe(true);
  });

  it("skips hash and javascript links", () => {
    expect(shouldForceAnchorHrefToNewTab("#section-1")).toBe(false);
    expect(shouldForceAnchorHrefToNewTab(" javascript:void(0) ")).toBe(false);
    expect(shouldForceAnchorHrefToNewTab(null)).toBe(false);
  });
});

describe("mergeAnchorRelValue", () => {
  it("adds noopener and noreferrer without duplicating tokens", () => {
    expect(mergeAnchorRelValue("nofollow noopener")).toBe(
      "nofollow noopener noreferrer"
    );
    expect(mergeAnchorRelValue(null)).toBe("noopener noreferrer");
  });
});

describe("forceSandboxLinksToOpenInNewTab", () => {
  it("adds target and rel to external links", () => {
    expect(
      forceSandboxLinksToOpenInNewTab(
        '<p><a href="https://app.ai-shifu.cn/course/1">Learn course</a></p>'
      )
    ).toContain(
      '<a href="https://app.ai-shifu.cn/course/1" target="_blank" rel="noopener noreferrer">'
    );
  });

  it("preserves existing rel tokens while adding safe ones", () => {
    expect(
      forceSandboxLinksToOpenInNewTab(
        '<a href="/c/test" rel="nofollow">Course link</a>'
      )
    ).toContain(
      '<a href="/c/test" rel="nofollow noopener noreferrer" target="_blank">'
    );
  });

  it("does not patch hash or javascript links", () => {
    expect(
      forceSandboxLinksToOpenInNewTab('<a href="#chapter-1">Jump</a>')
    ).toBe('<a href="#chapter-1">Jump</a>');
    expect(
      forceSandboxLinksToOpenInNewTab(
        '<a href="javascript:void(0)">Open menu</a>'
      )
    ).toBe('<a href="javascript:void(0)">Open menu</a>');
  });
});
