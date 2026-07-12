import { describe, expect, it, vi } from "vitest";

import {
  isAnchorElement,
  mergeAnchorRelValue,
  resolveClosestAnchor,
  shouldForceAnchorHrefToNewTab,
} from "./link-targets";

describe("shouldForceAnchorHrefToNewTab", () => {
  it("returns true for regular links", () => {
    expect(shouldForceAnchorHrefToNewTab("https://app.ai-shifu.cn")).toBe(true);
    expect(shouldForceAnchorHrefToNewTab("/docs/lesson")).toBe(true);
  });

  it("skips non-navigating and external-app links", () => {
    expect(shouldForceAnchorHrefToNewTab("")).toBe(false);
    expect(shouldForceAnchorHrefToNewTab("#section-1")).toBe(false);
    expect(shouldForceAnchorHrefToNewTab(" javascript:void(0) ")).toBe(false);
    expect(shouldForceAnchorHrefToNewTab("data:text/plain,hello")).toBe(false);
    expect(shouldForceAnchorHrefToNewTab("mailto:hello@example.com")).toBe(
      false
    );
    expect(shouldForceAnchorHrefToNewTab("tel:+8613800138000")).toBe(false);
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

  it("keeps rel tokens unique", () => {
    expect(mergeAnchorRelValue("noopener noreferrer nofollow noreferrer")).toBe(
      "noopener noreferrer nofollow"
    );
  });
});

describe("realm-safe anchor helpers", () => {
  it("identifies anchor elements by tagName instead of instanceof", () => {
    expect(isAnchorElement({ tagName: "A" })).toBe(true);
    expect(isAnchorElement({ tagName: "DIV" })).toBe(false);
  });

  it("resolves anchors via closest from element-like event targets", () => {
    const anchor = { tagName: "A" } as HTMLAnchorElement;
    const closest = vi.fn(() => anchor);

    expect(resolveClosestAnchor({ closest } as unknown as EventTarget)).toBe(
      anchor
    );
    expect(closest).toHaveBeenCalledWith("a[href]");
  });

  it("falls back to parentElement.closest for text-node-like targets", () => {
    const anchor = { tagName: "A" } as HTMLAnchorElement;
    const closest = vi.fn(() => anchor);

    expect(
      resolveClosestAnchor({
        parentElement: { closest },
      } as unknown as EventTarget)
    ).toBe(anchor);
    expect(closest).toHaveBeenCalledWith("a[href]");
  });
});

describe("href edge cases", () => {
  it("treats query strings containing target or rel as normal URLs", () => {
    expect(
      shouldForceAnchorHrefToNewTab(
        "https://app.ai-shifu.cn/course/2?target=keep&rel=safe"
      )
    ).toBe(true);
  });

  it("treats values from single-quoted and unquoted href attributes as normal URLs", () => {
    expect(
      shouldForceAnchorHrefToNewTab("https://app.ai-shifu.cn/course/1")
    ).toBe(true);
    expect(
      shouldForceAnchorHrefToNewTab("https://app.ai-shifu.cn/course/2")
    ).toBe(true);
  });
});
