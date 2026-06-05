export type PlayerKeyboardShortcutAction =
  | "togglePlayback"
  | "previous"
  | "next"
  | "fullscreen"
  | "subtitle"
  | "interaction";

export interface PlayerKeyboardShortcutEventLike {
  altKey?: boolean;
  code?: string;
  ctrlKey?: boolean;
  defaultPrevented?: boolean;
  key: string;
  metaKey?: boolean;
  shiftKey?: boolean;
  target?: EventTarget | null;
}

type KeyboardShortcutTarget = EventTarget & {
  closest?: (selectors: string) => unknown;
  getAttribute?: (qualifiedName: string) => string | null;
  isContentEditable?: boolean;
  tagName?: string;
};

const EDITABLE_SELECTOR =
  'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [data-player-keyboard-shortcuts-ignore="true"]';

const NATIVE_SPACE_TARGET_SELECTOR = "button, [role='button']";

const playerKeyboardShortcutOwners = new Set<string>();
let activePlayerKeyboardShortcutOwnerId: string | null = null;

const getTargetCandidate = (
  target: EventTarget | null | undefined
): KeyboardShortcutTarget | null => {
  if (!target || typeof target !== "object") {
    return null;
  }

  return target as KeyboardShortcutTarget;
};

export const getPlayerKeyboardShortcutAction = (
  event: PlayerKeyboardShortcutEventLike
): PlayerKeyboardShortcutAction | null => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
    return null;
  }

  const normalizedKey = event.key.toLowerCase();

  if (
    event.code === "Space" ||
    normalizedKey === " " ||
    normalizedKey === "spacebar"
  ) {
    return "togglePlayback";
  }

  switch (normalizedKey) {
    case "arrowleft":
      return "previous";
    case "arrowright":
      return "next";
    case "f":
      return "fullscreen";
    case "c":
      return "subtitle";
    case "n":
      return "interaction";
    default:
      return null;
  }
};

export const isPlayerKeyboardShortcutEditableTarget = (
  target: EventTarget | null | undefined
) => {
  const candidate = getTargetCandidate(target);

  if (!candidate) {
    return false;
  }

  const tagName = candidate.tagName?.toLowerCase();

  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    return true;
  }

  if (candidate.isContentEditable) {
    return true;
  }

  const contentEditable = candidate.getAttribute?.("contenteditable");

  if (contentEditable !== undefined && contentEditable !== null) {
    return contentEditable.toLowerCase() !== "false";
  }

  return Boolean(candidate.closest?.(EDITABLE_SELECTOR));
};

export const isPlayerKeyboardShortcutNativeSpaceTarget = (
  target: EventTarget | null | undefined
) => {
  const candidate = getTargetCandidate(target);

  if (!candidate) {
    return false;
  }

  const tagName = candidate.tagName?.toLowerCase();

  if (tagName === "button") {
    return true;
  }

  return Boolean(candidate.closest?.(NATIVE_SPACE_TARGET_SELECTOR));
};

export const shouldIgnorePlayerKeyboardShortcutEvent = (
  event: PlayerKeyboardShortcutEventLike,
  action: PlayerKeyboardShortcutAction | null
) => {
  if (event.defaultPrevented || !action) {
    return true;
  }

  if (isPlayerKeyboardShortcutEditableTarget(event.target)) {
    return true;
  }

  return (
    action === "togglePlayback" &&
    isPlayerKeyboardShortcutNativeSpaceTarget(event.target)
  );
};

export const registerPlayerKeyboardShortcutOwner = (ownerId: string) => {
  playerKeyboardShortcutOwners.add(ownerId);

  if (!activePlayerKeyboardShortcutOwnerId) {
    activePlayerKeyboardShortcutOwnerId = ownerId;
  }

  return () => {
    playerKeyboardShortcutOwners.delete(ownerId);

    if (activePlayerKeyboardShortcutOwnerId !== ownerId) {
      return;
    }

    activePlayerKeyboardShortcutOwnerId =
      playerKeyboardShortcutOwners.values().next().value ?? null;
  };
};

export const activatePlayerKeyboardShortcutOwner = (ownerId: string) => {
  if (playerKeyboardShortcutOwners.size === 0) {
    activePlayerKeyboardShortcutOwnerId = ownerId;
    return;
  }

  if (playerKeyboardShortcutOwners.has(ownerId)) {
    activePlayerKeyboardShortcutOwnerId = ownerId;
  }
};

export const isActivePlayerKeyboardShortcutOwner = (ownerId: string) =>
  activePlayerKeyboardShortcutOwnerId === ownerId;

export const resetPlayerKeyboardShortcutOwnersForTest = () => {
  playerKeyboardShortcutOwners.clear();
  activePlayerKeyboardShortcutOwnerId = null;
};
