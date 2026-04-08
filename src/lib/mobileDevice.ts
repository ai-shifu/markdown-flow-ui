export type MobileDeviceCapabilities = {
  hasMobileUserAgent: boolean;
  hasTabletLikeUserAgent: boolean;
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

export const isMobileDevice = (win?: Window): boolean =>
  resolveMobileDevice(getMobileDeviceCapabilities(win));

export const subscribeMobileDeviceChange = (
  onChange: () => void,
  win?: Window
) => {
  const currentWindow = win ?? window;
  currentWindow.addEventListener("orientationchange", onChange);
  currentWindow.addEventListener("resize", onChange);

  return () => {
    currentWindow.removeEventListener("orientationchange", onChange);
    currentWindow.removeEventListener("resize", onChange);
  };
};
