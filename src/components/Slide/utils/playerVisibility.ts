export type SlidePlayerControlsVisibility = "auto" | "visible" | "hidden";

export interface ResolveSlidePlayerVisibilityOptions {
  playerEnabled?: boolean;
  playerControlsVisibility?: SlidePlayerControlsVisibility;
}

export interface ResolvedSlidePlayerVisibility {
  playerEnabled: boolean;
  playerControlsVisibility: SlidePlayerControlsVisibility;
}

export const resolveSlidePlayerVisibility = ({
  playerEnabled,
  playerControlsVisibility,
}: ResolveSlidePlayerVisibilityOptions): ResolvedSlidePlayerVisibility => ({
  playerEnabled: playerEnabled ?? true,
  playerControlsVisibility: playerControlsVisibility ?? "auto",
});
