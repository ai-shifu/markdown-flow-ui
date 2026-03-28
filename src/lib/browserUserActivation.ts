export type UserActivationLike = {
  hasBeenActive?: boolean;
  isActive?: boolean;
};

export const hasBrowserUserActivation = () => {
  if (typeof window === "undefined") {
    return false;
  }

  const navigatorActivation = (
    navigator as Navigator & { userActivation?: UserActivationLike }
  ).userActivation;

  if (navigatorActivation) {
    return Boolean(
      navigatorActivation.hasBeenActive || navigatorActivation.isActive
    );
  }

  const documentActivation = (
    document as Document & { userActivation?: UserActivationLike }
  ).userActivation;

  return Boolean(
    documentActivation?.hasBeenActive || documentActivation?.isActive
  );
};
