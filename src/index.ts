// src/index.ts
import MarkdownFlow, {
  ScrollableMarkdownFlow,
} from "./components/MarkdownFlow";
import type { MarkdownFlowProps } from "./components/MarkdownFlow/MarkdownFlow";
import type { ScrollableMarkdownFlowProps } from "./components/MarkdownFlow/ScrollableMarkdownFlow";
import MarkdownFlowEditor from "./components/MarkdownFlowEditor";
import { OnSendContentParams, CustomRenderBarProps } from "./components/types";
import ContentRender from "./components/ContentRender";
import { ContentRenderProps } from "./components/ContentRender/ContentRender";
import {
  EditMode,
  UploadProps,
  ImageResource,
} from "./components/MarkdownFlowEditor";

export {
  MarkdownFlow,
  MarkdownFlowEditor,
  ScrollableMarkdownFlow,
  ContentRender,
};
export type {
  OnSendContentParams,
  CustomRenderBarProps,
  ContentRenderProps,
  MarkdownFlowProps,
  ScrollableMarkdownFlowProps,
  EditMode,
  UploadProps,
  ImageResource,
};
