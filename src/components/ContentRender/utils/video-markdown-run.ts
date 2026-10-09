import { unified } from "unified";
import remarkParse from "remark-parse";
import { remarkPlugins } from "./markdown-plugins";
import type { RenderSegment } from "./split-content";

type Range = { start: number; end: number };
type MarkdownNode = {
  type: string;
  children?: MarkdownNode[];
  position?: { start: { offset?: number }; end: { offset?: number } };
};
type Container = Range & { type: string };
export type VideoMarkdownRunPlan = {
  fullSource: string;
  structuralRanges: readonly Range[];
  placeholder: string;
  hasContext: boolean;
  segments: readonly RenderSegment[];
  offsets: readonly number[];
};
const parser = unified().use(remarkParse).use(remarkPlugins);
const containerTypes = new Set(["blockquote", "list", "listItem"]);
const structuralTypes = new Set([
  "list",
  "listItem",
  "table",
  "tableRow",
  "tableCell",
]);
const rangeOf = (node: MarkdownNode): Range | undefined => {
  const start = node.position?.start.offset;
  const end = node.position?.end.offset;
  return start === undefined || end === undefined ? undefined : { start, end };
};
const unusedPlaceholder = (source: string) => {
  for (let code = 0xe000; code <= 0x10ffff; code += 1) {
    if (code >= 0xf900 && code < 0xf0000) code = 0xf0000;
    const character = String.fromCodePoint(code);
    if (!source.includes(character)) return character;
  }
  throw new Error("No unused video projection placeholder is available");
};
export const createVideoMarkdownRunPlan = (
  segments: readonly RenderSegment[]
): VideoMarkdownRunPlan => {
  const offsets: number[] = [];
  const media: Range[] = [];
  let fullSource = "";
  for (const segment of segments) {
    offsets.push(fullSource.length);
    if (segment.type === "markdown" && segment.immediate) {
      media.push({
        start: fullSource.length,
        end: fullSource.length + segment.value.length,
      });
    }
    fullSource += segment.value;
  }
  const containers = new Map<MarkdownNode, Container>();
  const structuralRanges: Range[] = [];
  let hasContext = false;
  const containsMedia = (range: Range) =>
    media.some(({ start }) => start >= range.start && start < range.end);
  const addContainer = (node: MarkdownNode) => {
    const range = rangeOf(node);
    if (range) containers.set(node, { ...range, type: node.type });
  };
  const preserveGaps = (node: MarkdownNode) => {
    const range = rangeOf(node);
    if (!range || !node.children?.length) return;
    let cursor = range.start;
    for (const child of node.children) {
      const childRange = rangeOf(child);
      if (!childRange) continue;
      if (cursor < childRange.start)
        structuralRanges.push({ start: cursor, end: childRange.start });
      cursor = childRange.end;
    }
    if (cursor < range.end)
      structuralRanges.push({ start: cursor, end: range.end });
  };
  const preserveDescendants = (node: MarkdownNode) => {
    if (structuralTypes.has(node.type)) {
      preserveGaps(node);
      if (containerTypes.has(node.type)) addContainer(node);
    }
    node.children?.forEach(preserveDescendants);
  };
  const walk = (node: MarkdownNode) => {
    const range = rangeOf(node);
    if (range && containsMedia(range)) {
      if (node.children?.length && node.type !== "root") {
        hasContext = true;
        // Raw gaps retain ancestor syntax without exposing untyped child content.
        const lineStart = fullSource.lastIndexOf("\n", range.start - 1) + 1;
        if (/^[ \t]*$/.test(fullSource.slice(lineStart, range.start)))
          structuralRanges.push({ start: lineStart, end: range.start });
        preserveGaps(node);
      }
      if (containerTypes.has(node.type)) {
        addContainer(node);
      }
      if (node.type === "list" || node.type === "table")
        preserveDescendants(node);
    }
    node.children?.forEach(walk);
  };
  walk(parser.parse(fullSource));

  const records = [...containers.values()];
  let lineStart = 0;
  while (lineStart < fullSource.length) {
    const newline = fullSource.indexOf("\n", lineStart);
    const lineEnd = newline === -1 ? fullSource.length : newline;
    const active = records.filter(
      ({ start, end }) => start < lineEnd && end > lineStart
    );
    let remainingQuotes = active.filter(
      ({ type }) => type === "blockquote"
    ).length;
    let cursor = lineStart;
    while (active.length && cursor < lineEnd) {
      const whitespace = /^[ \t]+/.exec(fullSource.slice(cursor, lineEnd));
      if (whitespace) {
        structuralRanges.push({
          start: cursor,
          end: cursor + whitespace[0].length,
        });
        cursor += whitespace[0].length;
      }
      if (remainingQuotes && fullSource[cursor] === ">") {
        structuralRanges.push({ start: cursor, end: cursor + 1 });
        cursor += 1;
        remainingQuotes -= 1;
      } else if (
        active.some(
          ({ type, start }) => type === "listItem" && start === cursor
        )
      ) {
        const marker = /^(?:[-+*]|\d+[.)])(?:[ \t]+|$)/.exec(
          fullSource.slice(cursor, lineEnd)
        );
        if (!marker) break;
        structuralRanges.push({
          start: cursor,
          end: cursor + marker[0].length,
        });
        cursor += marker[0].length;
      } else break;
    }
    lineStart = lineEnd + 1;
  }
  structuralRanges.sort((left, right) => left.start - right.start);
  return {
    fullSource,
    structuralRanges,
    placeholder: unusedPlaceholder(fullSource),
    hasContext,
    segments,
    offsets,
  };
};

export const projectVideoMarkdownRun = (
  plan: VideoMarkdownRunPlan,
  renderedSegments: readonly RenderSegment[],
  safeRenderedValues?: readonly string[]
): string => {
  let output = "";
  let rangeIndex = 0;
  plan.segments.forEach((segment, index) => {
    const rendered = renderedSegments[index];
    if (segment.type === "markdown" && segment.immediate) {
      if (
        !segment.pending &&
        !(rendered?.type === "markdown" && rendered.pending)
      )
        output += segment.value;
      return;
    }
    const visible = Math.min(rendered?.value.length ?? 0, segment.value.length);
    output += safeRenderedValues?.[index] ?? rendered?.value ?? "";
    for (let local = visible; local < segment.value.length; local += 1) {
      const position = plan.offsets[index] + local;
      while (plan.structuralRanges[rangeIndex]?.end <= position)
        rangeIndex += 1;
      const range = plan.structuralRanges[rangeIndex];
      const character = segment.value[local];
      output +=
        character === "\n" ||
        character === "\r" ||
        (range && range.start <= position)
          ? character
          : plan.placeholder;
    }
  });
  return output;
};
