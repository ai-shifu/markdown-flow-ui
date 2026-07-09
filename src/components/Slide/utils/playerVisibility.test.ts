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

  it("prefers playerControlsVisibility over playerAlwaysVisible", () => {
    expect(
      resolveSlidePlayerVisibility({
        playerAlwaysVisible: true,
        playerControlsVisibility: "hidden",
      })
    ).toEqual({
      playerEnabled: true,
      playerControlsVisibility: "hidden",
    });
  });

  it("prefers playerEnabled over showPlayer", () => {
    expect(
      resolveSlidePlayerVisibility({
        playerEnabled: true,
        showPlayer: false,
      })
    ).toEqual({
      playerEnabled: true,
      playerControlsVisibility: "auto",
    });
  });

  it("keeps showPlayer compatibility when playerEnabled is not set", () => {
    expect(resolveSlidePlayerVisibility({ showPlayer: false })).toEqual({
      playerEnabled: false,
      playerControlsVisibility: "auto",
    });
  });
});
