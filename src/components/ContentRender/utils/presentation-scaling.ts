export const PRESENTATION_DEFAULT_FONT_SIZE_PX = 16;
export const PRESENTATION_MIN_BASE_FONT_SIZE_PX = 12;
export const PRESENTATION_MIN_FONT_SIZE_PX = 8;
export const PRESENTATION_WIDTH_FONT_DIVISOR = 48;
export const PRESENTATION_HEIGHT_FONT_RATIO = 0.03;
export const PRESENTATION_OVERFLOW_TOLERANCE_PX = 4;

const MAX_FIT_ITERATIONS = 8;
const MIN_FONT_SIZE_DELTA_PX = 0.05;

export interface PresentationSize {
  height: number;
  width: number;
}

export interface FitPresentationFontSizeOptions {
  measure: (fontSize: number) => PresentationSize;
  viewport: PresentationSize;
}

const isPositiveFinite = (value: number) => Number.isFinite(value) && value > 0;

/**
 * Matches the viewport-driven base font-size used by HTML presentation slides.
 */
export const resolvePresentationBaseFontSize = ({
  height,
  width,
}: PresentationSize) => {
  if (!isPositiveFinite(width) || !isPositiveFinite(height)) {
    return PRESENTATION_DEFAULT_FONT_SIZE_PX;
  }

  return Math.max(
    PRESENTATION_MIN_FONT_SIZE_PX,
    Math.min(
      Math.max(
        PRESENTATION_MIN_BASE_FONT_SIZE_PX,
        width / PRESENTATION_WIDTH_FONT_DIVISOR
      ),
      height * PRESENTATION_HEIGHT_FONT_RATIO
    )
  );
};

export const presentationContentFits = (
  viewport: PresentationSize,
  content: PresentationSize
) =>
  content.height <= viewport.height + PRESENTATION_OVERFLOW_TOLERANCE_PX &&
  content.width <= viewport.width + PRESENTATION_OVERFLOW_TOLERANCE_PX;

export interface ResolvePresentationCompressionRatioOptions {
  baseFontSize: number;
  content: PresentationSize;
  currentRatio?: number;
  viewport: PresentationSize;
}

/**
 * Returns the next cumulative compression ratio for content that overflows.
 */
export const resolvePresentationCompressionRatio = ({
  baseFontSize,
  content,
  currentRatio = 1,
  viewport,
}: ResolvePresentationCompressionRatioOptions) => {
  if (
    !isPositiveFinite(baseFontSize) ||
    !isPositiveFinite(viewport.width) ||
    !isPositiveFinite(viewport.height) ||
    !isPositiveFinite(content.width) ||
    !isPositiveFinite(content.height)
  ) {
    return 1;
  }

  const heightRatio =
    content.height > viewport.height + PRESENTATION_OVERFLOW_TOLERANCE_PX
      ? viewport.height / content.height
      : 1;
  const widthRatio =
    content.width > viewport.width + PRESENTATION_OVERFLOW_TOLERANCE_PX
      ? viewport.width / content.width
      : 1;
  const minimumRatio = Math.min(
    1,
    PRESENTATION_MIN_FONT_SIZE_PX / baseFontSize
  );

  return Math.max(
    minimumRatio,
    Math.min(1, currentRatio * Math.min(heightRatio, widthRatio))
  );
};

/**
 * Applies the presentation font-size through `measure` and iteratively shrinks
 * it until the content fits or reaches the shared 8px lower bound.
 */
export const fitPresentationFontSize = ({
  measure,
  viewport,
}: FitPresentationFontSizeOptions) => {
  const baseFontSize = resolvePresentationBaseFontSize(viewport);
  let compressionRatio = 1;
  let fontSize = baseFontSize;

  for (let iteration = 0; iteration < MAX_FIT_ITERATIONS; iteration += 1) {
    const content = measure(fontSize);

    if (presentationContentFits(viewport, content)) {
      return fontSize;
    }

    const nextCompressionRatio = resolvePresentationCompressionRatio({
      baseFontSize,
      content,
      currentRatio: compressionRatio,
      viewport,
    });
    const nextFontSize = Math.max(
      PRESENTATION_MIN_FONT_SIZE_PX,
      baseFontSize * nextCompressionRatio
    );

    if (Math.abs(nextFontSize - fontSize) < MIN_FONT_SIZE_DELTA_PX) {
      return nextFontSize;
    }

    compressionRatio = nextCompressionRatio;
    fontSize = nextFontSize;
  }

  return fontSize;
};
