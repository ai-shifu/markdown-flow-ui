export const CONTENT_AWARE_TYPEWRITER_TICK_BUDGET = 200;

const TYPEWRITER_GRAPHEME_COST = {
  han: 100,
  latin: 28,
  arabic: 34,
  thai: 42,
  otherLetterOrNumber: 35,
  punctuationOrEmoji: 100,
  whitespace: 0,
} as const;

const ZERO_WIDTH_JOINER = "\u200d";
const CARRIAGE_RETURN = "\r";
const LINE_FEED = "\n";

const GRAPHEME_EXTEND_PATTERN = /\p{Grapheme_Extend}/u;
const MARK_PATTERN = /\p{Mark}/u;
const SPACING_MARK_PATTERN = /\p{Spacing_Mark}/u;
const WHITESPACE_PATTERN = /^\s+$/u;
const HAN_PATTERN = /\p{Script_Extensions=Han}/u;
const LATIN_PATTERN = /\p{Script_Extensions=Latin}/u;
const ARABIC_PATTERN = /\p{Script_Extensions=Arabic}/u;
const THAI_PATTERN = /\p{Script_Extensions=Thai}/u;
const LETTER_OR_NUMBER_PATTERN = /[\p{Letter}\p{Number}]/u;
const PUNCTUATION_OR_SYMBOL_PATTERN = /[\p{Punctuation}\p{Symbol}]/u;
const EXTENDED_PICTOGRAPHIC_PATTERN = /\p{Extended_Pictographic}/u;

export interface TypewriterGraphemeSegmenter {
  segment(input: string): Iterable<{ segment: string }>;
}

export interface ContentAwareTypewriterToken {
  text: string;
  cost: number;
}

export interface ContentAwareTypewriterQueue {
  tokens: readonly ContentAwareTypewriterToken[];
  head: number;
}

export interface ContentAwareTypewriterConsumption {
  chunk: string;
  queue: ContentAwareTypewriterQueue;
  remainingBudget: number;
}

let cachedIntlSegmenter: TypewriterGraphemeSegmenter | null | undefined;

const getIntlSegmenter = (): TypewriterGraphemeSegmenter | null => {
  if (cachedIntlSegmenter !== undefined) {
    return cachedIntlSegmenter;
  }

  const Segmenter =
    typeof Intl === "undefined"
      ? undefined
      : (Intl as typeof Intl & { Segmenter?: typeof Intl.Segmenter }).Segmenter;

  cachedIntlSegmenter = Segmenter
    ? new Segmenter(undefined, { granularity: "grapheme" })
    : null;
  return cachedIntlSegmenter;
};

const isCodePointInRange = (codePoint: string, start: number, end: number) => {
  const value = codePoint.codePointAt(0);
  return value !== undefined && value >= start && value <= end;
};

const isRegionalIndicator = (codePoint: string) =>
  isCodePointInRange(codePoint, 0x1f1e6, 0x1f1ff);

const isVariationSelector = (codePoint: string) =>
  isCodePointInRange(codePoint, 0xfe00, 0xfe0f) ||
  isCodePointInRange(codePoint, 0xe0100, 0xe01ef);

const isEmojiModifier = (codePoint: string) =>
  isCodePointInRange(codePoint, 0x1f3fb, 0x1f3ff);

const isEmojiTag = (codePoint: string) =>
  isCodePointInRange(codePoint, 0xe0020, 0xe007f);

const isFallbackExtend = (codePoint: string) =>
  GRAPHEME_EXTEND_PATTERN.test(codePoint) ||
  MARK_PATTERN.test(codePoint) ||
  SPACING_MARK_PATTERN.test(codePoint) ||
  isVariationSelector(codePoint) ||
  isEmojiModifier(codePoint) ||
  isEmojiTag(codePoint) ||
  codePoint === "\u20e3" ||
  codePoint === "\u0e33";

export const fallbackSegmentTypewriterGraphemes = (value: string) => {
  const codePoints = Array.from(value);
  const graphemes: string[] = [];

  for (let index = 0; index < codePoints.length; index += 1) {
    let grapheme = codePoints[index];

    if (grapheme === CARRIAGE_RETURN && codePoints[index + 1] === LINE_FEED) {
      grapheme += codePoints[index + 1];
      index += 1;
      graphemes.push(grapheme);
      continue;
    }

    if (
      isRegionalIndicator(grapheme) &&
      isRegionalIndicator(codePoints[index + 1] || "")
    ) {
      grapheme += codePoints[index + 1];
      index += 1;
      graphemes.push(grapheme);
      continue;
    }

    while (index + 1 < codePoints.length) {
      const nextCodePoint = codePoints[index + 1];

      if (isFallbackExtend(nextCodePoint)) {
        grapheme += nextCodePoint;
        index += 1;
        continue;
      }

      if (nextCodePoint === ZERO_WIDTH_JOINER) {
        grapheme += nextCodePoint;
        index += 1;

        if (index + 1 < codePoints.length) {
          grapheme += codePoints[index + 1];
          index += 1;
        }

        continue;
      }

      break;
    }

    graphemes.push(grapheme);
  }

  return graphemes;
};

export const segmentTypewriterGraphemes = (
  value: string,
  segmenter?: TypewriterGraphemeSegmenter | null
) => {
  const resolvedSegmenter =
    segmenter === undefined ? getIntlSegmenter() : segmenter;

  if (!resolvedSegmenter) {
    return fallbackSegmentTypewriterGraphemes(value);
  }

  return Array.from(resolvedSegmenter.segment(value), ({ segment }) => segment);
};

const isEmojiGrapheme = (grapheme: string) =>
  EXTENDED_PICTOGRAPHIC_PATTERN.test(grapheme) ||
  Array.from(grapheme).some(
    (codePoint) =>
      isRegionalIndicator(codePoint) ||
      isEmojiModifier(codePoint) ||
      codePoint === "\u20e3"
  );

export const getContentAwareTypewriterCost = (grapheme: string) => {
  if (WHITESPACE_PATTERN.test(grapheme)) {
    return TYPEWRITER_GRAPHEME_COST.whitespace;
  }

  if (
    isEmojiGrapheme(grapheme) ||
    PUNCTUATION_OR_SYMBOL_PATTERN.test(grapheme)
  ) {
    return TYPEWRITER_GRAPHEME_COST.punctuationOrEmoji;
  }

  if (HAN_PATTERN.test(grapheme)) {
    return TYPEWRITER_GRAPHEME_COST.han;
  }

  if (LATIN_PATTERN.test(grapheme)) {
    return TYPEWRITER_GRAPHEME_COST.latin;
  }

  if (ARABIC_PATTERN.test(grapheme)) {
    return TYPEWRITER_GRAPHEME_COST.arabic;
  }

  if (THAI_PATTERN.test(grapheme)) {
    return TYPEWRITER_GRAPHEME_COST.thai;
  }

  if (LETTER_OR_NUMBER_PATTERN.test(grapheme)) {
    return TYPEWRITER_GRAPHEME_COST.otherLetterOrNumber;
  }

  return TYPEWRITER_GRAPHEME_COST.punctuationOrEmoji;
};

const tokenizeContentAwareTypewriterText = (
  value: string,
  segmenter?: TypewriterGraphemeSegmenter | null
) =>
  segmentTypewriterGraphemes(value, segmenter).map((text) => ({
    text,
    cost: getContentAwareTypewriterCost(text),
  }));

export const createContentAwareTypewriterQueue = (
  value: string,
  segmenter?: TypewriterGraphemeSegmenter | null
): ContentAwareTypewriterQueue => ({
  tokens: tokenizeContentAwareTypewriterText(value, segmenter),
  head: 0,
});

export const isContentAwareTypewriterQueueEmpty = (
  queue: ContentAwareTypewriterQueue
) => queue.head >= queue.tokens.length;

export const appendContentAwareTypewriterQueue = (
  queue: ContentAwareTypewriterQueue,
  suffix: string,
  segmenter?: TypewriterGraphemeSegmenter | null
): ContentAwareTypewriterQueue => {
  if (!suffix) {
    return queue;
  }

  const remainingTokens = queue.tokens.slice(queue.head);
  if (remainingTokens.length === 0) {
    return createContentAwareTypewriterQueue(suffix, segmenter);
  }

  const lastToken = remainingTokens[remainingTokens.length - 1];
  const repairedTail = tokenizeContentAwareTypewriterText(
    `${lastToken.text}${suffix}`,
    segmenter
  );

  return {
    tokens: [...remainingTokens.slice(0, -1), ...repairedTail],
    head: 0,
  };
};

export const consumeContentAwareTypewriterQueue = (
  queue: ContentAwareTypewriterQueue,
  availableBudget: number
): ContentAwareTypewriterConsumption => {
  let head = queue.head;
  let remainingBudget = Math.max(0, availableBudget);
  let chunk = "";

  while (head < queue.tokens.length) {
    const token = queue.tokens[head];
    if (token.cost > remainingBudget) {
      break;
    }

    chunk += token.text;
    remainingBudget -= token.cost;
    head += 1;
  }

  return {
    chunk,
    queue: {
      tokens: queue.tokens,
      head,
    },
    remainingBudget,
  };
};

export const getContentAwareTypewriterTickCount = (
  value: string,
  segmenter?: TypewriterGraphemeSegmenter | null
) => {
  let queue = createContentAwareTypewriterQueue(value, segmenter);
  let budget = 0;
  let ticks = 0;

  while (!isContentAwareTypewriterQueueEmpty(queue)) {
    budget += CONTENT_AWARE_TYPEWRITER_TICK_BUDGET;
    const result = consumeContentAwareTypewriterQueue(queue, budget);

    if (!result.chunk) {
      throw new Error("Typewriter pacing could not consume the next grapheme");
    }

    queue = result.queue;
    budget = result.remainingBudget;
    ticks += 1;
  }

  return ticks;
};
