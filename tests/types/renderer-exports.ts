import {
  ContentRender,
  IframeSandbox,
  MarkdownFlowInput,
  splitContentSegments,
} from "markdown-flow-ui/renderer";
import type {
  ContentRenderTypewriterPacing,
  ContentRenderTypewriterState,
  InteractionDefaultValueOptions,
  MarkdownFlowInputSendShortcut,
  OnSendContentParams,
  RenderSegment,
} from "markdown-flow-ui/renderer";

const runtimeExports = [
  ContentRender,
  IframeSandbox,
  MarkdownFlowInput,
  splitContentSegments,
];

let onSendContentParams: OnSendContentParams | undefined;
let renderSegment: RenderSegment | undefined;
let interactionDefaultValueOptions: InteractionDefaultValueOptions | undefined;
let sendShortcut: MarkdownFlowInputSendShortcut | undefined;
const typewriterPacing: ContentRenderTypewriterPacing = "content-aware";
let typewriterState: ContentRenderTypewriterState | undefined;

void runtimeExports;
void onSendContentParams;
void renderSegment;
void interactionDefaultValueOptions;
void sendShortcut;
export { typewriterPacing, typewriterState };
