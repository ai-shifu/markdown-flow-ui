import { describe, expect, it } from "vitest";
import {
  TYPEWRITER_PACING_FIXTURE_LENGTHS,
  TYPEWRITER_PACING_FIXTURES,
  TYPEWRITER_PACING_LANGUAGE_CODES,
} from "../typewriterPacing.fixtures";
import {
  appendContentAwareTypewriterQueue,
  CONTENT_AWARE_TYPEWRITER_TICK_BUDGET,
  consumeContentAwareTypewriterQueue,
  createContentAwareTypewriterQueue,
  fallbackSegmentTypewriterGraphemes,
  getContentAwareTypewriterCost,
  getContentAwareTypewriterTickCount,
  isContentAwareTypewriterQueueEmpty,
  segmentTypewriterGraphemes,
} from "./typewriter-pacing";

const consumeAll = (value: string) => {
  let queue = createContentAwareTypewriterQueue(value);
  let budget = 0;
  const chunks: string[] = [];

  while (!isContentAwareTypewriterQueueEmpty(queue)) {
    budget += CONTENT_AWARE_TYPEWRITER_TICK_BUDGET;
    const result = consumeContentAwareTypewriterQueue(queue, budget);
    expect(result.chunk).not.toBe("");
    chunks.push(result.chunk);
    queue = result.queue;
    budget = isContentAwareTypewriterQueueEmpty(queue)
      ? 0
      : result.remainingBudget;
  }

  return chunks;
};

describe("content-aware typewriter grapheme segmentation", () => {
  it.each([
    ["a combining accent", "e\u0301", ["e\u0301"]],
    ["Arabic marks", "اَلْ", ["اَ", "لْ"]],
    ["a Thai cluster", "กำ", ["กำ"]],
    ["a variation selector", "✈️", ["✈️"]],
    ["a keycap sequence", "1️⃣", ["1️⃣"]],
    ["an emoji modifier", "👍🏽", ["👍🏽"]],
    ["a regional flag", "🇺🇳", ["🇺🇳"]],
    ["a family ZWJ sequence", "👨‍👩‍👧‍👦", ["👨‍👩‍👧‍👦"]],
    ["a Hangul Jamo syllable", "각", ["각"]],
    ["a precomposed Hangul syllable with Jamo", "각", ["각"]],
    ["an Indic virama conjunct", "क्ष", ["क्ष"]],
    ["a Bengali virama conjunct", "ক্ষ", ["ক্ষ"]],
  ])("keeps %s intact with Intl.Segmenter", (_name, value, expected) => {
    expect(segmentTypewriterGraphemes(value)).toEqual(expected);
  });

  it.each([
    ["e\u0301", ["e\u0301"]],
    ["اَلْ", ["اَ", "لْ"]],
    ["กำ", ["กำ"]],
    ["✈️", ["✈️"]],
    ["1️⃣", ["1️⃣"]],
    ["👍🏽", ["👍🏽"]],
    ["🇺🇳", ["🇺🇳"]],
    ["👨‍👩‍👧‍👦", ["👨‍👩‍👧‍👦"]],
    ["각", ["각"]],
    ["각", ["각"]],
    ["क्ष", ["क्ष"]],
    ["ক্ষ", ["ক্ষ"]],
  ])("keeps %s intact in the fallback", (value, expected) => {
    expect(segmentTypewriterGraphemes(value, null)).toEqual(expected);
    expect(fallbackSegmentTypewriterGraphemes(value)).toEqual(expected);
  });

  it.each([
    ["ᄀᆨ", ["ᄀ", "ᆨ"]],
    ["कष", ["क", "ष"]],
    ["क्A", ["क्", "A"]],
  ])("keeps fallback boundaries in %s", (value, expected) => {
    expect(segmentTypewriterGraphemes(value, null)).toEqual(expected);
  });

  it("repairs an unconsumed grapheme when a stream append completes it", () => {
    const accentQueue = appendContentAwareTypewriterQueue(
      createContentAwareTypewriterQueue("e", null),
      "\u0301",
      null
    );
    const emojiQueue = appendContentAwareTypewriterQueue(
      createContentAwareTypewriterQueue("👍", null),
      "🏽",
      null
    );
    let hangulQueue = createContentAwareTypewriterQueue("ᄀ", null);
    hangulQueue = appendContentAwareTypewriterQueue(hangulQueue, "ᅡ", null);
    hangulQueue = appendContentAwareTypewriterQueue(hangulQueue, "ᆨ", null);
    let indicQueue = createContentAwareTypewriterQueue("क", null);
    indicQueue = appendContentAwareTypewriterQueue(indicQueue, "्", null);
    indicQueue = appendContentAwareTypewriterQueue(indicQueue, "ष", null);
    indicQueue = appendContentAwareTypewriterQueue(indicQueue, "्", null);
    indicQueue = appendContentAwareTypewriterQueue(indicQueue, "म", null);

    expect(accentQueue.tokens.map(({ text }) => text)).toEqual(["e\u0301"]);
    expect(emojiQueue.tokens.map(({ text }) => text)).toEqual(["👍🏽"]);
    expect(hangulQueue.tokens.map(({ text }) => text)).toEqual(["각"]);
    expect(indicQueue.tokens.map(({ text }) => text)).toEqual(["क्ष्म"]);
  });

  it("repairs the final pending grapheme after earlier tokens were consumed", () => {
    const queue = createContentAwareTypewriterQueue("Aᄀ", null);
    const consumed = consumeContentAwareTypewriterQueue(queue, 28);
    const appended = appendContentAwareTypewriterQueue(
      consumed.queue,
      "ᅡᆨ",
      null
    );

    expect(consumed.chunk).toBe("A");
    expect(consumed.queue.head).toBe(1);
    expect(appended.tokens.map(({ text }) => text)).toEqual(["각"]);
  });

  it("repairs a fallback ZWJ sequence split across stream appends", () => {
    let queue = createContentAwareTypewriterQueue("👨‍", null);
    queue = appendContentAwareTypewriterQueue(queue, "👩‍", null);
    queue = appendContentAwareTypewriterQueue(queue, "👧‍👦", null);

    expect(queue.tokens.map(({ text }) => text)).toEqual(["👨‍👩‍👧‍👦"]);
  });
});

describe("content-aware typewriter weights", () => {
  it("uses the calibrated cost for each writing system", () => {
    expect(getContentAwareTypewriterCost("中")).toBe(100);
    expect(getContentAwareTypewriterCost("é")).toBe(28);
    expect(getContentAwareTypewriterCost("عَ")).toBe(34);
    expect(getContentAwareTypewriterCost("กำ")).toBe(42);
    expect(getContentAwareTypewriterCost("Ж")).toBe(35);
    expect(getContentAwareTypewriterCost("7")).toBe(35);
    expect(getContentAwareTypewriterCost("。")).toBe(100);
    expect(getContentAwareTypewriterCost("👍🏽")).toBe(100);
    expect(getContentAwareTypewriterCost(" ")).toBe(0);
  });

  it("keeps plain Chinese at two graphemes per tick", () => {
    expect(consumeAll("天地玄黄宇宙洪荒")).toEqual([
      "天地",
      "玄黄",
      "宇宙",
      "洪荒",
    ]);
    expect(getContentAwareTypewriterTickCount("天地玄黄宇宙洪荒")).toBe(4);
  });

  it("carries fractional budget until the queue is empty", () => {
    const queue = createContentAwareTypewriterQueue("abcdefgh");
    const first = consumeContentAwareTypewriterQueue(queue, 200);
    const second = consumeContentAwareTypewriterQueue(
      first.queue,
      first.remainingBudget + CONTENT_AWARE_TYPEWRITER_TICK_BUDGET
    );

    expect(first.chunk).toBe("abcdefg");
    expect(first.remainingBudget).toBe(4);
    expect(second.chunk).toBe("h");
    expect(isContentAwareTypewriterQueueEmpty(second.queue)).toBe(true);
  });

  it("reveals whitespace with adjacent visible text", () => {
    const chunks = consumeAll("  alpha beta  ");

    expect(chunks.join("")).toBe("  alpha beta  ");
    expect(chunks[0]).toMatch(/^  \S/u);
    expect(chunks.at(-1)).toMatch(/\s$/u);
  });

  it("round-trips mixed prose, URLs, code, and Markdown", () => {
    const content =
      "中文 and français: [docs](https://example.com/a?q=1) `code()` **bold** 👍🏽";
    const chunks = consumeAll(content);

    expect(chunks.join("")).toBe(content);
    expect(chunks.every((chunk) => chunk.length > 0)).toBe(true);
    expect(getContentAwareTypewriterTickCount(content)).toBe(chunks.length);
  });
});

describe("multilingual perceived pacing fixtures", () => {
  it.each(TYPEWRITER_PACING_FIXTURE_LENGTHS)(
    "finishes the %s fixtures within 15%% of Chinese",
    (fixtureLength) => {
      const fixture = TYPEWRITER_PACING_FIXTURES[fixtureLength];
      const chineseTicks = getContentAwareTypewriterTickCount(fixture.zh);

      expect(chineseTicks).toBeGreaterThan(0);

      TYPEWRITER_PACING_LANGUAGE_CODES.forEach((languageCode) => {
        const ticks = getContentAwareTypewriterTickCount(fixture[languageCode]);
        const ratio = ticks / chineseTicks;

        expect(
          ratio,
          `${fixtureLength}/${languageCode}: ${ticks} ticks vs ${chineseTicks} Chinese ticks`
        ).toBeGreaterThanOrEqual(0.85);
        expect(
          ratio,
          `${fixtureLength}/${languageCode}: ${ticks} ticks vs ${chineseTicks} Chinese ticks`
        ).toBeLessThanOrEqual(1.15);
      });
    }
  );
});
