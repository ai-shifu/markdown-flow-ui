import type React from "react";

/** Accept a hint only for an unmodified Tab in a focused, empty input. */
export function acceptPlaceholder(
  event: React.KeyboardEvent<HTMLTextAreaElement>,
  placeholder: string | undefined,
  disabled: boolean | undefined,
  onAccept: ((value: string) => void) | undefined
): boolean {
  const textarea = event.currentTarget;
  if (
    event.defaultPrevented ||
    event.key !== "Tab" ||
    event.shiftKey ||
    event.ctrlKey ||
    event.altKey ||
    event.metaKey ||
    event.repeat ||
    event.nativeEvent.isComposing ||
    event.keyCode === 229 ||
    disabled ||
    textarea.readOnly ||
    textarea.value !== "" ||
    textarea.ownerDocument.activeElement !== textarea ||
    !placeholder?.trim() ||
    !onAccept
  ) {
    return false;
  }

  event.preventDefault();
  onAccept(placeholder);
  // The controlled value is committed after the keyboard handler returns.
  requestAnimationFrame(() => {
    if (
      textarea.ownerDocument.activeElement === textarea &&
      textarea.value === placeholder
    ) {
      textarea.setSelectionRange(placeholder.length, placeholder.length);
    }
  });
  return true;
}
