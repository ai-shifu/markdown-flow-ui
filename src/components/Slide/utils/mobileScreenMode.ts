export const MOBILE_VIEW_MODES = ["nonFullscreen", "fullscreen"] as const;

export type MobileViewMode = (typeof MOBILE_VIEW_MODES)[number];

export const DEFAULT_MOBILE_VIEW_MODE: MobileViewMode = MOBILE_VIEW_MODES[0];

export const isFullscreenMobileViewMode = (viewMode: MobileViewMode) =>
  viewMode === "fullscreen";

export type ResolveMobileViewModeStateOptions = {
  isMobileDevice: boolean;
  hasManualMobileViewMode: boolean;
  mobileViewMode: MobileViewMode;
  isViewportFullscreenPreferred: boolean;
};

export type ResolvedMobileViewModeState = {
  effectiveMobileViewMode: MobileViewMode;
  isImmersiveMobileFullscreen: boolean;
  isNativeMobileFullscreen: boolean;
  shouldRotateFullscreenViewport: boolean;
};

export const resolveMobileViewModeState = ({
  isMobileDevice,
  hasManualMobileViewMode,
  mobileViewMode,
  isViewportFullscreenPreferred,
}: ResolveMobileViewModeStateOptions): ResolvedMobileViewModeState => {
  const effectiveMobileViewMode = !isMobileDevice
    ? DEFAULT_MOBILE_VIEW_MODE
    : hasManualMobileViewMode
      ? mobileViewMode
      : isViewportFullscreenPreferred
        ? "fullscreen"
        : DEFAULT_MOBILE_VIEW_MODE;
  const isImmersiveMobileFullscreen =
    isMobileDevice &&
    hasManualMobileViewMode &&
    isFullscreenMobileViewMode(effectiveMobileViewMode);
  const isNativeMobileFullscreen =
    isMobileDevice &&
    !hasManualMobileViewMode &&
    isViewportFullscreenPreferred &&
    isFullscreenMobileViewMode(effectiveMobileViewMode);

  return {
    effectiveMobileViewMode,
    isImmersiveMobileFullscreen,
    isNativeMobileFullscreen,
    // Manual fullscreen keeps the current viewport orientation and only swaps the UI layout mode.
    shouldRotateFullscreenViewport: false,
  };
};
