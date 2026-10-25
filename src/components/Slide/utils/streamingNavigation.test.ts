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

  it("clamps to the last surviving slide when history reselection truncates later markers", () => {
    const firstMarker = createMarkerElement({
      sequence_number: 1,
      content: "<div>first</div>",
    });
    const reselectionMarkerBefore = createMarkerElement({
      type: "interaction",
      sequence_number: 2,
      content: "?[%{{region}}A|B]",
      user_input: "A",
    });
    const reselectionMarkerAfter = {
      ...reselectionMarkerBefore,
      readonly: true,
    };
    const laterMarker = createMarkerElement({
      sequence_number: 3,
      content: "<div>later</div>",
    });

    expect(
      resolveNextSlideIndexAfterMarkerAppend({
        previousIndex: 2,
        previousSlideElementList: [
          firstMarker,
          reselectionMarkerBefore,
          laterMarker,
        ],
        nextSlideElementList: [firstMarker, reselectionMarkerAfter],
      })
    ).toBe(1);
  });
});
