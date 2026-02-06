import { describe, expect, it } from "vitest";

import { splitContentSegments } from "./split-content";

describe("splitContentSegments", () => {
  it("keeps inline svg and fenced code as markdown segments", () => {
    const raw =
      "```mermaid\ngraph TD\n    subgraph 大语言模型的诞生\n        A[初始模型<br>空白的“大脑”] --> B[预训练<br>海量数据“上学”]\n        B --> C[后训练<br>对齐与微调]\n        C --> D[大语言模型<br>具备语言与知识]\n    end\n```\n\n你有没有想过，为什么一夜之间，好像全世界都在谈论“大模型”？\n\n伴随 ChatGPT 一起爆火的，AI 真的和人很像。";

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
  });

  it("extracts custom button from sandbox blocks", () => {
    const raw =
      "<div><p>real html</p></div><custom-button-after-content>Ask</custom-button-after-content>";

    const segments = splitContentSegments(raw);
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
});
