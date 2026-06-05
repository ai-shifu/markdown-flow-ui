export interface PlaybackNavigationState {
  defaultPlaying: boolean;
  isPausedByUser: boolean;
}

export const shouldKeepPlayingAfterNavigation = ({
  defaultPlaying,
  isPausedByUser,
}: PlaybackNavigationState) => {
  return defaultPlaying && !isPausedByUser;
};
