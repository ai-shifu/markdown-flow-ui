import type React from "react";

export type ElementType =
  | "slot"
  | "html"
  | "svg"
  | "diff"
  | "img"
  | "interaction"
  | "tables"
  | "code"
  | "latex"
  | "md_img"
  | "mermaid"
  | "title"
  | "text"
  | "link"
  | string;

export interface ElementAudioSegment {
  segment_index: number;
  audio_data: string;
  duration_ms: number;
  is_final: boolean;
  position?: number;
  slide_id?: string;
  av_contract?: Record<string, unknown> | null;
}

export interface Element {
  content: React.ReactNode;
  type: ElementType;
  is_renderable?: boolean;
  is_new?: boolean;
  is_marker?: boolean;
  sequence_number?: number;
  is_speakable?: boolean;
  audio_url?: string;
  user_input?: string;
  readonly?: boolean;
  audio_segments?: ElementAudioSegment[];
}

export interface SlidePlayerCustomActionContext {
  currentElement?: Element;
  currentIndex: number;
  currentStepElement?: Element;
  isActive: boolean;
  setActive: (active: boolean) => void;
  toggleActive: () => void;
}

export type SlidePlayerCustomActions =
  | React.ReactNode
  | ((context: SlidePlayerCustomActionContext) => React.ReactNode);
