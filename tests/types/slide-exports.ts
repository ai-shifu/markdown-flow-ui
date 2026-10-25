import type {
  SlidePlaybackCheckpoint,
  SlidePlaybackRestoreRequest,
  SlidePlayerPlaybackCheckpoint,
  SlidePlayerPlaybackRestoreRequest,
} from "markdown-flow-ui/slide";
import type {
  SlidePlaybackCheckpoint as RootSlidePlaybackCheckpoint,
  SlidePlaybackRestoreRequest as RootSlidePlaybackRestoreRequest,
  SlidePlayerPlaybackCheckpoint as RootSlidePlayerPlaybackCheckpoint,
  SlidePlayerPlaybackRestoreRequest as RootSlidePlayerPlaybackRestoreRequest,
} from "markdown-flow-ui";

type PublicSlideTypes = [
  SlidePlaybackCheckpoint,
  SlidePlaybackRestoreRequest,
  SlidePlayerPlaybackCheckpoint,
  SlidePlayerPlaybackRestoreRequest,
  RootSlidePlaybackCheckpoint,
  RootSlidePlaybackRestoreRequest,
  RootSlidePlayerPlaybackCheckpoint,
  RootSlidePlayerPlaybackRestoreRequest,
];

export type { PublicSlideTypes };
