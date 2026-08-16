/**
 * Helpers for tracking which audio segments of the current step have played.
 *
 * A step's audio is not a fixed list. Narration is synthesized while the lesson
 * is still streaming, so segments keep arriving after playback has already
 * reached the end of what was available. Progress therefore has to be tracked
 * per audio key rather than by position in the sequence.
 */

/**
 * Return the first audio key of the step that has not played yet.
 *
 * Used to resume playback when late audio extends the current step. Resuming at
 * index 0 instead would replay the opening segment every time.
 */
export const resolvePendingStepAudioKey = (
  audioSequenceKeys: readonly string[],
  playedAudioKeys: ReadonlySet<string>
): string | undefined =>
  audioSequenceKeys.find((audioKey) => !playedAudioKeys.has(audioKey));

/**
 * Return whether the step still holds audio that has not played.
 *
 * When this becomes true again after the step was marked complete, the step is
 * no longer finished and playback must be allowed to restart.
 */
export const hasUnplayedStepAudio = (
  audioSequenceKeys: readonly string[],
  playedAudioKeys: ReadonlySet<string>
): boolean =>
  resolvePendingStepAudioKey(audioSequenceKeys, playedAudioKeys) !== undefined;
