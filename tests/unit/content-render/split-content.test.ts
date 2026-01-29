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

  it("splits true html blocks into sandbox when keepText is true", () => {
    const raw = `<div style="width: 100%; overflow-x: auto;">
<svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="800" height="400" fill="#F8FAFC" rx="8"/>
    <rect x="100" y="280" width="600" height="80" fill="#0F63EE" rx="8"/>
    <text x="400" y="320" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">AI师傅平台基础能力</text>
    <rect x="150" y="240" width="100" height="30" fill="#E6F0FF" stroke="#0F63EE" stroke-width="2" rx="4"/>
    <text x="200" y="260" text-anchor="middle" fill="#0F63EE" font-family="Arial, sans-serif" font-size="12">用户互动</text>
    <rect x="275" y="240" width="100" height="30" fill="#E6F0FF" stroke="#0F63EE" stroke-width="2" rx="4"/>
    <text x="325" y="260" text-anchor="middle" fill="#0F63EE" font-family="Arial, sans-serif" font-size="12">输出给AI</text>
    <rect x="400" y="240" width="100" height="30" fill="#E6F0FF" stroke="#0F63EE" stroke-width="2" rx="4"/>
    <text x="450" y="260" text-anchor="middle" fill="#0F63EE" font-family="Arial, sans-serif" font-size="12">AI判断</text>
    <rect x="525" y="240" width="100" height="30" fill="#E6F0FF" stroke="#0F63EE" stroke-width="2" rx="4"/>
    <text x="575" y="260" text-anchor="middle" fill="#0F63EE" font-family="Arial, sans-serif" font-size="12">AI输出</text>
    <line x1="200" y1="280" x2="200" y2="240" stroke="#0F63EE" stroke-width="2"/>
    <line x1="325" y1="280" x2="325" y2="240" stroke="#0F63EE" stroke-width="2"/>
    <line x1="450" y1="280" x2="450" y2="240" stroke="#0F63EE" stroke-width="2"/>
    <line x1="575" y1="280" x2="575" y2="240" stroke="#0F63EE" stroke-width="2"/>
    <rect x="250" y="120" width="120" height="60" fill="#0F63EE" rx="8"/>
    <text x="310" y="150" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">教学</text>
    <rect x="430" y="120" width="120" height="60" fill="#0F63EE" rx="8"/>
    <text x="490" y="150" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">测评</text>
    <line x1="310" y1="180" x2="310" y2="240" stroke="#0F63EE" stroke-width="2" stroke-dasharray="5,5"/>
    <line x1="490" y1="180" x2="490" y2="240" stroke="#0F63EE" stroke-width="2" stroke-dasharray="5,5"/>
</svg>
</div>

前面内容介绍了如何用 AI 师傅平台进行教学，本小节我们重点介绍如何用 AI 师傅平台进行测评。

在 AI 师傅平台上进行测评，核心依然是结合平台本身的基础能力。聚焦到**随堂测验**这个场景，流程可以概括为：

1.  **大模型出题**：基于课程内容和你的背景（虽然你不告诉我具体是什么，但系统会基于你设定的背景来生成题目），AI 会生成个性化的测验题目。
2.  **学员互动答题**：kk，你会通过互动的方式（如选择题、填空题、问答题等）来回答问题。
3.  **大模型判题**：AI 会分析你的答案，进行判断，并给出反馈。

整个过程充分利用了平台的**用户互动、输出给 AI、AI 判断、AI 输出**这些核心能力，为你提供即时、个性化的学习效果检验。`;

    const segments = splitContentSegments(raw, true);

    expect(segments).toHaveLength(2);
    expect(segments[0].type).toBe("sandbox");
    expect(segments[0].value).toContain("<div style=\"width: 100%; overflow-x: auto;\">");
    expect(segments[1].type).toBe("text");
    expect(segments[1].value).toContain("前面内容介绍了如何用 AI 师傅平台进行教学，本小节我们重点介绍如何用 AI 师傅平台进行测评。");
  });

  it("splits true html blocks into sandbox when keepText is false", () => {
    const raw = `<div style="width: 100%; overflow-x: auto;">
<svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="800" height="400" fill="#F8FAFC" rx="8"/>
    <rect x="100" y="280" width="600" height="80" fill="#0F63EE" rx="8"/>
    <text x="400" y="320" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">AI师傅平台基础能力</text>
    <rect x="150" y="240" width="100" height="30" fill="#E6F0FF" stroke="#0F63EE" stroke-width="2" rx="4"/>
    <text x="200" y="260" text-anchor="middle" fill="#0F63EE" font-family="Arial, sans-serif" font-size="12">用户互动</text>
    <rect x="275" y="240" width="100" height="30" fill="#E6F0FF" stroke="#0F63EE" stroke-width="2" rx="4"/>
    <text x="325" y="260" text-anchor="middle" fill="#0F63EE" font-family="Arial, sans-serif" font-size="12">输出给AI</text>
    <rect x="400" y="240" width="100" height="30" fill="#E6F0FF" stroke="#0F63EE" stroke-width="2" rx="4"/>
    <text x="450" y="260" text-anchor="middle" fill="#0F63EE" font-family="Arial, sans-serif" font-size="12">AI判断</text>
    <rect x="525" y="240" width="100" height="30" fill="#E6F0FF" stroke="#0F63EE" stroke-width="2" rx="4"/>
    <text x="575" y="260" text-anchor="middle" fill="#0F63EE" font-family="Arial, sans-serif" font-size="12">AI输出</text>
    <line x1="200" y1="280" x2="200" y2="240" stroke="#0F63EE" stroke-width="2"/>
    <line x1="325" y1="280" x2="325" y2="240" stroke="#0F63EE" stroke-width="2"/>
    <line x1="450" y1="280" x2="450" y2="240" stroke="#0F63EE" stroke-width="2"/>
    <line x1="575" y1="280" x2="575" y2="240" stroke="#0F63EE" stroke-width="2"/>
    <rect x="250" y="120" width="120" height="60" fill="#0F63EE" rx="8"/>
    <text x="310" y="150" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">教学</text>
    <rect x="430" y="120" width="120" height="60" fill="#0F63EE" rx="8"/>
    <text x="490" y="150" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">测评</text>
    <line x1="310" y1="180" x2="310" y2="240" stroke="#0F63EE" stroke-width="2" stroke-dasharray="5,5"/>
    <line x1="490" y1="180" x2="490" y2="240" stroke="#0F63EE" stroke-width="2" stroke-dasharray="5,5"/>
</svg>
</div>

前面内容介绍了如何用 AI 师傅平台进行教学，本小节我们重点介绍如何用 AI 师傅平台进行测评。

在 AI 师傅平台上进行测评，核心依然是结合平台本身的基础能力。聚焦到**随堂测验**这个场景，流程可以概括为：

1.  **大模型出题**：基于课程内容和你的背景（虽然你不告诉我具体是什么，但系统会基于你设定的背景来生成题目），AI 会生成个性化的测验题目。
2.  **学员互动答题**：kk，你会通过互动的方式（如选择题、填空题、问答题等）来回答问题。
3.  **大模型判题**：AI 会分析你的答案，进行判断，并给出反馈。

整个过程充分利用了平台的**用户互动、输出给 AI、AI 判断、AI 输出**这些核心能力，为你提供即时、个性化的学习效果检验。`

    const segments = splitContentSegments(raw);
    console.log('segments', segments);
    expect(segments).toHaveLength(1);
    expect(segments[0].type).toBe("sandbox");
    expect(segments[0].value).toContain("<div style=\"width: 100%; overflow-x: auto;\">");
    expect(segments[0].value).not.toContain("前面内容介绍了如何用 AI 师傅平台进行教学，本小节我们重点介绍如何用 AI 师傅平台进行测评。");
    expect(segments[0].value).not.toContain("在 AI 师傅平台上进行测评");
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

  it("splits leading text, svg, and trailing text when keepText is true", () => {
    const raw = `你好，我是孙志岗，初次见面，很高兴认识你。

<svg width="100%" height="200" viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0F63EE;stop-opacity:0.1" />
      <stop offset="100%" style="stop-color:#0F63EE;stop-opacity:0.05" />
    </linearGradient>
    <clipPath id="avatarClip">
      <circle cx="100" cy="100" r="40"/>
    </clipPath>
  </defs>
  <rect width="800" height="200" fill="url(#bgGrad)" rx="10"/>
  <rect x="20" y="20" width="760" height="160" fill="white" fill-opacity="0.9" rx="8" stroke="#0F63EE" stroke-width="2"/>
  <image href="https://resource.ai-shifu.com/ac186b833d0e417fb02737910b3a5ae0" x="60" y="60" height="80" width="80" clip-path="url(#avatarClip)"/>
  <line x1="160" y1="100" x2="180" y2="100" stroke="#0F63EE" stroke-width="3"/>
  <rect x="200" y="70" width="400" height="60" fill="none" stroke="#0F63EE" stroke-width="2" stroke-dasharray="5,5"/>
  <text x="400" y="105" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#0F63EE" font-weight="bold">跟 AI 学 AI 通识</text>
  <text x="400" y="135" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#666">大模型 · 应用 · 思维</text>
  <rect x="650" y="150" width="120" height="30" rx="15" fill="#0F63EE"/>
  <text x="710" y="170" text-anchor="middle" font-family="sans-serif" font-size="14" fill="white">一对一课堂</text>
</svg>

为了判断咱们这门课是否真的适合你，我想先了解一下你的基本看法。下面几个观点，你同意吗？

1.  AI 是一种工具
2.  每种 AI 产品都需要学习使用方法
3.  打造 AI 产品是技术高手的事情`;

    const segments = splitContentSegments(raw, true);

    expect(segments).toHaveLength(3);
    expect(segments[0].type).toBe("text");
    expect(segments[0].value).toBe("你好，我是孙志岗，初次见面，很高兴认识你。\n\n");
    expect(segments[1].type).toBe("markdown");
    expect(segments[1].value).toContain("<svg");
    expect(segments[1].value).toContain("</svg>");
    expect(segments[2].type).toBe("text");
    expect(segments[2].value).toContain("为了判断咱们这门课是否真的适合你");
    expect(segments[2].value).toContain("AI 是一种工具");
  });

  it("splits leading text, svg, and trailing text when keepText is false", () => {
    const raw = `你好，我是孙志岗，初次见面，很高兴认识你。

<svg width="100%" height="200" viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0F63EE;stop-opacity:0.1" />
      <stop offset="100%" style="stop-color:#0F63EE;stop-opacity:0.05" />
    </linearGradient>
    <clipPath id="avatarClip">
      <circle cx="100" cy="100" r="40"/>
    </clipPath>
  </defs>
  <rect width="800" height="200" fill="url(#bgGrad)" rx="10"/>
  <rect x="20" y="20" width="760" height="160" fill="white" fill-opacity="0.9" rx="8" stroke="#0F63EE" stroke-width="2"/>
  <image href="https://resource.ai-shifu.com/ac186b833d0e417fb02737910b3a5ae0" x="60" y="60" height="80" width="80" clip-path="url(#avatarClip)"/>
  <line x1="160" y1="100" x2="180" y2="100" stroke="#0F63EE" stroke-width="3"/>
  <rect x="200" y="70" width="400" height="60" fill="none" stroke="#0F63EE" stroke-width="2" stroke-dasharray="5,5"/>
  <text x="400" y="105" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#0F63EE" font-weight="bold">跟 AI 学 AI 通识</text>
  <text x="400" y="135" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#666">大模型 · 应用 · 思维</text>
  <rect x="650" y="150" width="120" height="30" rx="15" fill="#0F63EE"/>
  <text x="710" y="170" text-anchor="middle" font-family="sans-serif" font-size="14" fill="white">一对一课堂</text>
</svg>

为了判断咱们这门课是否真的适合你，我想先了解一下你的基本看法。下面几个观点，你同意吗？

1.  AI 是一种工具
2.  每种 AI 产品都需要学习使用方法
3.  打造 AI 产品是技术高手的事情`;

    const segments = splitContentSegments(raw);

    expect(segments).toHaveLength(1);
    expect(segments[0].type).toBe("markdown");
    expect(segments[0].value).toContain("<svg");
    expect(segments[0].value).toContain("</svg>");
  });


  it("splits text and partial mermaid fenced block when keepText is true", () => {
    const raw = `简单说，AI 的发展历程可以浓缩为四个阶段：

\`\`\`mermaid
timeline
    title AI 发展四阶段
    section 第一阶段
        穷举法
    : 基于规则与计算`;
    // console.log('splits text and partial mermaid fenced block when keepText is true', splitContentSegments(raw, true));
    const segments = splitContentSegments(raw, true);
    expect(segments).toHaveLength(2);
    expect(segments[0].type).toBe("text");
    expect(segments[0].value).toBe("简单说，AI 的发展历程可以浓缩为四个阶段：");
    expect(segments[1].type).toBe("markdown");
    expect(segments[1].value).toContain("```mermaid");
    expect(segments[1].value).toContain("timeline");
  });

  it("splits text and partial mermaid fenced block when keepText is false", () => {
    const raw = `简单说，AI 的发展历程可以浓缩为四个阶段：

\`\`\`mermaid
timeline
    title AI 发展四阶段
    section 第一阶段
        穷举法
    : 基于规则与计算`;
    // console.log('splits text and partial mermaid fenced block when keepText is false', splitContentSegments(raw));
    const segments = splitContentSegments(raw);
    expect(segments).toHaveLength(1);
    expect(segments[0].type).toBe("markdown");
    expect(segments[0].value).toContain("```mermaid");
    expect(segments[0].value).toContain("timeline");
  });


  it("splits leading text, img, and trailing text when keepText is true", () => {
    const raw = `你好，我是孙志岗，初次见面，很高兴认识你。

<img src="https://resource.ai-shifu.com/ac186b833d0e417fb02737910b3a5ae0" alt="avatar" width="120" height="120" />

为了判断咱们这门课是否真的适合你，我想先了解一下你的基本看法。下面几个观点，你同意吗？

1.  AI 是一种工具
2.  每种 AI 产品都需要学习使用方法
3.  打造 AI 产品是技术高手的事情`;

    const segments = splitContentSegments(raw, true);

    expect(segments).toHaveLength(3);
    expect(segments[0].type).toBe("text");
    expect(segments[0].value).toBe("你好，我是孙志岗，初次见面，很高兴认识你。\n\n");
    expect(segments[1].type).toBe("markdown");
    expect(segments[1].value).toContain("<img");
    expect(segments[2].type).toBe("text");
    expect(segments[2].value).toContain("为了判断咱们这门课是否真的适合你");
    expect(segments[2].value).toContain("AI 是一种工具");
  });


  it("splits leading text, img, and trailing text when keepText is false", () => {
    const raw = `你好，我是孙志岗，初次见面，很高兴认识你。

<img src="https://resource.ai-shifu.com/ac186b833d0e417fb02737910b3a5ae0" alt="avatar" width="120" height="120" />

为了判断咱们这门课是否真的适合你，我想先了解一下你的基本看法。下面几个观点，你同意吗？

1.  AI 是一种工具
2.  每种 AI 产品都需要学习使用方法
3.  打造 AI 产品是技术高手的事情`;

    const segments = splitContentSegments(raw);

    expect(segments).toHaveLength(1);
    expect(segments[0].type).toBe("markdown");
    expect(segments[0].value).toContain("<img");
  });

  it("splits leading text, mermaid, and trailing text when keepText is true", () => {
    const raw = `你好，我是孙志岗，初次见面，很高兴认识你。

\`\`\`mermaid
graph TD
    A[hello] --> B[world]
\`\`\`

为了判断咱们这门课是否真的适合你，我想先了解一下你的基本看法。下面几个观点，你同意吗？

1.  AI 是一种工具
2.  每种 AI 产品都需要学习使用方法
3.  打造 AI 产品是技术高手的事情`;

    const segments = splitContentSegments(raw, true);

    expect(segments).toHaveLength(3);
    expect(segments[0].type).toBe("text");
    expect(segments[0].value).toBe("你好，我是孙志岗，初次见面，很高兴认识你。\n\n");
    expect(segments[1].type).toBe("markdown");
    expect(segments[1].value).toContain("```mermaid");
    expect(segments[2].type).toBe("text");
    expect(segments[2].value).toContain("为了判断咱们这门课是否真的适合你");
    expect(segments[2].value).toContain("AI 是一种工具");
  });

  it("splits leading text, mermaid, and trailing text when keepText is false", () => {
    const raw = `你好，我是孙志岗，初次见面，很高兴认识你。

\`\`\`mermaid
graph TD
    A[hello] --> B[world]
\`\`\`

为了判断咱们这门课是否真的适合你，我想先了解一下你的基本看法。下面几个观点，你同意吗？

1.  AI 是一种工具
2.  每种 AI 产品都需要学习使用方法
3.  打造 AI 产品是技术高手的事情`;

    const segments = splitContentSegments(raw);

    expect(segments).toHaveLength(1);
    expect(segments[0].type).toBe("markdown");
    expect(segments[0].value).toContain("```mermaid");
  });

  it("splits leading text, table, and trailing text when keepText is true", () => {
    const raw = `你好，我是孙志岗，初次见面，很高兴认识你。

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |

为了判断咱们这门课是否真的适合你，我想先了解一下你的基本看法。下面几个观点，你同意吗？

1.  AI 是一种工具
2.  每种 AI 产品都需要学习使用方法
3.  打造 AI 产品是技术高手的事情`;

    const segments = splitContentSegments(raw, true);
    // console.log('splits leading text, table, and trailing text when keepText is true', segments);
    expect(segments).toHaveLength(3);
    expect(segments[0].type).toBe("text");
    expect(segments[0].value).toBe("你好，我是孙志岗，初次见面，很高兴认识你。\n\n");
    expect(segments[1].type).toBe("markdown");
    expect(segments[1].value).toBe(`| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |`);
    expect(segments[2].type).toBe("text");
    expect(segments[2].value).toBe(
      "\n\n为了判断咱们这门课是否真的适合你，我想先了解一下你的基本看法。下面几个观点，你同意吗？\n\n1.  AI 是一种工具\n2.  每种 AI 产品都需要学习使用方法\n3.  打造 AI 产品是技术高手的事情"
    );
  });

  it("splits leading text, table, and trailing text when keepText is false", () => {
    const raw = `你好，我是孙志岗，初次见面，很高兴认识你。

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |

为了判断咱们这门课是否真的适合你，我想先了解一下你的基本看法。下面几个观点，你同意吗？

1.  AI 是一种工具
2.  每种 AI 产品都需要学习使用方法
3.  打造 AI 产品是技术高手的事情`;

    const segments = splitContentSegments(raw);
    // console.log('splits leading text, table, and trailing text when keepText is true', segments);
    expect(segments).toHaveLength(1);
    expect(segments[0].type).toBe("markdown");
    expect(segments[0].value).toBe(`| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |`);
  });

  it("treats streamed svg plus trailing text as markdown", () => {
    const raw =
        '这门课，核心就是讲如何调教 AI 的，目标是帮你成为 AI 的主人。而且，调教的思路非常符合人的直觉，最核心的只需要理解三件事：<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="600" fill="#f5f5f5"/></svg>不是一个技术名词，而是一种工作方式：不追求完全理解每一行代码，更关注“整体是否跑通”“功能是否达成';

    const segments = splitContentSegments(raw);
    expect(segments).toHaveLength(1);
    expect(segments[0].type).toBe("markdown");
    expect(segments[0].value).toContain("<svg");
  });

  it("keeps streamed svg as a single markdown block when keepText is true", () => {
    const raw =
    '这门课，核心就是讲如何调教 AI 的，目标是帮你成为 AI 的主人。而且，调教的思路非常符合人的直觉，最核心的只需要理解三件事：<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="600" fill="#f5';

    const segments = splitContentSegments(raw, true);
   
    // console.log('keeps streamed svg as a single markdown block when keepText is true', segments);
    expect(segments).toHaveLength(2);
    expect(segments[1].type).toBe("markdown");
    expect(segments[1].value).toContain("</svg>");
  });

  it("keeps streamed svg as a single markdown block when keepText is false", () => {
    const raw =
    '这门课，核心就是讲如何调教 AI 的，目标是帮你成为 AI 的主人。而且，调教的思路非常符合人的直觉，最核心的只需要理解三件事：<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="600" fill="#f5';

    const segments = splitContentSegments(raw);
   
    // console.log('keeps streamed svg as a single markdown block when keepText is true', segments);
    expect(segments).toHaveLength(1);
    expect(segments[0].type).toBe("markdown");
    expect(segments[0].value).toContain("</svg>");
  });


  it("keeps long fenced code block as single markdown segment when keepText is true", () => {
    const raw = "```c\n  int a[N][N] = {\n      {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},\n      {1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},\n      {1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1},\n      {1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1},\n      {1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, ";

    const segments = splitContentSegments(raw, true);
   
    expect(segments).toHaveLength(1);
    expect(segments[0].type).toBe("markdown");
    expect(segments[0].value).toContain("```c");
  });


  it("keeps long fenced code block as single markdown segment when keepText is false", () => {
    const raw = "```c\n  int a[N][N] = {\n      {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},\n      {1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},\n      {1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1},\n      {1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1},\n      {1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, ";

    const segments = splitContentSegments(raw);
   
    expect(segments).toHaveLength(1);
    expect(segments[0].type).toBe("markdown");
    expect(segments[0].value).toContain("```c");
  });

  it("keeps markdown table as markdown segment", () => {
    const raw = `## Tables
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |`;

    const segments = splitContentSegments(raw, true);
    expect(segments).toHaveLength(2);
    expect(segments[0].type).toBe("text");
    expect(segments[0].value).toContain("Tables");
    expect(segments[1].type).toBe("markdown");
    expect(segments[1].value).toContain("Header 1");

    const segments2 = splitContentSegments(raw);
    expect(segments2).toHaveLength(1);
    expect(segments2[0].type).toBe("markdown");
    expect(segments2[0].value).toContain("Header 1");
  });

  
});
