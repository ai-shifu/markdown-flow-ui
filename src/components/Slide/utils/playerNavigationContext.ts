export interface PlayerControlsWakeNavigationContext {
  shouldWakeControls?: boolean;
}

export const shouldWakePlayerControlsAfterNavigation = (
  context?: PlayerControlsWakeNavigationContext
) => context?.shouldWakeControls !== false;

export const suppressPlayerControlsWakeAfterNavigation = <
  Context extends object,
>(
  context: Context
): Context & { shouldWakeControls: false } => ({
  ...context,
  shouldWakeControls: false,
});
