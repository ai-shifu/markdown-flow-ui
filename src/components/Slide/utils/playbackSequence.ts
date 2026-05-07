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

export const resolveNextPendingAudioKey = ({
  audioSequenceKeys,
  lastCompletedAudioKey,
}: {
  audioSequenceKeys: string[];
  lastCompletedAudioKey: string | null;
}) => {
  if (audioSequenceKeys.length === 0) {
    return null;
  }

  if (!lastCompletedAudioKey) {
    return audioSequenceKeys[0] ?? null;
  }

  const lastCompletedAudioIndex = audioSequenceKeys.findIndex(
    (audioKey) => audioKey === lastCompletedAudioKey
  );

  if (lastCompletedAudioIndex < 0) {
    return audioSequenceKeys[0] ?? null;
  }

  return audioSequenceKeys[lastCompletedAudioIndex + 1] ?? null;
};

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
