import { describe, expect, it } from "vitest";

import {
  DEFAULT_MOBILE_VIEW_MODE,
  resolveMobileViewModeState,
} from "./mobileScreenMode";

describe("resolveMobileViewModeState", () => {
  it("keeps desktop environments in non-fullscreen mode", () => {
    expect(
      resolveMobileViewModeState({
        hasManualMobileViewMode: false,
        isMobileDevice: false,
        isViewportFullscreenPreferred: true,
        mobileViewMode: "fullscreen",
      })
    ).toEqual({
      effectiveMobileViewMode: DEFAULT_MOBILE_VIEW_MODE,
      isImmersiveMobileFullscreen: false,
      isNativeMobileFullscreen: false,
      shouldRotateFullscreenViewport: false,
    });
  });

  it("syncs the selected view mode to fullscreen when the device rotates without manual override", () => {
    expect(
      resolveMobileViewModeState({
        hasManualMobileViewMode: false,
        isMobileDevice: true,
        isViewportFullscreenPreferred: true,
        mobileViewMode: DEFAULT_MOBILE_VIEW_MODE,
      })
    ).toEqual({
      effectiveMobileViewMode: "fullscreen",
      isImmersiveMobileFullscreen: false,
      isNativeMobileFullscreen: true,
      shouldRotateFullscreenViewport: false,
    });
  });

  it("uses immersive fullscreen when the user explicitly switches to fullscreen on a non-fullscreen viewport", () => {
    expect(
      resolveMobileViewModeState({
        hasManualMobileViewMode: true,
        isMobileDevice: true,
        isViewportFullscreenPreferred: false,
        mobileViewMode: "fullscreen",
      })
    ).toEqual({
      effectiveMobileViewMode: "fullscreen",
      isImmersiveMobileFullscreen: true,
      isNativeMobileFullscreen: false,
      shouldRotateFullscreenViewport: false,
    });
  });

  it("allows manual non-fullscreen override even when the device stays in a fullscreen-preferred viewport", () => {
    expect(
      resolveMobileViewModeState({
        hasManualMobileViewMode: true,
        isMobileDevice: true,
        isViewportFullscreenPreferred: true,
        mobileViewMode: "nonFullscreen",
      })
    ).toEqual({
      effectiveMobileViewMode: "nonFullscreen",
      isImmersiveMobileFullscreen: false,
      isNativeMobileFullscreen: false,
      shouldRotateFullscreenViewport: false,
    });
  });
});
