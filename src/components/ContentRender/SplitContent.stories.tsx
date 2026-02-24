import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import ContentRender from "./ContentRender";
import { splitContentSegments } from "./utils/split-content";

const SPLIT_CONTENT_VALIDATION_MARKDOWN = `Intro text for split-content validation.

## Heading: Split Content Validation

This story includes examples for verifying segmentation behavior.

### Link Example
Visit [AI Shifu](https://ai-shifu.com) and [OpenAI](https://openai.com).

### Markdown Blockquote
> This is a markdown quote.
> This is the second line of the quote.

### List Example
- Unordered item A
- Unordered item B
  - Nested item B.1
1. Ordered item 1
2. Ordered item 2

### Markdown Image Example
![Markdown Image Example](https://picsum.photos/seed/markdown-flow/640/320)

### HTML Image Example
<img src="https://picsum.photos/seed/html-image/320/180" alt="HTML image example" width="320" height="180" />

### Code Block Example
\`\`\`ts
const greet = (name: string) => {
  console.log(\`Hello, \${name}\`);
};

greet("split-content");
\`\`\`

### Mermaid Example
\`\`\`mermaid
flowchart LR
  A[Split Input] --> B{Detect Segment Type}
  B -->|markdown| C[Markdown Segment]
  B -->|sandbox| D[Sandbox Segment]
  B -->|text| E[Text Segment]
\`\`\`

### Markdown Table Example
| 对比维度 | 传统课件/录播课 | AI 师傅平台创作的课程 |\n| :--- | :--- | :--- |\n| **个性化教学** | 内容固定，无法因人调整。比如教“宝宝辅食”，无法根据学员孩子的月龄、过敏史定制食谱。 | **内容完全动态生成**，贴合每位学员的具体情况。比如学员输入“10个月大、对鸡蛋过敏的宝宝”，课程会自动生成专属的辅食方案与注意事项。 |\n| **24小时答疑** | 学员问题无法及时解答，学习容易卡壳、放弃。 | 内置**24小时AI助教**，随时回答学员追问。比如学员半夜哄睡孩子后突然想起问题：“孩子积食了，你教的山楂水能加冰糖吗？”AI助教能立刻给出专业解答，让教学服务不间断。 |\n| **课程制作成本** | 需要专业设备录制、剪辑，耗时耗力，对个人创作者门槛高。 | **无需出镜、无需剪辑**。你只需像写一份详细的教学指导书（提示词），AI就能基于它生成生动课程。让你能轻松、低成本地将知识产品化。 |\n| **互动学习体验** | 单向灌输，学员被动观看，容易走神。 | **强互动式学习**。课程中可穿插提问、练习、情景模拟。比如教“家庭预算规划”，可以让学员直接输入自家收支，AI即时生成分析报告并给出调整建议，学完就能用。 |


### Markdown Callout Example
> [!NOTE]
> This is a markdown callout example.

### HTML Example
<div style="padding: 12px; border: 1px solid #d4d4d8; border-radius: 8px; background: #f8fafc;">
  This is a sandbox HTML block.
</div>
<script>console.log('script block');</script>

### SVG Example
<svg width="360" height="120" viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="360" height="120" fill="#eef4ff" rx="10"/>
  <circle cx="56" cy="60" r="28" fill="#0F63EE"/>
  <text x="104" y="56" font-size="18" fill="#0F63EE" font-family="Arial, sans-serif">SVG Segment</text>
  <text x="104" y="82" font-size="13" fill="#1f2937" font-family="Arial, sans-serif">Inline SVG should be markdown.</text>
</svg>

### Video Example
<iframe data-tag='video' data-title='Demo Video' src='https://player.bilibili.com/player.html?bvid=BV1ry4y1y7KZ&autoplay=0' class='w-full aspect-video rounded-lg border-0' allowfullscreen></iframe>

Final trailing text.`;

const typeTagClassMap = {
  text: "bg-amber-500 text-white",
  markdown: "bg-blue-600 text-white",
  sandbox: "bg-emerald-600 text-white",
} satisfies Record<"markdown" | "sandbox" | "text", string>;

const meta = {
  title: "MarkdownFlow/ContentRender/Split Content Validation",
  component: ContentRender,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  args: {
    content: SPLIT_CONTENT_VALIDATION_MARKDOWN,
    enableTypewriter: false,
  },
} satisfies Meta<typeof ContentRender>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SplitContentValidation: Story = {
  render: (args) => {
    const segmentsWithText = splitContentSegments(args.content, true);

    const renderSegmentList = (
      title: string,
      segments: Array<{ type: "markdown" | "sandbox" | "text"; value: string }>
    ) => (
      <section className="rounded-md border border-zinc-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
        <p className="mt-1 text-xs text-zinc-500">Total: {segments.length}</p>
        <div className="mt-3 space-y-2">
          {segments.map((segment, index) => (
            <div
              key={`${title}-${segment.type}-${index}`}
              className="rounded border border-zinc-200 bg-zinc-50 p-3"
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${typeTagClassMap[segment.type]}`}
                >
                  {segment.type}
                </span>
                <span className="text-xs text-zinc-500">#{index + 1}</span>
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs leading-5 text-zinc-700">
                {segment.value}
              </pre>
            </div>
          ))}
        </div>
      </section>
    );

    return (
      <div className="mx-auto w-full max-w-[1600px] p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="whitespace-pre-wrap break-words rounded-md border border-zinc-200 bg-white p-4 text-sm leading-6 text-zinc-900">
            {SPLIT_CONTENT_VALIDATION_MARKDOWN}
          </div>
          <div>
            {renderSegmentList(
              "splitContentSegments(content, true)",
              segmentsWithText
            )}
          </div>
          <div className="border p-4">
            <h1 className="text-lg font-semibold text-zinc-900">
              ContentRender
            </h1>
            <ContentRender content={SPLIT_CONTENT_VALIDATION_MARKDOWN} />
          </div>
        </div>
      </div>
    );
  },
};
