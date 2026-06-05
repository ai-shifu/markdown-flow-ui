export interface PlaybackNavigationState {
  defaultPlaying: boolean;
  hasCurrentAudio: boolean;
  hasPendingAutoPlay: boolean;
  isPausedByUser: boolean;
  isPlaybackPaused: boolean;
  isPlaying: boolean;
  isWaitingForMoreAudio: boolean;
}

export const shouldKeepPlayingAfterNavigation = ({
  defaultPlaying,
  hasCurrentAudio,
  hasPendingAutoPlay,
  isPausedByUser,
  isPlaybackPaused,
  isPlaying,
  isWaitingForMoreAudio,
}: PlaybackNavigationState) => {
  if (!defaultPlaying || isPausedByUser || isPlaybackPaused) {
    return false;
  }

  return (
    isPlaying || hasPendingAutoPlay || isWaitingForMoreAudio || !hasCurrentAudio
  );
};
