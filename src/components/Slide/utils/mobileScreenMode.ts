export const MOBILE_SCREEN_MODES = ["portrait", "landscape"] as const;

export type MobileScreenMode = (typeof MOBILE_SCREEN_MODES)[number];

export const DEFAULT_MOBILE_SCREEN_MODE: MobileScreenMode =
  MOBILE_SCREEN_MODES[0];

export const isLandscapeMobileScreenMode = (screenMode: MobileScreenMode) =>
  screenMode === "landscape";
