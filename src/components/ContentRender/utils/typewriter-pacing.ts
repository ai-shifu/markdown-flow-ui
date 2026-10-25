import { splitGraphemes } from "unicode-segmenter/grapheme";

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
  trailingGrapheme: string;
}

export interface ContentAwareTypewriterAppend {
  queue: ContentAwareTypewriterQueue;
  immediateChunk: string;
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

const isEmojiModifier = (codePoint: string) =>
  isCodePointInRange(codePoint, 0x1f3fb, 0x1f3ff);
export const fallbackSegmentTypewriterGraphemes = (value: string) =>
  Array.from(splitGraphemes(value));

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

export const getTrailingTypewriterGrapheme = (
  value: string,
  segmenter?: TypewriterGraphemeSegmenter | null
) => {
  const graphemes = segmentTypewriterGraphemes(value, segmenter);
  return graphemes[graphemes.length - 1] ?? "";
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
  trailingGrapheme: "",
});

export const isContentAwareTypewriterQueueEmpty = (
  queue: ContentAwareTypewriterQueue
) => queue.head >= queue.tokens.length;

export const appendContentAwareTypewriterQueue = (
  queue: ContentAwareTypewriterQueue,
  suffix: string,
  segmenter?: TypewriterGraphemeSegmenter | null
): ContentAwareTypewriterAppend => {
  if (!suffix) {
    return { queue, immediateChunk: "" };
  }

  const remainingTokens = queue.tokens.slice(queue.head);
  if (remainingTokens.length === 0) {
    const repairedTail = queue.trailingGrapheme
      ? tokenizeContentAwareTypewriterText(
          `${queue.trailingGrapheme}${suffix}`,
          segmenter
        )
      : [];
    const firstRepairedToken = repairedTail[0];

    if (
      firstRepairedToken?.text.startsWith(queue.trailingGrapheme) &&
      firstRepairedToken.text.length > queue.trailingGrapheme.length
    ) {
      return {
        queue: {
          tokens: repairedTail.slice(1),
          head: 0,
          trailingGrapheme: firstRepairedToken.text,
        },
        immediateChunk: firstRepairedToken.text.slice(
          queue.trailingGrapheme.length
        ),
      };
    }

    return {
      queue: {
        ...createContentAwareTypewriterQueue(suffix, segmenter),
        trailingGrapheme: queue.trailingGrapheme,
      },
      immediateChunk: "",
    };
  }

  const lastToken = remainingTokens[remainingTokens.length - 1];
  const repairedTail = tokenizeContentAwareTypewriterText(
    `${lastToken.text}${suffix}`,
    segmenter
  );

  return {
    queue: {
      tokens: [...remainingTokens.slice(0, -1), ...repairedTail],
      head: 0,
      trailingGrapheme: queue.trailingGrapheme,
    },
    immediateChunk: "",
  };
};

export const consumeContentAwareTypewriterQueue = (
  queue: ContentAwareTypewriterQueue,
  availableBudget: number
): ContentAwareTypewriterConsumption => {
  let head = queue.head;
  let remainingBudget = Math.max(0, availableBudget);
  let chunk = "";
  let trailingGrapheme = queue.trailingGrapheme;

  while (head < queue.tokens.length) {
    const token = queue.tokens[head];
    if (token.cost > remainingBudget) {
      break;
    }

    chunk += token.text;
    remainingBudget -= token.cost;
    head += 1;
    trailingGrapheme = token.text;
  }

  return {
    chunk,
    queue: {
      tokens: queue.tokens,
      head,
      trailingGrapheme,
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
