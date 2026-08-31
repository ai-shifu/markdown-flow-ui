import { describe, expect, it } from "vitest";

import {
  resolveSlidePlayerLayoutState,
  resolveSlidePlayerVisibility,
} from "./playerVisibility";

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

describe("resolveSlidePlayerLayoutState", () => {
  it("keeps player layout reserved when auto-hidden controls disappear", () => {
    expect(
      resolveSlidePlayerLayoutState({
        isAutoVisible: true,
        playerControlsVisibility: "auto",
        shouldMountPlayer: true,
      })
    ).toEqual({
      controlsVisible: true,
      layoutReserved: true,
    });

    expect(
      resolveSlidePlayerLayoutState({
        isAutoVisible: false,
        playerControlsVisibility: "auto",
        shouldMountPlayer: true,
      })
    ).toEqual({
      controlsVisible: false,
      layoutReserved: true,
    });
  });

  it("reserves player layout when controls are explicitly hidden", () => {
    expect(
      resolveSlidePlayerLayoutState({
        isAutoVisible: true,
        playerControlsVisibility: "hidden",
        shouldMountPlayer: true,
      })
    ).toEqual({
      controlsVisible: false,
      layoutReserved: true,
    });
  });

  it("does not reserve layout when the player is not mounted", () => {
    expect(
      resolveSlidePlayerLayoutState({
        isAutoVisible: true,
        playerControlsVisibility: "visible",
        shouldMountPlayer: false,
      })
    ).toEqual({
      controlsVisible: false,
      layoutReserved: false,
    });
  });
});
