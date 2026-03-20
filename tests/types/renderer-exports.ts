import {
  ContentRender,
  IframeSandbox,
  MarkdownFlowInput,
  Slide,
  splitContentSegments,
} from "markdown-flow-ui/renderer";
import type {
  Element,
  InteractionDefaultValueOptions,
  OnSendContentParams,
  RenderSegment,
} from "markdown-flow-ui/renderer";

const runtimeExports = [
  ContentRender,
  IframeSandbox,
  MarkdownFlowInput,
  Slide,
  splitContentSegments,
];

let onSendContentParams: OnSendContentParams | undefined;
let slideElement: Element | undefined;
let renderSegment: RenderSegment | undefined;
let interactionDefaultValueOptions: InteractionDefaultValueOptions | undefined;

void runtimeExports;
void onSendContentParams;
void slideElement;
void renderSegment;
void interactionDefaultValueOptions;
