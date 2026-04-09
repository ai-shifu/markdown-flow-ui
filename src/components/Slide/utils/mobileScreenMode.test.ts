import { describe, expect, it } from "vitest";

import {
  DEFAULT_MOBILE_SCREEN_MODE,
  resolveMobileScreenModeState,
} from "./mobileScreenMode";

describe("resolveMobileScreenModeState", () => {
  it("keeps desktop environments in portrait mode", () => {
    expect(
      resolveMobileScreenModeState({
        hasManualMobileScreenMode: false,
        isMobileDevice: false,
        isViewportLandscape: true,
        mobileScreenMode: "landscape",
      })
    ).toEqual({
      effectiveMobileScreenMode: DEFAULT_MOBILE_SCREEN_MODE,
      isImmersiveMobileLandscape: false,
      isNativeMobileLandscape: false,
      shouldRotateLandscapeViewport: false,
    });
  });

  it("syncs the selected screen mode to landscape when the device rotates without manual override", () => {
    expect(
      resolveMobileScreenModeState({
        hasManualMobileScreenMode: false,
        isMobileDevice: true,
        isViewportLandscape: true,
        mobileScreenMode: DEFAULT_MOBILE_SCREEN_MODE,
      })
    ).toEqual({
      effectiveMobileScreenMode: "landscape",
      isImmersiveMobileLandscape: false,
      isNativeMobileLandscape: true,
      shouldRotateLandscapeViewport: false,
    });
  });

  it("uses immersive landscape when the user explicitly switches to landscape on a portrait viewport", () => {
    expect(
      resolveMobileScreenModeState({
        hasManualMobileScreenMode: true,
        isMobileDevice: true,
        isViewportLandscape: false,
        mobileScreenMode: "landscape",
      })
    ).toEqual({
      effectiveMobileScreenMode: "landscape",
      isImmersiveMobileLandscape: true,
      isNativeMobileLandscape: false,
      shouldRotateLandscapeViewport: false,
    });
  });

  it("allows manual portrait override even when the device stays in physical landscape", () => {
    expect(
      resolveMobileScreenModeState({
        hasManualMobileScreenMode: true,
        isMobileDevice: true,
        isViewportLandscape: true,
        mobileScreenMode: "portrait",
      })
    ).toEqual({
      effectiveMobileScreenMode: "portrait",
      isImmersiveMobileLandscape: false,
      isNativeMobileLandscape: false,
      shouldRotateLandscapeViewport: false,
    });
  });
});
