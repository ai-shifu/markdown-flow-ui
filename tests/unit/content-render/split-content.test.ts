import { describe, expect, it } from "vitest";

import { splitContentSegments } from "../../../src/components/ContentRender/utils/split-content";

describe("splitContentSegments", () => {
  it("keeps inline svg and fenced code as markdown segments", () => {
    const raw = "```mermaid\ngraph TD\n    subgraph 大语言模型的诞生\n        A[初始模型<br>空白的“大脑”] --> B[预训练<br>海量数据“上学”]\n        B --> C[后训练<br>对齐与微调]\n        C --> D[大语言模型<br>具备语言与知识]\n    end\n```\n\n你有没有想过，为什么一夜之间，好像全世界都在谈论“大模型”？\n\n伴随 ChatGPT 一起爆火的，AI 真的和人很像。";

    const segments = splitContentSegments(raw);

    expect(segments).toHaveLength(1);
    segments.forEach((segment) => expect(segment.type).toBe("markdown"));
    expect(segments[0].value).toContain("```mermaid");
  });

  it("splits true html blocks into sandbox", () => {
    const raw = ["Intro", "<div><p>real html</p></div>", "Outro"].join("\n");

    const segments = splitContentSegments(raw);

    expect(segments).toHaveLength(1);
    expect(segments[0].type).toBe("sandbox");
    expect(segments[0].value).toContain("<div><p>real html</p></div>");
  });

  it("keeps text segments when enabled (mermaid + text)", () => {
    const raw = "```mermaid\ngraph TD\n    subgraph 大语言模型的诞生\n        A[初始模型<br>空白的“大脑”] --> B[预训练<br>海量数据“上学”]\n        B --> C[后训练<br>对齐与微调]\n        C --> D[大语言模型<br>具备语言与知识]\n    end\n```\n\n你有没有想过，为什么一夜之间，好像全世界都在谈论“大模型”？";

    const segments = splitContentSegments(raw, true);

    expect(segments).toHaveLength(2);
    expect(segments[0].type).toBe("markdown");
    expect(segments[1].type).toBe("text");
    expect(segments[1].value).toContain("你有没有想过，为什么一夜之间，好像全世界都在谈论“大模型”？");
  });

  it("keeps text segments when enabled (html + text)", () => {
    const raw = ["Intro", "<div><p>real html</p></div>", "Outro"].join("\n");

    const segments = splitContentSegments(raw, true);

    expect(segments).toHaveLength(3);
    expect(segments[0].type).toBe("text");
    expect(segments[1].type).toBe("sandbox");
    expect(segments[2].type).toBe("text");
    expect(segments[2].value).toContain("Outro");
  });

  it("treats streamed svg plus trailing text as markdown", () => {
    const raw =
      '<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="600" fill="#f5f5f5"/></svg>不是一个技术名词，而是一种工作方式：不追求完全理解每一行代码，更关注“整体是否跑通”“功能是否达成';

    const segments = splitContentSegments(raw);
    expect(segments).toHaveLength(1);
    expect(segments[0].type).toBe("markdown");
    expect(segments[0].value).toContain("<svg");
  });

  it("keeps streamed svg as a single markdown block when keepText is true", () => {
    const raw =
      '<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="600" fill="#f5f5f5"/></svg>不是一个技术名词，而是一种工作方式：不追求完全理解每一行代码，更关注“整体是否跑通”“功能是否达成';

    const segments = splitContentSegments(raw, true);
    console.log('segments=====', segments);

    expect(segments).toHaveLength(1);
    expect(segments[0].type).toBe("markdown");
    expect(segments[0].value).toContain("</svg>");
  });
});
