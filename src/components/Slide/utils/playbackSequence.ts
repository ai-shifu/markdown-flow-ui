export interface PlaybackSequenceTransitionOptions {
  previousResetKey: string | null;
  nextResetKey: string;
  currentAudioKey: string | null;
  hasCompletedCurrentStepAudio: boolean;
}

export interface PlaybackSequenceTransitionResult {
  hasPlaybackContextChanged: boolean;
  shouldInitializeAudioSequence: boolean;
}

export const getPlaybackSequenceTransition = ({
  previousResetKey,
  nextResetKey,
  currentAudioKey,
  hasCompletedCurrentStepAudio,
}: PlaybackSequenceTransitionOptions): PlaybackSequenceTransitionResult => {
  const hasPlaybackContextChanged = previousResetKey !== nextResetKey;
  const shouldInitializeAudioSequence =
    hasPlaybackContextChanged ||
    (!currentAudioKey && !hasCompletedCurrentStepAudio);

  return {
    hasPlaybackContextChanged,
    shouldInitializeAudioSequence,
  };
};
