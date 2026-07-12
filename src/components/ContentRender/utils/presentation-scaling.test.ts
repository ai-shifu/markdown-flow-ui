import { describe, expect, it } from "vitest";

import {
  fitPresentationFontSize,
  PRESENTATION_DEFAULT_FONT_SIZE_PX,
  PRESENTATION_MIN_FONT_SIZE_PX,
  presentationContentFits,
  resolvePresentationBaseFontSize,
  resolvePresentationCompressionRatio,
} from "./presentation-scaling";

describe("presentation scaling", () => {
  it("uses the same viewport-driven base font-size as HTML slides", () => {
    expect(
      resolvePresentationBaseFontSize({ width: 1920, height: 1080 })
    ).toBeCloseTo(32.4);
    expect(
      resolvePresentationBaseFontSize({ width: 960, height: 540 })
    ).toBeCloseTo(16.2);
    expect(resolvePresentationBaseFontSize({ width: 360, height: 640 })).toBe(
      12
    );
  });

  it("returns a stable default for unusable viewport dimensions", () => {
    expect(resolvePresentationBaseFontSize({ width: 0, height: 0 })).toBe(
      PRESENTATION_DEFAULT_FONT_SIZE_PX
    );
    expect(
      resolvePresentationBaseFontSize({ width: Number.NaN, height: 600 })
    ).toBe(PRESENTATION_DEFAULT_FONT_SIZE_PX);
  });

  it("treats the shared overflow tolerance as fitting", () => {
    expect(
      presentationContentFits(
        { width: 1000, height: 600 },
        { width: 1004, height: 604 }
      )
    ).toBe(true);
    expect(
      presentationContentFits(
        { width: 1000, height: 600 },
        { width: 1005, height: 604 }
      )
    ).toBe(false);
  });

  it("compresses by the tighter overflowing dimension", () => {
    expect(
      resolvePresentationCompressionRatio({
        baseFontSize: 32,
        viewport: { width: 1000, height: 600 },
        content: { width: 2000, height: 900 },
      })
    ).toBe(0.5);
  });

  it("never compresses below the shared minimum font-size", () => {
    const baseFontSize = 32;
    const ratio = resolvePresentationCompressionRatio({
      baseFontSize,
      viewport: { width: 1000, height: 600 },
      content: { width: 10000, height: 10000 },
    });

    expect(baseFontSize * ratio).toBe(PRESENTATION_MIN_FONT_SIZE_PX);
  });

  it("iterates from the base size and recovers after dense content is replaced", () => {
    const viewport = { width: 1920, height: 1080 };
    const denseFontSize = fitPresentationFontSize({
      viewport,
      measure: (fontSize) => ({
        width: 1600,
        height: fontSize * 50,
      }),
    });
    const sparseFontSize = fitPresentationFontSize({
      viewport,
      measure: (fontSize) => ({
        width: 800,
        height: fontSize * 10,
      }),
    });

    expect(denseFontSize).toBeCloseTo(21.6);
    expect(sparseFontSize).toBeCloseTo(32.4);
  });
});
