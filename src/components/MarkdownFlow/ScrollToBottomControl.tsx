import React, { type RefObject } from "react";
import ScrollToBottomButton, {
  type ScrollToBottomButtonProps,
} from "./ScrollToBottomButton";
import useScrollToBottom, {
  type UseScrollToBottomOptions,
} from "./useScrollToBottom";

export interface ScrollToBottomControlProps
  extends UseScrollToBottomOptions,
    Omit<ScrollToBottomButtonProps, "onClick" | "visible"> {
  /** Existing host viewport; no wrapper or content ownership is required. */
  viewportRef: RefObject<HTMLElement | null>;
  /** Optional notification after the control requests a scroll to the end. */
  onScrollToBottom?: () => void;
}

/**
 * Complete scroll-to-bottom control for streaming or asynchronously growing content.
 *
 * The control owns target resolution, follow state, visibility, click behavior,
 * the accessible icon button, and optional portal rendering. Consumers only
 * provide host refs, localized text, and layout inputs.
 */
export const ScrollToBottomControl: React.FC<ScrollToBottomControlProps> = ({
  viewportRef,
  contentRef,
  endRef,
  scrollTarget,
  pageScrollFallback,
  scrollThreshold,
  contentVersion,
  followNewContent,
  autoScrollOnInit,
  behavior,
  onScrollToBottom,
  ...buttonProps
}) => {
  const { showScrollToBottom, scrollToBottom } = useScrollToBottom(
    viewportRef,
    {
      contentRef,
      endRef,
      scrollTarget,
      pageScrollFallback,
      scrollThreshold,
      contentVersion,
      followNewContent,
      autoScrollOnInit,
      behavior,
    }
  );

  return (
    <ScrollToBottomButton
      {...buttonProps}
      visible={showScrollToBottom}
      onClick={() => {
        scrollToBottom();
        onScrollToBottom?.();
      }}
    />
  );
};

export default ScrollToBottomControl;
