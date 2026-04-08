export const MOBILE_SCREEN_MODES = ["portrait", "landscape"] as const;

export type MobileScreenMode = (typeof MOBILE_SCREEN_MODES)[number];

export const DEFAULT_MOBILE_SCREEN_MODE: MobileScreenMode =
  MOBILE_SCREEN_MODES[0];

export const isLandscapeMobileScreenMode = (screenMode: MobileScreenMode) =>
  screenMode === "landscape";

export type ResolveMobileScreenModeStateOptions = {
  isMobileDevice: boolean;
  hasManualMobileScreenMode: boolean;
  mobileScreenMode: MobileScreenMode;
  isViewportLandscape: boolean;
};

export type ResolvedMobileScreenModeState = {
  effectiveMobileScreenMode: MobileScreenMode;
  isImmersiveMobileLandscape: boolean;
  isNativeMobileLandscape: boolean;
  shouldRotateLandscapeViewport: boolean;
};

export const resolveMobileScreenModeState = ({
  isMobileDevice,
  hasManualMobileScreenMode,
  mobileScreenMode,
  isViewportLandscape,
}: ResolveMobileScreenModeStateOptions): ResolvedMobileScreenModeState => {
  const effectiveMobileScreenMode = !isMobileDevice
    ? DEFAULT_MOBILE_SCREEN_MODE
    : hasManualMobileScreenMode
      ? mobileScreenMode
      : isViewportLandscape
        ? "landscape"
        : DEFAULT_MOBILE_SCREEN_MODE;
  const isImmersiveMobileLandscape =
    isMobileDevice &&
    hasManualMobileScreenMode &&
    isLandscapeMobileScreenMode(effectiveMobileScreenMode);
  const isNativeMobileLandscape =
    isMobileDevice &&
    !hasManualMobileScreenMode &&
    isViewportLandscape &&
    isLandscapeMobileScreenMode(effectiveMobileScreenMode);

  return {
    effectiveMobileScreenMode,
    isImmersiveMobileLandscape,
    isNativeMobileLandscape,
    shouldRotateLandscapeViewport:
      isImmersiveMobileLandscape && !isViewportLandscape,
  };
};
