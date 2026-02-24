import { describe, expect, it } from "vitest";

import { splitContentSegments } from "./split-content";

describe("splitContentSegments", () => {
  it("keeps inline svg and fenced code as markdown segments", () => {
    const raw =
      "```mermaid\ngraph TD\n    subgraph 大语言模型的诞生\n        A[初始模型<br>空白的“大脑”] --> B[预训练<br>海量数据“上学”]\n        B --> C[后训练<br>对齐与微调]\n        C --> D[大语言模型<br>具备语言与知识]\n    end\n```\n\n你有没有想过，为什么一夜之间，好像全世界都在谈论“大模型”？\n\n伴随 ChatGPT 一起爆火的，AI 真的和人很像。";

    const segments = splitContentSegments(raw, true);

    expect(segments).toHaveLength(2);
    expect(segments[0].type).toBe("markdown");
    expect(segments[0].value).toContain("```mermaid");
    expect(segments[1].type).toBe("text");
  });

  it("splits true html blocks into sandbox", () => {
    const raw = ["Intro", "<div><p>real html</p></div>", "Outro"].join("\n");

    const segments = splitContentSegments(raw, true);

    expect(segments).toHaveLength(3);
    expect(segments[0].type).toBe("text");
    expect(segments[1].type).toBe("sandbox");
    expect(segments[2].type).toBe("text");
  });

  it("extracts custom button from sandbox blocks", () => {
    const raw =
      "<div><p>real html</p></div><custom-button-after-content>Ask</custom-button-after-content>";

    const segments = splitContentSegments(raw, true);
    const sandboxSegments = segments.filter(
      (segment) => segment.type === "sandbox"
    );
    const customSegments = segments.filter(
      (segment) =>
        segment.type !== "sandbox" &&
        segment.value.includes("custom-button-after-content")
    );

    expect(sandboxSegments).toHaveLength(1);
    expect(sandboxSegments[0].value).not.toContain(
      "custom-button-after-content"
    );
    expect(customSegments).toHaveLength(1);
  });

  it("keeps script blocks inside sandbox when custom button follows", () => {
    const raw = [
      "<div><p>real html</p></div>",
      "<style>.demo{color:red;}</style>",
      "<script>console.log('demo');</script><custom-button-after-content>Ask</custom-button-after-content>",
    ].join("\n");

    const segments = splitContentSegments(raw, true);
    const sandboxValue = segments
      .filter((segment) => segment.type === "sandbox")
      .map((segment) => segment.value)
      .join("");

    expect(sandboxValue).toContain("<script>");
    expect(sandboxValue).not.toContain("custom-button-after-content");
  });

  it("splits markdown heading as markdown segment", () => {
    const raw = "开头文本\n\n## 标题\n\n结尾文本";

    const segments = splitContentSegments(raw, true);

    expect(segments).toHaveLength(3);
    expect(segments[0]).toEqual({ type: "text", value: "开头文本\n\n" });
    expect(segments[1]).toEqual({ type: "markdown", value: "## 标题" });
    expect(segments[2]).toEqual({ type: "text", value: "\n\n结尾文本" });
  });

  it("treats iframe video blocks as markdown segments", () => {
    const raw =
      "开头文本\n\n<iframe data-tag='video' src=\"https://example.com/video\"></iframe>\n\n结尾文本";

    const segments = splitContentSegments(raw, true);

    expect(segments).toHaveLength(3);
    expect(segments[0].type).toBe("text");
    expect(segments[1].type).toBe("markdown");
    expect(segments[1].value).toContain("data-tag='video'");
    expect(segments[2].type).toBe("text");
  });

  it("splits headings, table-with-svg-text, and callout as expected", () => {
    const raw = `Intro

## Title

### Markdown Table Example
| Feature | Syntax | Supported |
| --- | --- | --- |
| SVG | <svg>...</svg> | Yes |

### Markdown Callout Example
> [!NOTE]
> Callout content`;

    const segments = splitContentSegments(raw, true);

    expect(segments.map((segment) => segment.type)).toEqual([
      "text",
      "markdown",
      "markdown",
      "markdown",
      "markdown",
      "text",
    ]);
    expect(segments[3].value).toContain("| SVG | <svg>...</svg> | Yes |");
    expect(segments[5].value).toContain("> [!NOTE]");
  });

  it("keeps inline svg text inside markdown table rows", () => {
    const raw = `### Markdown Table Example
| Feature | Syntax | Supported |
| --- | --- | --- |
| SVG | <svg>...</svg> | Yes |

<div>HTML Block</div>`;

    const segments = splitContentSegments(raw, true);

    const isolatedSvgSegment = segments.find(
      (segment) =>
        segment.type === "markdown" && segment.value === "<svg>...</svg>"
    );
    const tableCarrier = segments.find((segment) =>
      segment.value.includes("| SVG | <svg>...</svg> | Yes |")
    );

    expect(isolatedSvgSegment).toBeUndefined();
    expect(tableCarrier).toBeDefined();
  });
});
