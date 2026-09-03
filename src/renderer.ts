// src/renderer.ts
import MarkdownFlow from "./components/MarkdownFlow";
import ScrollableMarkdownFlow from "./components/MarkdownFlow/ScrollableMarkdownFlow";
import ScrollToBottomButton from "./components/MarkdownFlow/ScrollToBottomButton";
import ScrollToBottomControl from "./components/MarkdownFlow/ScrollToBottomControl";
import useScrollToBottom from "./components/MarkdownFlow/useScrollToBottom";
import ContentRender from "./components/ContentRender";
import MarkdownFlowInput from "./components/ContentRender/MarkdownFlowInput";
import IframeSandbox from "./components/ContentRender/IframeSandbox";
import {
  getInteractionDefaultSelectedValues,
  getInteractionDefaultValues,
} from "./lib/interaction-defaults";
import { RenderSegment } from "./components/ContentRender/utils/split-content";
import { splitContentSegments } from "./components/ContentRender/utils/split-content";
import type { MarkdownFlowProps } from "./components/MarkdownFlow/MarkdownFlow";
import type { ScrollableMarkdownFlowProps } from "./components/MarkdownFlow/ScrollableMarkdownFlow";
import type {
  ScrollToBottomButtonProps,
  ScrollToBottomPlacement,
  ScrollToBottomPosition,
} from "./components/MarkdownFlow/ScrollToBottomButton";
import type { ScrollToBottomControlProps } from "./components/MarkdownFlow/ScrollToBottomControl";
import type {
  LegacyUseScrollToBottomOptions,
  PageScrollFallback,
  ScrollBehavior,
  ScrollMetrics,
  ScrollPresentation,
  ScrollTarget,
  ScrollTargetInput,
  ScrollTargetRef,
  ScrollTargetResolver,
  UseScrollToBottomOptions,
  UseScrollToBottomReturn,
} from "./components/MarkdownFlow/useScrollToBottom";
import type {
  ContentRenderProps,
  ContentRenderTypewriterPacing,
  ContentRenderTypewriterState,
} from "./components/ContentRender/ContentRender";
import type {
  MarkdownFlowInputProps,
  MarkdownFlowInputSendShortcut,
} from "./components/ContentRender/MarkdownFlowInput";
import type {
  OnSendContentParams,
  CustomRenderBarProps,
} from "./components/types";
import type { IframeSandboxProps } from "./components/ContentRender/IframeSandbox";
import type { SandboxAppProps } from "./components/ContentRender/SandboxApp";
export default ContentRender;

export {
  MarkdownFlow,
  ScrollableMarkdownFlow,
  ScrollableMarkdownFlow as ScrollableMarkdown,
  ScrollToBottomButton,
  ScrollToBottomControl,
  useScrollToBottom,
  ContentRender,
  MarkdownFlowInput,
  IframeSandbox,
  getInteractionDefaultValues,
  getInteractionDefaultSelectedValues,
  splitContentSegments,
};

export type {
  OnSendContentParams,
  CustomRenderBarProps,
  MarkdownFlowProps,
  ScrollableMarkdownFlowProps,
  ScrollToBottomButtonProps,
  ScrollToBottomPlacement,
  ScrollToBottomPosition,
  ScrollToBottomControlProps,
  LegacyUseScrollToBottomOptions,
  PageScrollFallback,
  ScrollBehavior,
  ScrollMetrics,
  ScrollPresentation,
  ScrollTarget,
  ScrollTargetInput,
  ScrollTargetRef,
  ScrollTargetResolver,
  UseScrollToBottomOptions,
  UseScrollToBottomReturn,
  ContentRenderProps,
  ContentRenderTypewriterPacing,
  ContentRenderTypewriterState,
  MarkdownFlowInputProps,
  MarkdownFlowInputSendShortcut,
  IframeSandboxProps,
  SandboxAppProps,
  RenderSegment,
};
export type {
  InteractionDefaultResolver,
  InteractionDefaultResolverParams,
  InteractionDefaultValueOptions,
  InteractionDefaultValues,
  InteractionParseResult,
} from "./lib/interaction-defaults";
export type { MarkdownFlowLocale } from "./lib/locale";
