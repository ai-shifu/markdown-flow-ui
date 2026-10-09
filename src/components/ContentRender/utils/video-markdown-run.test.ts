import { describe, expect, it, vi } from "vitest";
import type { Element, Nodes, Root } from "hast";
import { unified } from "unified";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import { remarkPlugins } from "./markdown-plugins";
import {
  createVideoMarkdownRunPlan,
  cloneVideoMarkdownSourceTree,
  getVideoMarkdownNodeState,
  prepareVideoMarkdownRun,
  projectVideoMarkdownRun,
} from "./video-markdown-run";
import { splitContentSegments, type RenderSegment } from "./split-content";

const video = '<iframe data-tag="video"></iframe>';
const source = (before: string, after: string): RenderSegment[] => [
  { type: "text", value: before },
  { type: "markdown", value: video, immediate: true },
  { type: "text", value: after },
];
const hidden = (segments: readonly RenderSegment[]) =>
  segments.map((segment) =>
    segment.type === "markdown" && segment.immediate
      ? segment
      : { ...segment, value: "" }
  );
const processor = unified()
  .use(remarkPlugins)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw);
const prepare = (segments: RenderSegment[]) => {
  const plan = createVideoMarkdownRunPlan(segments);
  const tree = processor.runSync(
    cloneVideoMarkdownSourceTree(plan),
    plan.fullSource
  ) as Root;
  return prepareVideoMarkdownRun(plan, tree);
};
const nodes = (tree: Nodes, tag: string): Element[] => {
  const result: Element[] = [];
  const walk = (node: Nodes) => {
    if (node.type === "element" && node.tagName === tag) result.push(node);
    if ("children" in node) node.children.forEach(walk);
  };
  walk(tree);
  return result;
};
const text = (tree: Nodes): string => {
  if (tree.type === "text") return tree.value;
  if (
    tree.type === "element" &&
    getVideoMarkdownNodeState(tree)?.active === false
  )
    return "";
  return "children" in tree ? tree.children.map(text).join("") : "";
};
const shape = (tree: Nodes): unknown => [
  tree.type,
  tree.type === "element" ? tree.tagName : "",
  "children" in tree ? tree.children.map(shape) : [],
];

describe("received video Markdown tree projection", () => {
  it.each([
    ["# Earlier heading\n\n# Watch ", " now"],
    ["> Earlier quote\n\nSeparator\n\n> Watch ", " now"],
    ["- Earlier list\n\nSeparator\n\n- Watch ", " now"],
    ["Watch ", " now\n====="],
    ["> 3. Before\n>    - ", "\n>      After"],
    ["Watch **bold ", " now**"],
    ["Watch *emphasized ", " now*"],
    ["Watch ~~deleted ", " now~~"],
    ["Watch [linked ", " now](/lesson)"],
    ["[Watch ", "][clip]\n\n[clip]: /watch"],
    ["| Label | Video |\n| --- | --- |\n| First | ", " |\n| Next | Last |"],
  ])("retains the complete tree throughout typing: %j", (before, after) => {
    const segments = source(before, after);
    const plan = prepare(segments);
    const completeShape = shape(plan.tree!);
    for (const length of [0, 1, before.length]) {
      const rendered = hidden(segments);
      rendered[0] = { type: "text", value: before.slice(0, length) };
      const projected = projectVideoMarkdownRun(plan, rendered);
      expect(shape(projected)).toEqual(completeShape);
      expect(nodes(projected, "iframe")).toHaveLength(1);
    }
    expect(text(projectVideoMarkdownRun(plan, segments))).toBe(
      text(plan.tree!)
    );
    expect(Object.isFrozen(plan.sourceTree)).toBe(true);
  });

  it.each([
    ["a thematic break", "\n\n---\n\nLater", "hr", 5],
    ["a generated soft break", "\n\nFirst\nLater", "br", 8],
    ["a CRLF soft break", "\r\n\r\nFirst\r\nLater", "br", 11],
    ["a spaces hard break", "\n\nFirst  \nLater", "br", 10],
    ["a backslash hard break", "\n\nFirst\\\nLater", "br", 9],
    ["an authored HTML break", "\n\nFirst<br>Later", "br", 11],
    ["an empty HTML leaf", "\n\nFirst<wbr>Later", "wbr", 12],
    ["an empty paired HTML leaf", "\n\nFirst<mark></mark>Later", "mark", 20],
  ])("activates %s only at its source end", (_name, after, tag, end) => {
    const segments = source("", after as string);
    const plan = prepare(segments);
    const renderAt = (length: number) => {
      const rendered = hidden(segments);
      rendered[2] = { type: "text", value: (after as string).slice(0, length) };
      return projectVideoMarkdownRun(plan, rendered);
    };
    expect(nodes(plan.tree!, tag as string)).toHaveLength(1);
    for (const length of [0, (end as number) - 1, end as number]) {
      const projected = renderAt(length);
      expect(
        getVideoMarkdownNodeState(nodes(projected, tag as string)[0])?.active
      ).toBe(length >= (end as number));
      expect(
        getVideoMarkdownNodeState(nodes(projected, "iframe")[0])?.active
      ).not.toBe(false);
      expect(shape(projected)).toEqual(shape(plan.tree!));
    }
    expect(text(renderAt((end as number) + 2)).replace(/\s/g, "")).toBe(
      tag === "hr" ? "" : "FirstLa"
    );
    expect(text(projectVideoMarkdownRun(plan, segments))).toBe(
      text(plan.tree!)
    );
  });

  it.each([false, true])(
    "shares received HTML leaf budgets (pending=%s)",
    (pending) => {
      const html = "<details><summary>Title</summary><hr><br></details>";
      const segments: RenderSegment[] = [
        { type: "text", value: "Before\n\n" },
        {
          type: "markdown",
          value: html,
          immediate: true,
          ...(pending ? { pending: true as const } : {}),
        },
        { type: "text", value: "\n\nLater" },
      ];
      const plan = prepare(segments);
      const projected = projectVideoMarkdownRun(plan, hidden(segments));
      for (const tag of ["hr", "br"])
        expect(
          getVideoMarkdownNodeState(nodes(projected, tag)[0])?.active
        ).toBe(!pending);
      expect(text(projected).replace(/\s/g, "")).toBe(pending ? "" : "Title");
    }
  );

  it("maps successive generated breaks to their own newline inside containers", () => {
    const before = "> - First\n>   Next\n>   Last ";
    const segments = source(before, "");
    const plan = prepare(segments);
    const firstEnd = before.indexOf("\n") + 1;
    const secondEnd = before.indexOf("\n", firstEnd) + 1;
    for (let length = 0; length <= before.length; length += 1) {
      const rendered = hidden(segments);
      rendered[0] = { type: "text", value: before.slice(0, length) };
      const projected = projectVideoMarkdownRun(plan, rendered);
      expect(
        nodes(projected, "br").map(
          (node) => getVideoMarkdownNodeState(node)?.active
        )
      ).toEqual([length >= firstEnd, length >= secondEnd]);
    }
    expect(
      text(projectVideoMarkdownRun(plan, segments)).replace(/\s/g, "")
    ).toBe("FirstNextLast");
  });

  it("resolves a reference link before its definition is typed", () => {
    const segments = source("[Watch ", "][clip]\n\n[clip]: /watch");
    const plan = prepare(segments);
    const link = nodes(projectVideoMarkdownRun(plan, hidden(segments)), "a")[0];
    expect(link.properties.href).toBe("/watch");
    expect(getVideoMarkdownNodeState(link)?.active).toBe(true);
    expect(nodes(link, "iframe")).toHaveLength(1);
  });

  it.each([
    [
      "甲&amp;乙\\*丙 ",
      [
        "",
        "甲",
        "甲",
        "甲",
        "甲",
        "甲",
        "甲&",
        "甲&乙",
        "甲&乙",
        "甲&乙*",
        "甲&乙*丙",
        "甲&乙*丙 ",
      ],
    ],
    [
      "甲&#x1F600;乙 ",
      [
        "",
        "甲",
        "甲",
        "甲",
        "甲",
        "甲",
        "甲",
        "甲",
        "甲",
        "甲",
        "甲😀",
        "甲😀乙",
        "甲😀乙 ",
      ],
    ],
  ])("maps decoded units to complete raw tokens: %j", (before, expected) => {
    const segments = source(before, "");
    const plan = prepare(segments);
    for (let length = 0; length <= before.length; length += 1) {
      const rendered = hidden(segments);
      rendered[0] = { type: "text", value: before.slice(0, length) };
      expect(text(projectVideoMarkdownRun(plan, rendered))).toBe(
        expected[length]
      );
    }
  });

  it.each([
    `${video}甲&amp;乙`,
    `${video}\n甲&amp;乙`,
    `Before <span>甲&amp;乙</span> ${video}`,
  ])("preserves HTML entity budgets: %j", (raw) => {
    const segments = splitContentSegments(raw, true, true);
    const plan = prepare(segments);
    const entityEnd = raw.indexOf("&amp;") + 5;
    for (const end of [entityEnd - 1, entityEnd]) {
      const rendered = segments.map((segment, index) =>
        segment.type === "markdown" && segment.immediate
          ? segment
          : {
              ...segment,
              value: segment.value.slice(
                0,
                Math.max(0, end - plan.offsets[index])
              ),
            }
      );
      expect(text(projectVideoMarkdownRun(plan, rendered)).includes("&")).toBe(
        end === entityEnd
      );
    }
  });

  it("does not activate untyped images, custom controls, math or SVG", () => {
    const segments = source(
      'Before <img src="/secret"> ![Image](/secret) <custom-button-after-content>Go</custom-button-after-content> $x^2$\n',
      "\n<svg><text>Chart</text></svg>"
    );
    const plan = prepare(segments);
    const projected = projectVideoMarkdownRun(plan, hidden(segments));
    for (const tag of ["img", "custom-button-after-content", "svg"])
      for (const node of nodes(projected, tag))
        expect(getVideoMarkdownNodeState(node)?.active).toBe(false);
    expect(text(projected).trim()).toBe("");
    expect(nodes(projected, "iframe")).toHaveLength(1);
  });

  it("preserves code text and its raw escaping without parsing each tick", () => {
    const segments = source(
      "Use `a\\* &amp;`\n\n```js\nconst a = 1;\n```\n\n",
      " after"
    );
    const sourcePlan = createVideoMarkdownRunPlan(segments);
    const transform = vi.fn(
      (tree: Root) =>
        unified().use(rehypeHighlight).use(rehypeKatex).runSync(tree) as Root
    );
    const tree = processor.runSync(
      cloneVideoMarkdownSourceTree(sourcePlan)
    ) as Root;
    const plan = prepareVideoMarkdownRun(sourcePlan, tree, transform);
    for (let length = 0; length < segments[0].value.length; length += 1) {
      const rendered = hidden(segments);
      rendered[0] = { type: "text", value: segments[0].value.slice(0, length) };
      expect(shape(projectVideoMarkdownRun(plan, rendered))).toEqual(
        shape(plan.tree!)
      );
    }
    expect(transform).toHaveBeenCalledTimes(1);
    expect(text(projectVideoMarkdownRun(plan, segments))).toContain(
      "a\\* &amp;"
    );
    expect(text(projectVideoMarkdownRun(plan, segments))).toContain(
      "const a = 1;"
    );
  });

  it("activates a flow control at its own source boundary", () => {
    const interaction = "?[%{{role}}Developer|Designer]";
    const before = `Select ${interaction} then `;
    const segments = source(before, " after");
    const plan = prepare(segments);
    const end = before.indexOf(interaction) + interaction.length;
    for (const length of [end - 1, end]) {
      const rendered = hidden(segments);
      rendered[0] = { type: "text", value: before.slice(0, length) };
      const control = nodes(
        projectVideoMarkdownRun(plan, rendered),
        "custom-variable"
      )[0];
      expect(control).toBeDefined();
      expect(getVideoMarkdownNodeState(control)?.active).toBe(length === end);
    }
  });

  it("gates formatted math until its complete source token is typed", () => {
    const before = "Formula $x^2$ then ";
    const segments = source(before, " after");
    const sourcePlan = createVideoMarkdownRunPlan(segments);
    const tree = processor.runSync(
      cloneVideoMarkdownSourceTree(sourcePlan)
    ) as Root;
    const plan = prepareVideoMarkdownRun(
      sourcePlan,
      tree,
      (value) => unified().use(rehypeKatex).runSync(value) as Root
    );
    const end = before.indexOf("$", before.indexOf("$") + 1) + 1;
    for (const length of [end - 1, end]) {
      const rendered = hidden(segments);
      rendered[0] = { type: "text", value: before.slice(0, length) };
      const projected = projectVideoMarkdownRun(plan, rendered);
      const math = nodes(projected, "span").find(
        (node) => getVideoMarkdownNodeState(node)?.atomic
      );
      expect(math).toBeDefined();
      expect(getVideoMarkdownNodeState(math!)?.active).toBe(length === end);
    }
  });

  it("keeps raw HTML backslashes literal while decoding its entities", () => {
    const segments = source("", "甲\\*乙&amp;丙");
    const plan = prepare(segments);
    const rendered = hidden(segments);
    for (let length = 0; length <= segments[2].value.length; length += 1) {
      rendered[2] = { type: "text", value: segments[2].value.slice(0, length) };
      const visible = text(projectVideoMarkdownRun(plan, rendered));
      expect(visible.includes("&")).toBe(
        length >= segments[2].value.indexOf("&amp;") + 5
      );
    }
    expect(text(projectVideoMarkdownRun(plan, segments))).toBe("甲\\*乙&丙");
  });

  it.each([
    '<svg width="100',
    '<svg\nwidth="100',
    '<svg title="?[Option|Other]',
  ])(
    "routes an unfinished SVG header through its stable Shadow renderer: %j",
    (svg) => {
      const segments = source("", `\n\n${svg}`);
      const plan = prepare(segments);
      const projected = projectVideoMarkdownRun(plan, segments);
      const node = nodes(projected, "svg")[0];
      expect(node).toBeDefined();
      expect(getVideoMarkdownNodeState(node)?.svgSource).toBe(svg);
      expect(text(projected)).not.toContain("<svg");
      expect(nodes(projected, "custom-variable")).toHaveLength(0);
    }
  );

  it.each(["`<svg width=100`", "$<svg width=100$", "\\<svg width=100"])(
    "keeps literal SVG examples inert: %j",
    (literal) => {
      const segments = source("", `\n\n${literal}`);
      const plan = prepare(segments);
      expect(plan.incompleteSvg).toBeUndefined();
      expect(
        nodes(projectVideoMarkdownRun(plan, segments), "svg")
      ).toHaveLength(0);
    }
  );

  it("preserves CJK, emoji and decoded text before an unfinished SVG header", () => {
    const segments = source("", '\n\n甲😀&amp; before <svg width="100');
    const plan = prepare(segments);
    expect(text(projectVideoMarkdownRun(plan, segments)).trim()).toBe(
      "甲😀& before"
    );
  });

  it("keeps an SVG-looking raw-text body literal", () => {
    const plan = createVideoMarkdownRunPlan(
      source("", '\n\n<textarea><svg width="100</textarea>')
    );
    expect(plan.incompleteSvg).toBeUndefined();
  });

  it("keeps the complete source tree unchanged after projections", () => {
    const segments = source("Before ", " after");
    const plan = prepare(segments);
    const original = structuredClone(plan.tree);
    projectVideoMarkdownRun(plan, hidden(segments));
    projectVideoMarkdownRun(plan, segments);
    expect(plan.tree).toEqual(original);
  });
});
