import type { Element, Nodes, Root } from "hast";
import type { Root as MarkdownRoot } from "mdast";
import { decodeString } from "micromark-util-decode-string";
import {
  getMarkdownSourceAnalysis,
  type MarkdownSourceAnalysis,
  type MarkdownSourceTree,
} from "./inline-code-ranges";
import type { RenderSegment } from "./split-content";
import {
  readHtmlMarkup,
  isHtmlRawTextTag,
  findStreamingHtmlElementEnd,
} from "./html-block-end";

type Range = { start: number; end: number };
type SourceValue = Range & { value: string; type: string };
type Visibility = {
  ends?: number[];
  range?: Range;
  atomic?: boolean;
  svg?: boolean;
  active?: boolean;
  immediate?: boolean;
  svgSource?: string;
};
export type VideoMarkdownRunPlan = {
  fullSource: string;
  segments: readonly RenderSegment[];
  offsets: readonly number[];
  immediateOffsets: readonly number[];
  sourceTree: MarkdownSourceTree;
  incompleteSvg?: Range;
  tree?: Root;
  visibility: WeakMap<Nodes, Visibility>;
};
declare module "hast" {
  interface ElementData {
    contentRenderVisibility?: Visibility;
  }
}
const stateKey = "contentRenderVisibility";
const firstAtOrAfter = (values: readonly number[], target: number) => {
  let low = 0;
  let high = values.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (values[middle] < target) low = middle + 1;
    else high = middle;
  }
  return low;
};
const segmentAt = (plan: VideoMarkdownRunPlan, position: number) =>
  Math.max(0, firstAtOrAfter(plan.offsets, position + 1) - 1);
const rangeOf = (node: { position?: Nodes["position"] }): Range | undefined => {
  const start = node.position?.start?.offset;
  const end = node.position?.end?.offset;
  return start === undefined || end === undefined ? undefined : { start, end };
};
export const getVideoMarkdownNodeState = (
  node: Element
): Visibility | undefined => node.data?.[stateKey] as Visibility | undefined;

const incompleteSvgRange = (raw: string, excluded: readonly Range[]) => {
  let position = 0;
  let rangeIndex = 0;
  while (position < raw.length) {
    const start = raw.indexOf("<", position);
    if (start === -1) break;
    while (excluded[rangeIndex]?.end <= start) rangeIndex += 1;
    if (excluded[rangeIndex]?.start <= start) {
      position = excluded[rangeIndex].end;
      continue;
    }
    let backslashes = 0;
    for (let index = start - 1; index >= 0 && raw[index] === "\\"; index -= 1)
      backslashes += 1;
    if (backslashes % 2) {
      position = start + 1;
      continue;
    }
    const markup = readHtmlMarkup(raw, start);
    if (markup.kind === "incomplete")
      return /^<svg(?=[\s/>]|$)/i.test(raw.slice(start))
        ? { start, end: raw.length }
        : undefined;
    position =
      markup.kind === "tag" &&
      !markup.closing &&
      !markup.selfClosing &&
      isHtmlRawTextTag(markup.name)
        ? findStreamingHtmlElementEnd(raw, start)
        : markup.kind === "invalid"
          ? start + 1
          : markup.end;
  }
};

/** A run is parsed once per received snapshot; ticks never parse Markdown. */
export const createVideoMarkdownRunPlan = (
  segments: readonly RenderSegment[],
  analysis?: MarkdownSourceAnalysis
): VideoMarkdownRunPlan => {
  const offsets: number[] = [];
  let fullSource = "";
  for (const segment of segments) {
    offsets.push(fullSource.length);
    fullSource += segment.value;
  }
  const parsed = analysis ?? getMarkdownSourceAnalysis(fullSource);
  const media = segments.flatMap((segment, index) =>
    segment.type === "markdown" && segment.immediate
      ? [{ start: offsets[index], end: offsets[index] + segment.value.length }]
      : []
  );
  return {
    fullSource,
    segments,
    offsets,
    immediateOffsets: segments.flatMap((segment, index) =>
      segment.type === "markdown" && segment.immediate && !segment.pending
        ? [offsets[index]]
        : []
    ),
    sourceTree: parsed.tree,
    incompleteSvg: incompleteSvgRange(
      fullSource,
      [...parsed.literal, ...media].sort(
        (left, right) => left.start - right.start
      )
    ),
    visibility: new WeakMap(),
  };
};

// Decode each source token once and retain the raw end offset of every output
// unit. An entity/escape becomes visible only after its entire token was typed.
type TextMode = "markdown" | "html" | "code";
const sourceUnits = (
  raw: string,
  range: Range,
  mode: TextMode = "markdown"
) => {
  const units: { character: string; end: number }[] = [];
  const tokens =
    /\\[!-/:-@[-`{-~]|&(?:#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});|\r\n|\r|[\s\S]/gi;
  const source = raw.slice(range.start, range.end);
  let token: RegExpExecArray | null;
  while ((token = tokens.exec(source))) {
    const value = token[0];
    const literal =
      mode === "code" || (mode === "html" && value.startsWith("\\"));
    const decoded = (literal ? value : decodeString(value)).replace(
      /\r\n|\r/g,
      "\n"
    );
    for (let index = 0; index < decoded.length; index += 1)
      units.push({
        character: decoded[index],
        end:
          range.start +
          token.index +
          (decoded === value ? index + 1 : value.length),
      });
  }
  return units;
};
const inlineCodeUnits = (raw: string, source: SourceValue) => {
  const opening = /^`+/.exec(raw.slice(source.start, source.end))?.[0] ?? "";
  const units = sourceUnits(
    raw,
    { start: source.start + opening.length, end: source.end - opening.length },
    "code"
  ).map((unit) => ({
    ...unit,
    character: unit.character === "\n" ? " " : unit.character,
  }));
  if (
    units.length > source.value.length &&
    units[0]?.character === " " &&
    units.at(-1)?.character === " "
  )
    return units.slice(1, -1);
  return units;
};
const blockCodeUnits = (raw: string, source: SourceValue) => {
  const block = raw.slice(source.start, source.end);
  const fenced = /^(?:`{3,}|~{3,})/.test(block);
  let cursor = source.start + (fenced ? block.indexOf("\n") + 1 : 0);
  const units: { character: string; end: number }[] = [];
  for (const line of source.value.split("\n")) {
    const newline = raw.indexOf("\n", cursor);
    const end = newline === -1 ? source.end : Math.min(newline, source.end);
    const lineEnd = raw[end - 1] === "\r" ? end - 1 : end;
    const start = Math.max(cursor, lineEnd - line.length);
    for (let index = 0; index < line.length; index += 1)
      units.push({ character: line[index], end: start + index + 1 });
    units.push({ character: "\n", end: Math.min(source.end, end + 1) });
    cursor = end + 1;
  }
  return units;
};

/** Preserve the existing SVG renderer's unfinished-header contract. */
export const cloneVideoMarkdownSourceTree = (
  plan: VideoMarkdownRunPlan
): MarkdownRoot => {
  const tree = structuredClone(plan.sourceTree) as MarkdownRoot;
  const svg = plan.incompleteSvg;
  if (!svg) return tree;
  type MutableNode = {
    type: string;
    value?: string;
    children?: MutableNode[];
    data?: { hName: string };
    position?: Nodes["position"];
  };
  const before = plan.fullSource.slice(0, svg.start);
  const point = {
    line: before.split("\n").length,
    column: svg.start - before.lastIndexOf("\n"),
    offset: svg.start,
  };
  const marker: MutableNode = {
    type: "element",
    data: { hName: "svg" },
    children: [],
    position: { start: point, end: tree.position!.end },
  };
  let inserted = false;
  const clip = (parent: MutableNode) => {
    parent.children = parent.children?.flatMap((child) => {
      const range = rangeOf(child);
      if (!range || range.end <= svg.start) return [child];
      if (range.start > svg.start || inserted) return [];
      if (child.children) {
        clip(child);
        return [child];
      }
      const units = sourceUnits(plan.fullSource, range);
      let cursor = 0;
      let length = 0;
      for (const character of (child.value ?? "").split("")) {
        while (units[cursor] && units[cursor].character !== character)
          cursor += 1;
        if (!units[cursor] || units[cursor].end > svg.start) break;
        cursor += 1;
        length += 1;
      }
      const prefix: MutableNode[] = length
        ? [
            {
              ...child,
              value: child.value!.slice(0, length),
              position: { start: child.position!.start, end: point },
            },
          ]
        : [];
      inserted = true;
      return [...prefix, marker];
    });
  };
  clip(tree as unknown as MutableNode);
  return tree;
};

/** Annotate the complete HTML tree before formatting plugins replace leaves. */
export const prepareVideoMarkdownRun = (
  sourcePlan: VideoMarkdownRunPlan,
  tree: Root,
  format: (tree: Root) => Root = (value) => value
): VideoMarkdownRunPlan => {
  const plan: VideoMarkdownRunPlan = {
    ...sourcePlan,
    visibility: new WeakMap(),
  };
  const sources = new Map<string, SourceValue>();
  const collect = (
    node: MarkdownRoot["children"][number] | MarkdownSourceTree
  ) => {
    const range = rangeOf(node);
    if (range && "value" in node && typeof node.value === "string")
      sources.set(`${range.start}:${range.end}`, {
        ...range,
        value: node.value,
        type: node.type,
      });
    if ("children" in node)
      for (const child of node.children)
        collect(child as MarkdownRoot["children"][number]);
  };
  collect(plan.sourceTree);

  const math = (node: Element) => {
    const classes = node.properties.className;
    return (
      Array.isArray(classes) &&
      classes.some(
        (value) =>
          value === "language-math" ||
          value === "math-inline" ||
          value === "math-display"
      )
    );
  };
  const wrapMath = (parent: Root | Element, inherited?: Range) => {
    parent.children = parent.children.map((child) => {
      if (child.type !== "element") return child;
      const range = rangeOf(child) ?? inherited;
      const isMath =
        math(child) ||
        (child.tagName === "pre" &&
          child.children.some((node) => node.type === "element" && math(node)));
      if (isMath && range) {
        const wrapper: Element = {
          type: "element",
          tagName: "span",
          properties: {},
          children: [child],
          position: child.position,
        };
        plan.visibility.set(wrapper, { range, atomic: true });
        return wrapper;
      }
      wrapMath(child, range);
      return child;
    }) as typeof parent.children;
  };
  wrapMath(tree);
  plan.tree = format(tree);

  type Cursor = {
    range: Range;
    mode: TextMode;
    source?: SourceValue;
    units?: ReturnType<typeof sourceUnits>;
    index: number;
    rawCursor: number;
    breakEnd?: number;
  };
  const unitsOf = (context: Cursor) =>
    (context.units ??=
      context.source?.type === "code"
        ? blockCodeUnits(plan.fullSource, context.source)
        : context.source?.type === "inlineCode"
          ? inlineCodeUnits(plan.fullSource, context.source)
          : sourceUnits(plan.fullSource, context.range, context.mode));
  const htmlRanges = [...sources.values()].filter(
    ({ type }) => type === "html"
  );
  // remark-flow replaces its tokenizer nodes with positionless elements.
  // Recover each replacement from the actual parsed span in its parent range.
  const flows = [...sources.values()].filter(
    ({ type }) => type === "flowInteraction"
  );
  const flowStarts = flows.map(({ start }) => start);
  const htmlContains = (range: Range) => {
    let low = 0;
    let high = htmlRanges.length;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (htmlRanges[middle].start <= range.start) low = middle + 1;
      else high = middle;
    }
    const html = htmlRanges[low - 1];
    return Boolean(html && html.end >= range.end);
  };
  const walk = (node: Nodes, inherited?: Cursor) => {
    let range = rangeOf(node);
    if (
      !range &&
      node.type === "element" &&
      node.tagName === "custom-variable" &&
      inherited
    ) {
      const cursor = Math.max(
        inherited.rawCursor,
        inherited.units?.[inherited.index - 1]?.end ?? 0
      );
      const flow = flows[firstAtOrAfter(flowStarts, cursor)];
      if (flow && flow.end <= inherited.range.end) range = flow;
    }
    // remark-breaks creates positionless breaks. Recover the authored newline
    // from the same source cursor used by the adjacent text, including CRLF.
    if (
      !range &&
      node.type === "element" &&
      node.tagName === "br" &&
      inherited
    ) {
      const units = unitsOf(inherited);
      let index = inherited.index;
      while (
        index < units.length &&
        (units[index].end <= inherited.rawCursor ||
          units[index].character !== "\n")
      )
        index += 1;
      const end = units[index]?.end;
      if (end !== undefined) {
        inherited.index = index + 1;
        range = {
          start: end - (plan.fullSource.slice(end - 2, end) === "\r\n" ? 2 : 1),
          end,
        };
      }
    }
    const source = range && sources.get(`${range.start}:${range.end}`);
    let context = inherited;
    const isCode = source?.type === "code" || source?.type === "inlineCode";
    if (
      range &&
      (!inherited ||
        range.start !== inherited.range.start ||
        range.end !== inherited.range.end)
    ) {
      context = {
        range,
        source,
        mode: isCode
          ? "code"
          : htmlContains(range)
            ? "html"
            : (inherited?.mode ?? "markdown"),
        index: 0,
        rawCursor: range.start,
      };
    }
    if (node.type === "text" && context) {
      // Generated block-separator whitespace is not authored prose. Avoid
      // allocating the entire root's text map just to display these separators.
      if (!node.position && !node.value.trim() && context.mode !== "code")
        return;
      const units = unitsOf(context);
      while (units[context.index]?.end <= context.rawCursor) context.index += 1;
      const ends: number[] = [];
      const characters = node.value.split("");
      // mdast-to-hast adds a newline after a Markdown break. It represents the
      // same source newline, rather than a second authored character to seek.
      if (
        context.breakEnd !== undefined &&
        characters[0] === "\n" &&
        !node.position?.start
      ) {
        ends.push(context.breakEnd);
        characters.shift();
      }
      context.breakEnd = undefined;
      for (const character of characters) {
        while (
          context.index < units.length &&
          units[context.index].character !== character
        )
          context.index += 1;
        ends.push(units[context.index]?.end ?? context.range.end);
        context.index += 1;
      }
      plan.visibility.set(node, { ends });
    } else if (node.type === "element") {
      const state = plan.visibility.get(node);
      if (state?.atomic) return;
      const effectiveRange = range ?? context?.range;
      if (
        effectiveRange &&
        (node.children.length === 0 ||
          node.tagName === "input" ||
          node.tagName === "a" ||
          node.tagName.startsWith("custom-") ||
          node.tagName === "svg")
      ) {
        const index = segmentAt(plan, effectiveRange.start);
        const segment = plan.segments[index];
        plan.visibility.set(node, {
          range: effectiveRange,
          svg: node.tagName === "svg",
          immediate:
            // Link ancestors containing immediate HTML keep their stable host
            // element. Leaves inside a received HTML span share its budget.
            (node.tagName === "a" &&
              plan.immediateOffsets[
                firstAtOrAfter(plan.immediateOffsets, effectiveRange.start)
              ] < effectiveRange.end) ||
            (segment.type === "markdown" &&
              segment.immediate &&
              !segment.pending &&
              effectiveRange.end <= plan.offsets[index] + segment.value.length),
        });
      }
      if (node.tagName === "br" && range && inherited && !htmlContains(range))
        inherited.breakEnd = range.end;
    }
    if ("children" in node)
      for (const child of node.children) walk(child, context);
    if (inherited && context !== inherited && range)
      inherited.rawCursor = Math.max(inherited.rawCursor, range.end);
  };
  walk(plan.tree);
  return plan;
};

/** Project text and activation state without changing the complete tree shape. */
export const projectVideoMarkdownRun = (
  plan: VideoMarkdownRunPlan,
  renderedSegments: readonly RenderSegment[]
): Root => {
  if (!plan.tree) throw new Error("Video Markdown run has not been prepared");
  const visibleEnds = plan.segments.map(
    (segment, index) =>
      plan.offsets[index] +
      (segment.type === "markdown" && segment.immediate
        ? segment.pending
          ? 0
          : segment.value.length
        : Math.min(
            renderedSegments[index]?.value.length ?? 0,
            segment.value.length
          ))
  );
  const visible = (end: number) => end <= visibleEnds[segmentAt(plan, end - 1)];
  const copy = (node: Nodes, atomic = false): Nodes => {
    const state = plan.visibility.get(node);
    if (node.type === "text") {
      let length = node.value.length;
      if (!atomic && state?.ends) {
        length = 0;
        while (length < state.ends.length && visible(state.ends[length]))
          length += 1;
      }
      return { ...node, value: node.value.slice(0, length) };
    }
    if ("children" in node) {
      const children = node.children.map((child) =>
        copy(child, atomic || Boolean(state?.atomic))
      );
      if (node.type === "element") {
        const projected: Element = {
          ...node,
          properties: { ...node.properties },
          children: children as Element["children"],
        };
        if (state?.range) {
          const active = Boolean(state.immediate) || visible(state.range.end);
          const svgEnd = state.svg
            ? visibleEnds[segmentAt(plan, state.range.start)]
            : state.range.start;
          projected.data = {
            ...node.data,
            [stateKey]: {
              ...state,
              active,
              svgSource: state.svg
                ? plan.fullSource.slice(
                    state.range.start,
                    Math.min(
                      state.range.end,
                      Math.max(state.range.start, svgEnd)
                    )
                  )
                : undefined,
            },
          };
        }
        return projected;
      }
      return { ...node, children } as Root;
    }
    return { ...node };
  };
  return copy(plan.tree) as Root;
};
