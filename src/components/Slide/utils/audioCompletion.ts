const DEFAULT_AUDIO_END_TOLERANCE_SECONDS = 0.05;

interface HasReachedAudioEndOptions {
  currentTimeSeconds: number;
  durationSeconds: number;
  toleranceSeconds?: number;
}

export const hasReachedAudioEnd = ({
  currentTimeSeconds,
  durationSeconds,
  toleranceSeconds = DEFAULT_AUDIO_END_TOLERANCE_SECONDS,
}: HasReachedAudioEndOptions) => {
  if (
    !Number.isFinite(currentTimeSeconds) ||
    !Number.isFinite(durationSeconds) ||
    durationSeconds <= 0
  ) {
    return false;
  }

  return currentTimeSeconds >= Math.max(durationSeconds - toleranceSeconds, 0);
};
