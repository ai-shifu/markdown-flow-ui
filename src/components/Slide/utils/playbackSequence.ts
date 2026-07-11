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

export interface DefaultAudioSequenceStartOptions {
  currentAudioKey: string | null;
  currentAudioSequenceLength: number;
  currentStepHasSpeakableElement: boolean;
  hasCompletedCurrentStepAudio: boolean;
  shouldBlockPlaybackForInteraction: boolean;
  shouldPausePlaybackForCustomAction: boolean;
  shouldSkipDefaultAudioStart: boolean;
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

export const shouldStartDefaultAudioSequence = ({
  currentAudioKey,
  currentAudioSequenceLength,
  currentStepHasSpeakableElement,
  hasCompletedCurrentStepAudio,
  shouldBlockPlaybackForInteraction,
  shouldPausePlaybackForCustomAction,
  shouldSkipDefaultAudioStart,
}: DefaultAudioSequenceStartOptions) => {
  if (
    currentAudioKey ||
    currentAudioSequenceLength === 0 ||
    shouldSkipDefaultAudioStart
  ) {
    return false;
  }

  if (
    shouldPausePlaybackForCustomAction ||
    !currentStepHasSpeakableElement ||
    shouldBlockPlaybackForInteraction
  ) {
    return false;
  }

  return !hasCompletedCurrentStepAudio;
};
