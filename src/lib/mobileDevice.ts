export type MobileDeviceCapabilities = {
  hasMobileUserAgent: boolean;
  hasTabletLikeUserAgent: boolean;
};

export type MobileViewportOrientation = {
  matchMediaLandscape?: boolean;
  orientationType?: string;
  innerWidth?: number;
  innerHeight?: number;
  visualViewportWidth?: number;
  visualViewportHeight?: number;
};

const MOBILE_USER_AGENT_PATTERN =
  /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;
const TABLET_USER_AGENT_PATTERN = /iPad|Tablet/i;

export const getMobileDeviceCapabilities = (
  win?: Window
): MobileDeviceCapabilities => {
  const currentWindow = win ?? window;
  const userAgent = currentWindow.navigator?.userAgent ?? "";

  return {
    hasMobileUserAgent: MOBILE_USER_AGENT_PATTERN.test(userAgent),
    hasTabletLikeUserAgent: TABLET_USER_AGENT_PATTERN.test(userAgent),
  };
};

export const resolveMobileDevice = ({
  hasMobileUserAgent,
  hasTabletLikeUserAgent,
}: MobileDeviceCapabilities): boolean => {
  return hasMobileUserAgent || hasTabletLikeUserAgent;
};

const resolveLandscapeFromOrientationType = (
  orientationType?: string
): boolean | null => {
  if (orientationType?.includes("landscape")) {
    return true;
  }

  if (orientationType?.includes("portrait")) {
    return false;
  }

  return null;
};

export const resolveMobileViewportLandscape = ({
  matchMediaLandscape,
  orientationType,
  innerWidth,
  innerHeight,
  visualViewportWidth,
  visualViewportHeight,
}: MobileViewportOrientation): boolean => {
  if (typeof matchMediaLandscape === "boolean") {
    return matchMediaLandscape;
  }

  const orientationLandscape =
    resolveLandscapeFromOrientationType(orientationType);

  if (orientationLandscape !== null) {
    return orientationLandscape;
  }

  const viewportWidth =
    typeof visualViewportWidth === "number" && visualViewportWidth > 0
      ? visualViewportWidth
      : innerWidth;
  const viewportHeight =
    typeof visualViewportHeight === "number" && visualViewportHeight > 0
      ? visualViewportHeight
      : innerHeight;

  if (typeof viewportWidth !== "number" || typeof viewportHeight !== "number") {
    return false;
  }

  return viewportWidth > viewportHeight;
};

export const isMobileDevice = (win?: Window): boolean =>
  resolveMobileDevice(getMobileDeviceCapabilities(win));

export const isLandscapeViewport = (win?: Window): boolean => {
  const currentWindow = win ?? window;
  const matchMediaLandscape =
    typeof currentWindow.matchMedia === "function"
      ? currentWindow.matchMedia("(orientation: landscape)").matches
      : undefined;

  return resolveMobileViewportLandscape({
    matchMediaLandscape,
    orientationType: currentWindow.screen?.orientation?.type,
    innerWidth: currentWindow.innerWidth,
    innerHeight: currentWindow.innerHeight,
    visualViewportWidth: currentWindow.visualViewport?.width,
    visualViewportHeight: currentWindow.visualViewport?.height,
  });
};

export const subscribeMobileDeviceChange = (
  onChange: () => void,
  win?: Window
) => {
  const currentWindow = win ?? window;
  const screenOrientation = currentWindow.screen?.orientation;
  const visualViewport = currentWindow.visualViewport;

  currentWindow.addEventListener("orientationchange", onChange);
  currentWindow.addEventListener("resize", onChange);
  screenOrientation?.addEventListener?.("change", onChange);
  visualViewport?.addEventListener("resize", onChange);

  return () => {
    currentWindow.removeEventListener("orientationchange", onChange);
    currentWindow.removeEventListener("resize", onChange);
    screenOrientation?.removeEventListener?.("change", onChange);
    visualViewport?.removeEventListener("resize", onChange);
  };
};
