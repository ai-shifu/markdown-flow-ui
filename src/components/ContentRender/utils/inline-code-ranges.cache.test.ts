import { beforeEach, describe, expect, it, vi } from "vitest";

const parseCalls = vi.hoisted(() => vi.fn());

vi.mock("unified", async (importOriginal) => {
  const actual = await importOriginal<typeof import("unified")>();
  return {
    ...actual,
    unified: (...args: Parameters<typeof actual.unified>) => {
      const processor = actual.unified(...args);
      const parse = processor.parse.bind(processor);
      processor.parse = (file) => {
        parseCalls(file);
        return parse(file);
      };
      return processor;
    },
  };
});

beforeEach(() => {
  vi.resetModules();
  parseCalls.mockClear();
});

const loadRanges = () => import("./inline-code-ranges");
const sourceFor = (index: number, padding = 0) =>
  `Use \`value-${index}\`. ${"x".repeat(padding)}`;

describe("bounded Markdown code range cache", () => {
  it("shares one parse across inline and block range consumers", async () => {
    const {
      getInlineCodeRanges,
      getMarkdownCodeRanges,
      getMarkdownLiteralRanges,
    } = await loadRanges();
    const raw = "Use `value`.\n\n~~~html\n<div>Code</div>\n~~~";
    const inline = getInlineCodeRanges(raw);
    const markdown = getMarkdownCodeRanges(raw);

    expect(inline).toEqual([{ start: 4, end: 11 }]);
    expect(markdown).toEqual([
      { start: 4, end: 11 },
      { start: raw.indexOf("~~~"), end: raw.length },
    ]);
    expect(getMarkdownLiteralRanges(raw)).toEqual(markdown);
    expect(parseCalls).toHaveBeenCalledTimes(1);
  });

  it("reuses an unchanged full source across repeated rendering ticks", async () => {
    const { getInlineCodeRanges, getMarkdownCodeRanges } = await loadRanges();
    const raw = sourceFor(0);
    for (let tick = 0; tick < 50; tick += 1) {
      getInlineCodeRanges(raw);
      getMarkdownCodeRanges([raw].join(""));
    }
    expect(parseCalls).toHaveBeenCalledTimes(1);
  });

  it("reparses an appended snapshot when a closing delimiter changes its grammar", async () => {
    const { getInlineCodeRanges } = await loadRanges();
    const initial = "Use `<div>Example</div>";
    expect(getInlineCodeRanges(initial)).toEqual([]);
    expect(getInlineCodeRanges(`${initial}\``)).toEqual([
      { start: 4, end: initial.length + 1 },
    ]);
    expect(getInlineCodeRanges(initial)).toEqual([]);
    expect(parseCalls).toHaveBeenCalledTimes(2);
  });

  it("does not reuse a same-length source after its grammar is rewritten", async () => {
    const { getInlineCodeRanges } = await loadRanges();
    expect(getInlineCodeRanges("`x`")).toEqual([{ start: 0, end: 3 }]);
    expect(getInlineCodeRanges("`x ")).toEqual([]);
    expect(parseCalls).toHaveBeenCalledTimes(2);
  });

  it("keeps original offsets separate for LF and CRLF snapshots", async () => {
    const { getInlineCodeRanges } = await loadRanges();
    for (const newline of ["\n", "\r\n"]) {
      const prefix = `Intro${newline}`;
      const raw = `${prefix}\`value\``;
      expect(getInlineCodeRanges(raw)).toEqual([
        { start: prefix.length, end: raw.length },
      ]);
    }
    expect(parseCalls).toHaveBeenCalledTimes(2);
  });

  it("evicts the oldest source when the entry limit is reached", async () => {
    const { getInlineCodeRanges } = await loadRanges();
    for (let index = 0; index < 17; index += 1) {
      getInlineCodeRanges(sourceFor(index));
    }
    expect(parseCalls).toHaveBeenCalledTimes(17);
    getInlineCodeRanges(sourceFor(0));
    expect(parseCalls).toHaveBeenCalledTimes(18);
  });

  it("promotes cache hits before selecting the least recently used source", async () => {
    const { getInlineCodeRanges } = await loadRanges();
    for (let index = 0; index < 16; index += 1) {
      getInlineCodeRanges(sourceFor(index));
    }
    getInlineCodeRanges(sourceFor(0));
    getInlineCodeRanges(sourceFor(16));
    getInlineCodeRanges(sourceFor(0));
    expect(parseCalls).toHaveBeenCalledTimes(17);
    getInlineCodeRanges(sourceFor(1));
    expect(parseCalls).toHaveBeenCalledTimes(18);
  });

  it("enforces the total source character limit before the entry limit", async () => {
    const { getInlineCodeRanges } = await loadRanges();
    const sources = [0, 1, 2].map((index) => sourceFor(index, 110 * 1024));
    sources.forEach(getInlineCodeRanges);
    getInlineCodeRanges(sources[1]);
    getInlineCodeRanges(sources[2]);
    expect(parseCalls).toHaveBeenCalledTimes(3);
    getInlineCodeRanges(sources[0]);
    expect(parseCalls).toHaveBeenCalledTimes(4);
  });

  it("does not retain an oversized source or evict existing small sources for it", async () => {
    const { getInlineCodeRanges } = await loadRanges();
    const small = sourceFor(0);
    const oversized = sourceFor(1, 256 * 1024);
    getInlineCodeRanges(small);
    getInlineCodeRanges(oversized);
    getInlineCodeRanges(oversized);
    getInlineCodeRanges(small);
    expect(parseCalls).toHaveBeenCalledTimes(3);
  });

  it("prevents callers from mutating shared source positions", async () => {
    const { getInlineCodeRanges, getMarkdownCodeRanges } = await loadRanges();
    const ranges = getInlineCodeRanges("`value`");
    expect(Reflect.set(ranges[0], "start", 99)).toBe(false);
    expect(Reflect.set(ranges, "0", { start: 99, end: 100 })).toBe(false);
    expect(getMarkdownCodeRanges("`value`")).toEqual([{ start: 0, end: 7 }]);
    expect(parseCalls).toHaveBeenCalledTimes(1);
  });
});
