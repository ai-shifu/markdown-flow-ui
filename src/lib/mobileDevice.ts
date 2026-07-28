export type MobileDeviceCapabilities = {
  hasMobileUserAgent: boolean;
  hasTabletLikeUserAgent: boolean;
};

export type MobileViewportOrientation = {
  matchMediaLandscape?: boolean;
  orientationType?: string;
  innerWidth?: number;
  innerHeight?: number;
  screenWidth?: number;
  screenHeight?: number;
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
  screenWidth,
  screenHeight,
}: MobileViewportOrientation): boolean => {
  const orientationLandscape =
    resolveLandscapeFromOrientationType(orientationType);

  if (orientationLandscape !== null) {
    return orientationLandscape;
  }

  if (typeof matchMediaLandscape === "boolean") {
    return matchMediaLandscape;
  }

  if (typeof screenWidth !== "number" || typeof screenHeight !== "number") {
    return false;
  }

  return screenWidth > screenHeight;
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
    screenWidth: currentWindow.screen?.width,
    screenHeight: currentWindow.screen?.height,
  });
};

export const subscribeMobileDeviceChange = (
  onChange: () => void,
  win?: Window
) => {
  const currentWindow = win ?? window;
  const screenOrientation = currentWindow.screen?.orientation;
  let lastWidth = currentWindow.innerWidth;

  const handleResize = () => {
    if (currentWindow.innerWidth === lastWidth) {
      return;
    }
    lastWidth = currentWindow.innerWidth;
    onChange();
  };

  currentWindow.addEventListener("orientationchange", onChange);
  currentWindow.addEventListener("resize", handleResize);
  screenOrientation?.addEventListener?.("change", onChange);

  return () => {
    currentWindow.removeEventListener("orientationchange", onChange);
    currentWindow.removeEventListener("resize", handleResize);
    screenOrientation?.removeEventListener?.("change", onChange);
  };
};
