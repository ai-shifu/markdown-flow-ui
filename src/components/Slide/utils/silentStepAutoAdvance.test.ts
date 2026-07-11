import { describe, expect, it } from "vitest";

import type { Element } from "../types";
import { DEFAULT_IMAGE_ONLY_AUTO_ADVANCE_DELAY_MS } from "../constants";
import {
  resolveSilentStepAutoAdvanceDelay,
  shouldUseImageOnlySilentStepAutoAdvanceDelay,
} from "./silentStepAutoAdvance";

const marker = (overrides: Partial<Element> = {}): Element => ({
  content: "marker",
  type: "text",
  is_marker: true,
  is_renderable: true,
  ...overrides,
});

const imageElement = (type: Element["type"] = "img"): Element => ({
  content: "image",
  type,
  is_renderable: true,
  is_speakable: false,
});

describe("shouldUseImageOnlySilentStepAutoAdvanceDelay", () => {
  it("uses the image-only delay for silent image steps", () => {
    expect(
      shouldUseImageOnlySilentStepAutoAdvanceDelay({
        currentElementList: [marker(), imageElement("img")],
        currentStepHasSpeakableElement: false,
      })
    ).toBe(true);
  });

  it("supports markdown image and svg steps", () => {
    expect(
      shouldUseImageOnlySilentStepAutoAdvanceDelay({
        currentElementList: [
          marker(),
          imageElement("md_img"),
          imageElement("svg"),
        ],
        currentStepHasSpeakableElement: false,
      })
    ).toBe(true);
  });

  it("does not use the image-only delay when text content is present", () => {
    expect(
      shouldUseImageOnlySilentStepAutoAdvanceDelay({
        currentElementList: [
          marker(),
          imageElement("img"),
          {
            content: "text",
            type: "text",
            is_renderable: true,
            is_speakable: false,
          },
        ],
        currentStepHasSpeakableElement: false,
      })
    ).toBe(false);
  });

  it("does not use the image-only delay when the step still has speech", () => {
    expect(
      shouldUseImageOnlySilentStepAutoAdvanceDelay({
        currentElementList: [marker(), imageElement("img")],
        currentStepHasSpeakableElement: true,
      })
    ).toBe(false);
  });

  it("does not use the image-only delay for interaction-gated silent steps", () => {
    expect(
      shouldUseImageOnlySilentStepAutoAdvanceDelay({
        currentElementList: [marker(), imageElement("img")],
        currentStepHasSpeakableElement: false,
        currentInteractionElement: {
          content: "interaction",
          type: "interaction",
          is_renderable: true,
        },
      })
    ).toBe(false);
  });
});

describe("resolveSilentStepAutoAdvanceDelay", () => {
  it("returns 5s for silent image-only steps", () => {
    expect(
      resolveSilentStepAutoAdvanceDelay({
        currentElementList: [marker(), imageElement("img")],
        currentStepHasSpeakableElement: false,
        markerAutoAdvanceDelay: 2000,
      })
    ).toBe(DEFAULT_IMAGE_ONLY_AUTO_ADVANCE_DELAY_MS);
  });

  it("falls back to the configured marker delay for other silent steps", () => {
    expect(
      resolveSilentStepAutoAdvanceDelay({
        currentElementList: [marker()],
        currentStepHasSpeakableElement: false,
        markerAutoAdvanceDelay: 2000,
      })
    ).toBe(2000);
  });
});
