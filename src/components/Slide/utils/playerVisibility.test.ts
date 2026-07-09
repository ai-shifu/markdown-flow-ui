import { describe, expect, it } from "vitest";

import { resolveSlidePlayerVisibility } from "./playerVisibility";

describe("resolveSlidePlayerVisibility", () => {
  it("defaults to an enabled player with auto-hidden controls", () => {
    expect(resolveSlidePlayerVisibility({})).toEqual({
      playerEnabled: true,
      playerControlsVisibility: "auto",
    });
  });

  it("allows disabling the player runtime", () => {
    expect(resolveSlidePlayerVisibility({ playerEnabled: false })).toEqual({
      playerEnabled: false,
      playerControlsVisibility: "auto",
    });
  });

  it("keeps the player enabled when controls are hidden", () => {
    expect(
      resolveSlidePlayerVisibility({ playerControlsVisibility: "hidden" })
    ).toEqual({
      playerEnabled: true,
      playerControlsVisibility: "hidden",
    });
  });

  it("uses explicit always-visible controls", () => {
    expect(
      resolveSlidePlayerVisibility({
        playerControlsVisibility: "visible",
      })
    ).toEqual({
      playerEnabled: true,
      playerControlsVisibility: "visible",
    });
  });
});
