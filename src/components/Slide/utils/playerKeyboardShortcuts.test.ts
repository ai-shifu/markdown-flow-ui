import { afterEach, describe, expect, it } from "vitest";

import {
  activatePlayerKeyboardShortcutOwner,
  getPlayerKeyboardShortcutAction,
  isActivePlayerKeyboardShortcutOwner,
  registerPlayerKeyboardShortcutOwner,
  resetPlayerKeyboardShortcutOwnersForTest,
  shouldIgnorePlayerKeyboardShortcutEvent,
} from "./playerKeyboardShortcuts";

const target = (overrides: Record<string, unknown>) =>
  overrides as unknown as EventTarget;

describe("playerKeyboardShortcuts", () => {
  afterEach(() => {
    resetPlayerKeyboardShortcutOwnersForTest();
  });

  it("maps supported keys to existing player actions", () => {
    expect(getPlayerKeyboardShortcutAction({ code: "Space", key: " " })).toBe(
      "togglePlayback"
    );
    expect(getPlayerKeyboardShortcutAction({ key: "ArrowLeft" })).toBe(
      "previous"
    );
    expect(getPlayerKeyboardShortcutAction({ key: "ArrowRight" })).toBe("next");
    expect(getPlayerKeyboardShortcutAction({ key: "f" })).toBe("fullscreen");
    expect(getPlayerKeyboardShortcutAction({ key: "C" })).toBe("subtitle");
    expect(getPlayerKeyboardShortcutAction({ key: "n" })).toBe("interaction");
  });

  it("does not map unsupported media keys", () => {
    expect(getPlayerKeyboardShortcutAction({ key: "k" })).toBeNull();
    expect(getPlayerKeyboardShortcutAction({ key: "j" })).toBeNull();
    expect(getPlayerKeyboardShortcutAction({ key: "l" })).toBeNull();
    expect(getPlayerKeyboardShortcutAction({ key: "m" })).toBeNull();
  });

  it("ignores shortcuts with modifier keys", () => {
    expect(
      getPlayerKeyboardShortcutAction({ key: "f", metaKey: true })
    ).toBeNull();
    expect(
      getPlayerKeyboardShortcutAction({ key: "ArrowRight", shiftKey: true })
    ).toBeNull();
  });

  it("ignores editable and native button targets", () => {
    expect(
      shouldIgnorePlayerKeyboardShortcutEvent(
        { key: "ArrowRight", target: target({ tagName: "textarea" }) },
        "next"
      )
    ).toBe(true);
    expect(
      shouldIgnorePlayerKeyboardShortcutEvent(
        { key: "f", target: target({ isContentEditable: true }) },
        "fullscreen"
      )
    ).toBe(true);
    expect(
      shouldIgnorePlayerKeyboardShortcutEvent(
        { key: " ", target: target({ tagName: "button" }) },
        "togglePlayback"
      )
    ).toBe(true);
  });

  it("tracks the active player owner", () => {
    const unregisterFirst = registerPlayerKeyboardShortcutOwner("first");
    const unregisterSecond = registerPlayerKeyboardShortcutOwner("second");

    expect(isActivePlayerKeyboardShortcutOwner("first")).toBe(true);

    activatePlayerKeyboardShortcutOwner("second");

    expect(isActivePlayerKeyboardShortcutOwner("second")).toBe(true);

    unregisterSecond();

    expect(isActivePlayerKeyboardShortcutOwner("first")).toBe(true);

    unregisterFirst();

    expect(isActivePlayerKeyboardShortcutOwner("first")).toBe(false);
  });

  it("self-heals when registration follows a stale activation", () => {
    activatePlayerKeyboardShortcutOwner("stale");

    registerPlayerKeyboardShortcutOwner("first");

    expect(isActivePlayerKeyboardShortcutOwner("first")).toBe(true);
    expect(isActivePlayerKeyboardShortcutOwner("stale")).toBe(false);
  });
});
