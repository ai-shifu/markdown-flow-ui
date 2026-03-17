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

export type SlideOperation = "new" | "append" | string;

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
  is_show?: boolean;
  operation?: SlideOperation;
  is_checkpoint?: boolean;
  serial_number?: number;
  is_read?: boolean;
  audio_url?: string;
  user_input?: string;
  readonly?: boolean;
  audio_segments?: ElementAudioSegment[];
}
