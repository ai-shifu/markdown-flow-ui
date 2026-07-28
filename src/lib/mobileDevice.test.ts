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
      })
    ).toBe(false);
  });

  it("uses screen orientation when matchMedia is unavailable", () => {
    expect(
      resolveMobileViewportLandscape({
        orientationType: "landscape-primary",
      })
    ).toBe(true);
  });

  it("falls back to matchMedia when screen orientation is unavailable", () => {
    expect(
      resolveMobileViewportLandscape({
        matchMediaLandscape: true,
      })
    ).toBe(true);
  });

  it("falls back to stable screen dimensions when orientation metadata is missing", () => {
    expect(
      resolveMobileViewportLandscape({
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
  const createMobileWindow = () => {
    const screenOrientation = Object.assign(new EventTarget(), {
      type: "portrait-primary",
    });
    const visualViewport = new EventTarget();
    const win = new EventTarget() as EventTarget & {
      matchMedia: Window["matchMedia"];
      innerWidth: number;
      screen: {
        height: number;
        orientation: EventTarget & { type: string };
        width: number;
      };
      visualViewport: EventTarget;
    };
    win.innerWidth = 390;
    win.matchMedia = ((query: string) => ({
      matches:
        query === "(orientation: landscape)" &&
        screenOrientation.type.includes("landscape"),
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    })) as Window["matchMedia"];
    win.screen = {
      height: 844,
      orientation: screenOrientation,
      width: 390,
    };
    win.visualViewport = visualViewport;

    return { screenOrientation, visualViewport, win };
  };

  it("ignores keyboard-driven viewport resizes", () => {
    const { visualViewport, win } = createMobileWindow();
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
    unsubscribe();
  });

  it("ignores same-orientation width changes", () => {
    const { win } = createMobileWindow();
    let changeCount = 0;

    const unsubscribe = subscribeMobileDeviceChange(
      () => {
        changeCount += 1;
      },
      win as unknown as Window
    );

    win.innerWidth = 500;
    win.dispatchEvent(new Event("resize"));

    expect(changeCount).toBe(0);
    unsubscribe();
  });

  it("notifies once for duplicate events from the same orientation change", () => {
    const { screenOrientation, win } = createMobileWindow();
    let changeCount = 0;

    const unsubscribe = subscribeMobileDeviceChange(
      () => {
        changeCount += 1;
      },
      win as unknown as Window
    );

    screenOrientation.type = "landscape-primary";
    win.screen.width = 844;
    win.screen.height = 390;

    win.dispatchEvent(new Event("orientationchange"));
    win.dispatchEvent(new Event("resize"));
    screenOrientation.dispatchEvent(new Event("change"));

    expect(changeCount).toBe(1);
    unsubscribe();
  });

  it("stops notifying after unsubscribe", () => {
    const { screenOrientation, win } = createMobileWindow();
    let changeCount = 0;

    const unsubscribe = subscribeMobileDeviceChange(
      () => {
        changeCount += 1;
      },
      win as unknown as Window
    );

    unsubscribe();

    screenOrientation.type = "landscape-primary";
    win.dispatchEvent(new Event("orientationchange"));
    screenOrientation.dispatchEvent(new Event("change"));

    expect(changeCount).toBe(0);
  });
});
