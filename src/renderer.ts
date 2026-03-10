// src/renderer.ts
import MarkdownFlow from "./components/MarkdownFlow";
import ContentRender from "./components/ContentRender";
import MarkdownFlowInput from "./components/ContentRender/MarkdownFlowInput";
import IframeSandbox from "./components/ContentRender/IframeSandbox";
import Slide from "./components/Slide";
import { Player } from "./components/Slide";
import { RenderSegment } from "./components/ContentRender/utils/split-content";
import { splitContentSegments } from "./components/ContentRender/utils/split-content";
import type { MarkdownFlowProps } from "./components/MarkdownFlow/MarkdownFlow";
import type { ContentRenderProps } from "./components/ContentRender/ContentRender";
import type { MarkdownFlowInputProps } from "./components/ContentRender/MarkdownFlowInput";
import type {
  OnSendContentParams,
  CustomRenderBarProps,
} from "./components/types";
import type { IframeSandboxProps } from "./components/ContentRender/IframeSandbox";
import type { SandboxAppProps } from "./components/ContentRender/SandboxApp";
import type { SlideProps, Element, PlayerProps } from "./components/Slide";
export default ContentRender;

export {
  MarkdownFlow,
  ContentRender,
  MarkdownFlowInput,
  IframeSandbox,
  Slide,
  Player,
  splitContentSegments,
};

export type {
  OnSendContentParams,
  CustomRenderBarProps,
  MarkdownFlowProps,
  ContentRenderProps,
  MarkdownFlowInputProps,
  IframeSandboxProps,
  SandboxAppProps,
  SlideProps,
  Element,
  PlayerProps,
  RenderSegment,
};
