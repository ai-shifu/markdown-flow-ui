import React, { type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { ChevronsDown } from "lucide-react";

export type ScrollToBottomPlacement = "bottom-center" | "bottom-right";
export type ScrollToBottomPosition = "absolute" | "fixed";

export interface ScrollToBottomButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "aria-label" | "children"
  > {
  /** Whether the control is visible and keyboard-focusable. */
  visible: boolean;
  /** Localized accessible name for the icon-only button. */
  ariaLabel: string;
  /** Optional host element in which the library renders the button. */
  portalTarget?: HTMLElement | null;
  /** Horizontal placement within the positioning context. Defaults to bottom-center. */
  placement?: ScrollToBottomPlacement;
  /** CSS positioning model supplied by the host layout. */
  position?: ScrollToBottomPosition;
  /** Bottom offset in pixels, or any valid CSS length. */
  bottomOffset?: number | string;
  /** Right offset for bottom-right placement, in pixels or a CSS length. */
  horizontalOffset?: number | string;
  /** Stacking level within the host layout. */
  zIndex?: number;
}

type ScrollToBottomButtonStyle = CSSProperties & {
  "--scroll-to-bottom-bottom"?: string;
  "--scroll-to-bottom-horizontal"?: string;
  "--scroll-to-bottom-position"?: ScrollToBottomPosition;
};

const toCssLength = (value: number | string) =>
  typeof value === "number" ? `${value}px` : value;

export const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({
  visible,
  ariaLabel,
  portalTarget,
  placement = "bottom-center",
  position = "absolute",
  bottomOffset = 20,
  horizontalOffset = 20,
  zIndex = 1,
  className = "",
  style,
  tabIndex,
  type = "button",
  ...props
}) => {
  const buttonStyle: ScrollToBottomButtonStyle = {
    "--scroll-to-bottom-bottom": toCssLength(bottomOffset),
    "--scroll-to-bottom-horizontal": toCssLength(horizontalOffset),
    "--scroll-to-bottom-position": position,
    zIndex,
    ...style,
  };
  const button = (
    <button
      {...props}
      type={type}
      className={`scroll-to-bottom-btn ${className}`.trim()}
      style={buttonStyle}
      aria-label={ariaLabel}
      aria-hidden={visible ? undefined : true}
      data-placement={placement}
      data-visible={visible ? "true" : "false"}
      tabIndex={visible ? tabIndex : -1}
    >
      <ChevronsDown size={20} aria-hidden="true" focusable="false" />
    </button>
  );
  return portalTarget ? createPortal(button, portalTarget) : button;
};

export default ScrollToBottomButton;
