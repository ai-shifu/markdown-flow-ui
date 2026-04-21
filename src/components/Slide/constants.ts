export const DEFAULT_FULLSCREEN_HINT_DURATION_MS = 3000;
export const DEFAULT_STREAM_INACTIVITY_TIMEOUT_MS = 15000;
export const SLIDE_ERROR_CODES = {
  STREAM_INACTIVITY_TIMEOUT: "stream_inactivity_timeout",
} as const;

export const DEFAULT_SLIDE_PLAYER_TEXTS = {
  settingsTitle: "Settings",
  subtitleLabel: "Subtitles",
  subtitleToggleAriaLabel: "Toggle subtitles",
  screenLabel: "Screen",
  nonFullscreenLabel: "Non-fullscreen",
  fullscreenLabel: "Fullscreen",
  fullscreenHintText: "Rotate your screen for the best experience.",
} as const;
