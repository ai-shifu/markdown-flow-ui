export const resolveRequestedStepNavigation = ({
  currentStepIndex,
  requestedStepIndex,
  slideStepCount,
}: {
  currentStepIndex: number;
  requestedStepIndex: number | undefined;
  slideStepCount: number;
}) => {
  if (
    typeof requestedStepIndex !== "number" ||
    !Number.isFinite(requestedStepIndex)
  ) {
    return null;
  }

  const targetStepIndex = Math.max(0, Math.trunc(requestedStepIndex));

  return {
    isAvailable: targetStepIndex < slideStepCount,
    isPending: targetStepIndex !== currentStepIndex,
    targetStepIndex,
  };
};
