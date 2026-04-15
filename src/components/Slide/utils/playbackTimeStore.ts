import { useSyncExternalStore } from "react";

type PlaybackTimeListener = () => void;

export interface PlaybackTimeStore {
  getSnapshot: () => number;
  reset: () => void;
  setTime: (timeMs: number) => void;
  subscribe: (listener: PlaybackTimeListener) => () => void;
}

const getServerSnapshot = () => 0;

export const createPlaybackTimeStore = (
  initialTimeMs = 0
): PlaybackTimeStore => {
  let playbackTimeMs = Math.max(initialTimeMs, 0);
  const listeners = new Set<PlaybackTimeListener>();

  const emitChange = () => {
    listeners.forEach((listener) => {
      listener();
    });
  };

  const setTime = (timeMs: number) => {
    const nextPlaybackTimeMs = Math.max(timeMs, 0);

    if (playbackTimeMs === nextPlaybackTimeMs) {
      return;
    }

    playbackTimeMs = nextPlaybackTimeMs;
    emitChange();
  };

  return {
    getSnapshot: () => playbackTimeMs,
    reset: () => {
      setTime(0);
    },
    setTime,
    subscribe: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
};

export const usePlaybackTimeStore = (playbackTimeStore: PlaybackTimeStore) =>
  useSyncExternalStore(
    playbackTimeStore.subscribe,
    playbackTimeStore.getSnapshot,
    getServerSnapshot
  );
