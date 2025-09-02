// src/index.ts
import MarkdownFlow, {
  ScrollableMarkdownFlow,
} from "./components/MarkdownFlow";
import type { MarkdownFlowProps } from "./components/MarkdownFlow/MarkdownFlow";
import type { ScrollableMarkdownFlowProps } from "./components/MarkdownFlow/ScrollableMarkdownFlow";
import MarkdownFlowEditor from "./components/MarkdownFlowEditor";
import { OnSendContentParams, CustomRenderBarProps } from "./components/types";
import { ContentRenderProps } from "./components/ContentRender/ContentRender";

export { MarkdownFlow, MarkdownFlowEditor, ScrollableMarkdownFlow };
export type {
  OnSendContentParams,
  CustomRenderBarProps,
  ContentRenderProps,
  MarkdownFlowProps,
  ScrollableMarkdownFlowProps,
};
