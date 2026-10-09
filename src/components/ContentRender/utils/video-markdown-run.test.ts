import { describe, expect, it } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import {
  createVideoMarkdownRunPlan,
  projectVideoMarkdownRun,
} from "./video-markdown-run";
import type { RenderSegment } from "./split-content";

const video = '<iframe data-tag="video"></iframe>';
const source = (before: string, after: string): RenderSegment[] => [
  { type: "text", value: before },
  { type: "markdown", value: video, immediate: true },
  { type: "text", value: after },
];
const hidden = (segments: RenderSegment[]) =>
  segments.map((segment) =>
    segment.type === "text" ? { ...segment, value: "" } : segment
  );

describe("video Markdown run projection", () => {
  it.each([
    ["> Before\n> ", "\n> After"],
    ["- Before\n- ", "\n- After"],
    ["> 3. Before\n>    - ", "\n>      After"],
    ["Before ", " After"],
  ])(
    "preserves real media context before prose appears: %j",
    (before, after) => {
      const segments = source(before, after);
      const plan = createVideoMarkdownRunPlan(segments);
      const projected = projectVideoMarkdownRun(plan, hidden(segments));
      expect(plan.hasContext).toBe(true);
      expect(projected).toContain(video);
      expect(projected).not.toContain("Before");
      expect(projected).not.toContain("After");
      expect(projected.length).toBe(plan.fullSource.length);
      expect(projectVideoMarkdownRun(plan, segments)).toBe(plan.fullSource);
      expect(projectVideoMarkdownRun(plan, segments)).not.toContain(
        plan.placeholder
      );
    }
  );

  it("keeps earlier list-item skeletons and inline paragraphs", () => {
    const segments = source("- Before\n- Inline ", " after");
    const plan = createVideoMarkdownRunPlan(segments);
    const tree = unified()
      .use(remarkParse)
      .parse(projectVideoMarkdownRun(plan, hidden(segments)));
    let items = 0;
    let paragraphs = 0;
    visit(tree, "listItem", () => {
      items += 1;
    });
    visit(tree, "paragraph", () => {
      paragraphs += 1;
    });
    expect(items).toBe(2);
    expect(paragraphs).toBe(2);
  });

  it("does not activate untyped HTML, images, tags, or fake quote markers", () => {
    const segments = source(
      'Before <img src="/secret"> ![Image](/secret) <custom-button-after-content>Go</custom-button-after-content>\n',
      "\n> Ordinary quote text"
    );
    const plan = createVideoMarkdownRunPlan(segments);
    const projected = projectVideoMarkdownRun(plan, hidden(segments));
    expect(projected).not.toContain("<img");
    expect(projected).not.toContain("![");
    expect(projected).not.toContain("<custom-");
    expect(projected).not.toContain("> Ordinary");
    expect(projected.replace(video, "")).not.toContain(">");
  });

  it("keeps raw prefix timing while accepting render-only inline-code repair", () => {
    const segments = source("Use `code` ", " after");
    const plan = createVideoMarkdownRunPlan(segments);
    const rendered = hidden(segments);
    rendered[0] = { type: "text", value: "Use `co" };
    const projected = projectVideoMarkdownRun(plan, rendered, [
      "Use `co`",
      video,
      "",
    ]);
    expect(
      projected.startsWith(`Use \`co\`${plan.placeholder.repeat(4)}${video}`)
    ).toBe(true);
  });

  it("omits pending media without exposing the incomplete header", () => {
    const segments: RenderSegment[] = [
      { type: "text", value: "> Before\n> " },
      {
        type: "markdown",
        value: '<iframe title="unfinished',
        immediate: true,
        pending: true,
      },
    ];
    const plan = createVideoMarkdownRunPlan(segments);
    expect(projectVideoMarkdownRun(plan, hidden(segments))).not.toContain(
      "<iframe"
    );
  });

  it("chooses a placeholder absent from the source and skips plain root video context", () => {
    const plan = createVideoMarkdownRunPlan(source("\ue000\n", ""));
    expect(plan.placeholder).toBe("\ue001");
    expect(
      createVideoMarkdownRunPlan([
        { type: "markdown", value: video, immediate: true },
      ]).hasContext
    ).toBe(false);
  });
});
