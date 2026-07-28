import { describe, expect, it } from "vitest";

import {
  resolveMobileDevice,
  resolveMobileViewportLandscape,
  subscribeMobileDeviceChange,
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
  it("prefers screen orientation over viewport media queries", () => {
    expect(
      resolveMobileViewportLandscape({
        matchMediaLandscape: true,
        orientationType: "portrait-primary",
        innerWidth: 390,
        innerHeight: 844,
      })
    ).toBe(false);
  });

  it("uses screen orientation when matchMedia is unavailable", () => {
    expect(
      resolveMobileViewportLandscape({
        orientationType: "landscape-primary",
        innerWidth: 390,
        innerHeight: 844,
      })
    ).toBe(true);
  });

  it("falls back to matchMedia when screen orientation is unavailable", () => {
    expect(
      resolveMobileViewportLandscape({
        matchMediaLandscape: true,
        innerWidth: 390,
        innerHeight: 844,
      })
    ).toBe(true);
  });

  it("falls back to stable screen dimensions when orientation metadata is missing", () => {
    expect(
      resolveMobileViewportLandscape({
        innerWidth: 844,
        innerHeight: 390,
        screenWidth: 844,
        screenHeight: 390,
      })
    ).toBe(true);
  });

  it("returns false when no orientation metadata or stable dimensions are available", () => {
    expect(resolveMobileViewportLandscape({})).toBe(false);
  });
});

describe("subscribeMobileDeviceChange", () => {
  it("ignores keyboard-driven viewport resizes", () => {
    const screenOrientation = new EventTarget();
    const visualViewport = new EventTarget();
    const win = new EventTarget() as EventTarget & {
      innerWidth: number;
      screen: { orientation: EventTarget };
      visualViewport: EventTarget;
    };
    win.innerWidth = 390;
    win.screen = { orientation: screenOrientation };
    win.visualViewport = visualViewport;
    let changeCount = 0;

    const unsubscribe = subscribeMobileDeviceChange(
      () => {
        changeCount += 1;
      },
      win as unknown as Window
    );

    win.dispatchEvent(new Event("resize"));
    visualViewport.dispatchEvent(new Event("resize"));

    expect(changeCount).toBe(0);

    win.innerWidth = 500;
    win.dispatchEvent(new Event("resize"));

    expect(changeCount).toBe(1);

    win.dispatchEvent(new Event("orientationchange"));
    screenOrientation.dispatchEvent(new Event("change"));

    expect(changeCount).toBe(3);

    unsubscribe();
    win.innerWidth = 600;
    win.dispatchEvent(new Event("resize"));
    win.dispatchEvent(new Event("orientationchange"));
    screenOrientation.dispatchEvent(new Event("change"));

    expect(changeCount).toBe(3);
  });
});
