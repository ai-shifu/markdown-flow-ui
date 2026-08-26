import * as Root from "markdown-flow-ui";
import * as Renderer from "markdown-flow-ui/renderer";
import * as Scroll from "markdown-flow-ui/scroll";

const aliases: (typeof Renderer.ScrollableMarkdownFlow)[] = [
  Root.ScrollableMarkdown,
  Renderer.ScrollableMarkdown,
];
const hooks: (typeof Scroll.useScrollToBottom)[] = [
  Root.useScrollToBottom,
  Renderer.useScrollToBottom,
];

type PublicScrollTypes = [
  Renderer.ScrollableMarkdownFlowProps,
  Renderer.ScrollToBottomButtonProps,
  Renderer.ScrollToBottomPlacement,
  Renderer.ScrollToBottomPosition,
  Renderer.ScrollToBottomControlProps,
  Renderer.LegacyUseScrollToBottomOptions,
  Renderer.PageScrollFallback,
  Renderer.ScrollBehavior,
  Renderer.ScrollMetrics,
  Renderer.ScrollPresentation,
  Renderer.ScrollTarget,
  Renderer.ScrollTargetInput,
  Renderer.ScrollTargetRef,
  Renderer.ScrollTargetResolver,
  Renderer.UseScrollToBottomOptions,
  Renderer.UseScrollToBottomReturn,
];

const button: Root.ScrollToBottomButtonProps = {
  ariaLabel: "Scroll to bottom",
  visible: true,
};
const scrollButton: Scroll.ScrollToBottomButtonProps = button;
const control: Root.ScrollToBottomControlProps = {
  ariaLabel: "Latest",
  viewportRef: { current: null },
};
const scrollControl: Scroll.ScrollToBottomControlProps = control;

// @ts-expect-error Invalid placement must not become an untyped public API.
const invalidPlacement: Renderer.ScrollToBottomPlacement = "top-left";

export { aliases, hooks, scrollButton, scrollControl, invalidPlacement };
export type { PublicScrollTypes };
