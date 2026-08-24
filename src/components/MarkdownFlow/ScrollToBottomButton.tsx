import React from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

export interface ScrollToBottomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  visible: boolean;
  ariaLabel: string;
  portalTarget?: HTMLElement | null;
}

export const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({
  visible,
  ariaLabel,
  portalTarget,
  className = "",
  ...props
}) => {
  if (!visible) return null;
  const button = (
    <button
      {...props}
      type={props.type || "button"}
      className={`scroll-to-bottom-btn ${className}`.trim()}
      aria-label={ariaLabel}
    >
      <ChevronDown aria-hidden="true" focusable="false" />
    </button>
  );
  return portalTarget ? createPortal(button, portalTarget) : button;
};

export default ScrollToBottomButton;
