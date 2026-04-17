import { describe, expect, it } from "vitest";

import type { Element } from "../types";
import { resolveNextSlideIndexAfterMarkerAppend } from "./streamingNavigation";

const createMarkerElement = (overrides: Partial<Element> = {}): Element => ({
  content: "",
  type: "html",
  is_marker: true,
  is_renderable: true,
  ...overrides,
});

describe("resolveNextSlideIndexAfterMarkerAppend", () => {
  it("jumps into the first appended marker after a resolved interaction", () => {
    const resolvedInteraction = createMarkerElement({
      type: "interaction",
      readonly: true,
      content: "?[%{{vibe_current_understanding}}A|B]",
    });
    const appendedHtmlMarker = createMarkerElement({
      type: "html",
      content: "<div>next</div>",
    });

    expect(
      resolveNextSlideIndexAfterMarkerAppend({
        previousIndex: 0,
        previousSlideElementList: [resolvedInteraction],
        nextSlideElementList: [resolvedInteraction, appendedHtmlMarker],
      })
    ).toBe(1);
  });

  it("keeps the current index when markers are only updated in place", () => {
    const htmlMarker = createMarkerElement({
      type: "html",
      content: "<div>streaming</div>",
    });

    expect(
      resolveNextSlideIndexAfterMarkerAppend({
        previousIndex: 0,
        previousSlideElementList: [htmlMarker],
        nextSlideElementList: [htmlMarker],
      })
    ).toBe(0);
  });

  it("does not auto-jump when the previous last marker is not a resolved interaction", () => {
    const pendingInteraction = createMarkerElement({
      type: "interaction",
      readonly: false,
      user_input: "",
      content: "?[%{{vibe_current_understanding}}A|B]",
    });
    const appendedHtmlMarker = createMarkerElement({
      type: "html",
      content: "<div>next</div>",
    });

    expect(
      resolveNextSlideIndexAfterMarkerAppend({
        previousIndex: 0,
        previousSlideElementList: [pendingInteraction],
        nextSlideElementList: [pendingInteraction, appendedHtmlMarker],
      })
    ).toBe(0);
  });
});
