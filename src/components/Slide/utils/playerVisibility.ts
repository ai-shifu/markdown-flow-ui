export type SlidePlayerControlsVisibility = "auto" | "visible" | "hidden";

export interface ResolveSlidePlayerVisibilityOptions {
  playerEnabled?: boolean;
  showPlayer?: boolean;
  playerControlsVisibility?: SlidePlayerControlsVisibility;
  playerAlwaysVisible?: boolean;
}

export interface ResolvedSlidePlayerVisibility {
  playerEnabled: boolean;
  playerControlsVisibility: SlidePlayerControlsVisibility;
}

export const resolveSlidePlayerVisibility = ({
  playerEnabled,
  showPlayer,
  playerControlsVisibility,
  playerAlwaysVisible,
}: ResolveSlidePlayerVisibilityOptions): ResolvedSlidePlayerVisibility => ({
  playerEnabled: playerEnabled ?? showPlayer ?? true,
  playerControlsVisibility:
    playerControlsVisibility ?? (playerAlwaysVisible ? "visible" : "auto"),
});
