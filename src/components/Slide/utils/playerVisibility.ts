export type SlidePlayerControlsVisibility = "auto" | "visible" | "hidden";

export interface ResolveSlidePlayerVisibilityOptions {
  playerEnabled?: boolean;
  playerControlsVisibility?: SlidePlayerControlsVisibility;
}

export interface ResolvedSlidePlayerVisibility {
  playerEnabled: boolean;
  playerControlsVisibility: SlidePlayerControlsVisibility;
}

export interface ResolveSlidePlayerLayoutStateOptions {
  isAutoVisible: boolean;
  playerControlsVisibility: SlidePlayerControlsVisibility;
  shouldMountPlayer: boolean;
}

export interface ResolvedSlidePlayerLayoutState {
  controlsVisible: boolean;
  layoutReserved: boolean;
}

export const resolveSlidePlayerVisibility = ({
  playerEnabled,
  playerControlsVisibility,
}: ResolveSlidePlayerVisibilityOptions): ResolvedSlidePlayerVisibility => ({
  playerEnabled: playerEnabled ?? true,
  playerControlsVisibility: playerControlsVisibility ?? "auto",
});

export const resolveSlidePlayerLayoutState = ({
  isAutoVisible,
  playerControlsVisibility,
  shouldMountPlayer,
}: ResolveSlidePlayerLayoutStateOptions): ResolvedSlidePlayerLayoutState => ({
  controlsVisible:
    shouldMountPlayer &&
    playerControlsVisibility !== "hidden" &&
    (playerControlsVisibility === "visible" || isAutoVisible),
  layoutReserved: shouldMountPlayer,
});
