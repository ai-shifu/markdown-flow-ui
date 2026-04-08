import { describe, expect, it } from "vitest";

import {
  resolveMobileDevice,
  resolveMobileViewportLandscape,
} from "./mobileDevice";

describe("resolveMobileDevice", () => {
  it("treats mobile user agents as mobile", () => {
    expect(
      resolveMobileDevice({
        hasMobileUserAgent: true,
        hasTabletLikeUserAgent: false,
      })
    ).toBe(true);
  });

  it("treats tablet user agents as mobile", () => {
    expect(
      resolveMobileDevice({
        hasMobileUserAgent: false,
        hasTabletLikeUserAgent: true,
      })
    ).toBe(true);
  });

  it("keeps desktop user agents out of mobile mode", () => {
    expect(
      resolveMobileDevice({
        hasMobileUserAgent: false,
        hasTabletLikeUserAgent: false,
      })
    ).toBe(false);
  });
});

describe("resolveMobileViewportLandscape", () => {
  it("prefers matchMedia when it is available", () => {
    expect(
      resolveMobileViewportLandscape({
        matchMediaLandscape: true,
        orientationType: "portrait-primary",
        innerWidth: 390,
        innerHeight: 844,
      })
    ).toBe(true);
  });

  it("falls back to screen orientation when matchMedia is unavailable", () => {
    expect(
      resolveMobileViewportLandscape({
        orientationType: "landscape-primary",
        innerWidth: 390,
        innerHeight: 844,
      })
    ).toBe(true);
  });

  it("falls back to viewport dimensions when orientation metadata is missing", () => {
    expect(
      resolveMobileViewportLandscape({
        innerWidth: 844,
        innerHeight: 390,
      })
    ).toBe(true);
  });

  it("uses visual viewport dimensions before layout viewport dimensions", () => {
    expect(
      resolveMobileViewportLandscape({
        innerWidth: 390,
        innerHeight: 844,
        visualViewportWidth: 844,
        visualViewportHeight: 390,
      })
    ).toBe(true);
  });
});
