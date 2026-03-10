import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Slide from "./Slide";
import type { Element } from "./Slide";

const meta = {
  title: "MarkdownFlow/Slide",
  component: Slide,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    elementList: {
      description: "Slide element data list",
      table: {
        type: {
          summary:
            "{ content: ReactNode; type: string; is_show?: boolean; operation?: string; is_checkpoint?: boolean; serial_number?: number; is_read?: boolean; audio_url?: string; audio_segments?: string[]; }[]",
        },
      },
    },
  },
  args: {
    elementList: [],
  },
} satisfies Meta<typeof Slide>;

export default meta;

type Story = StoryObj<typeof meta>;

const HTML_IFRAME_CONTENT = `
<div class="w-full overflow-hidden flex flex-col items-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
  <div class="w-full max-w-4xl bg-white rounded-3xl shadow-lg p-8 flex flex-col gap-6">
    <h1 class="text-3xl font-bold text-[#0F63EE] text-center">哈喽美少女大战哥斯拉😉</h1>
    <p class="text-lg text-gray-800">现在麻烦你先扫码添加咱们BP刘谊的微信哦，同时需要跟你确认一下你的姓名和你使用的考勤方式。</p>
    <div class="flex justify-center w-full">
      <img src="https://resource.ai-shifu.cn/a428928668b744469e6c761d5249ecbf" alt="扫码添加微信" class="rounded-2xl w-80 h-auto shadow-md" />
    </div>
  </div>
</div>`;

const SVG_CONTENT = `<svg width="420" height="180" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="420" height="180" rx="20" fill="#f5f9ff"/>
  <circle cx="90" cy="90" r="38" fill="#0F63EE"/>
  <text x="90" y="96" text-anchor="middle" font-family="Arial" font-size="14" fill="#ffffff">Input</text>
  <rect x="180" y="55" width="90" height="70" rx="14" fill="#dbeafe" stroke="#0F63EE"/>
  <text x="225" y="96" text-anchor="middle" font-family="Arial" font-size="14" fill="#1e3a8a">Model</text>
  <rect x="320" y="55" width="70" height="70" rx="14" fill="#dcfce7" stroke="#16a34a"/>
  <text x="355" y="96" text-anchor="middle" font-family="Arial" font-size="14" fill="#166534">Output</text>
  <line x1="128" y1="90" x2="180" y2="90" stroke="#0F63EE" stroke-width="3"/>
  <line x1="270" y1="90" x2="320" y2="90" stroke="#16a34a" stroke-width="3"/>
</svg>`;

const DIFF_CONTENT = `**示例**（用户：替换 aaa 为 ddd）：
!+++
--- a/0
+++ b/0
@@ -1,3 +1,3 @@
-<h1>aaa</h1>
+<h1>ddd</h1>
 <h1>bbb</h1>
!+++`;

const IMG_CONTENT = `<img src="https://resource.ai-shifu.cn/7b007ca873b14edeb4d3e6817f520550" />`;

const INTERACTION_CONTENT = `?[%{{teaching_style}} 幽默 | 严谨 | 故事化 | ... 请输入更多偏好 ]`;

const TABLES_CONTENT = `| 阶段 | 输入 | 输出 |
| --- | --- | --- |
| 预处理 | 原始问题 | 结构化数据 |
| 推理 | 上下文 | 候选答案 |
| 生成 | 候选答案 | 最终回复 |`;

const CODE_CONTENT = `\`\`\`typescript
const renderSlide = (type: string, content: string) => ({ type, content });

console.log(renderSlide("code", "Hello Storybook"));
\`\`\``;

const LATEX_CONTENT = `$E = mc^2$\n\n$$
\\int_0^1 x^2 dx = \\frac{1}{3}
$$`;

const MARKDOWN_IMAGE_CONTENT = `![AI Shifu](https://resource.ai-shifu.cn/a428928668b744469e6c761d5249ecbf)`;

const MERMAID_CONTENT = `\`\`\`mermaid
flowchart LR
  A[Prompt] --> B[Parser]
  B --> C[Renderer]
  C --> D[Slide]
\`\`\``;

const TITLE_CONTENT = `# Slide Title\n\n## Subtitle Example`;

const TEXT_CONTENT = `This is a plain text example used to verify that normal text content can still render correctly inside Slide.`;

const LINK_CONTENT = `[OpenAI API Documentation](https://platform.openai.com/docs/overview)`;

const SLOT_CONTENT = (
  <div className="rounded-3xl border border-primary/20 bg-linear-to-br from-primary/8 to-background p-8">
    <div className="flex flex-col gap-3">
      <div className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
        Custom Slot
      </div>
      <div className="text-2xl font-semibold text-foreground">
        这是一个用户自己自定义的画面
      </div>
      <div className="text-sm text-muted-foreground">
        This area is rendered directly from a custom React node.
      </div>
    </div>
  </div>
);

const VIDEO_CONTENT = `<iframe data-tag="video" data-title="哔哩哔哩视频" data-url="https://www.bilibili.com/video/BV1ry4y1y7KZ/" class="w-full aspect-video rounded-lg border-0" src="https://player.bilibili.com/player.html?bvid=BV1ry4y1y7KZ&autoplay=0" allowfullscreen="" allow="autoplay; encrypted-media"></iframe>`;

const createExampleElement = (
  serialNumber: number,
  type: Element["type"],
  content: Element["content"],
  operation: Element["operation"] = "append"
): Element => ({
  content,
  type,
  is_show: true,
  operation,
  is_checkpoint: true,
  serial_number: serialNumber,
  is_read: false,
  audio_url: "",
  audio_segments: [],
});

const exampleElementList: Element[] = [
  createExampleElement(1, "slot", SLOT_CONTENT, "new"),
  createExampleElement(2, "html", HTML_IFRAME_CONTENT),
  createExampleElement(3, "svg", SVG_CONTENT),
  createExampleElement(4, "diff", DIFF_CONTENT),
  createExampleElement(5, "img", IMG_CONTENT),
  createExampleElement(6, "interaction", INTERACTION_CONTENT),
  createExampleElement(7, "tables", TABLES_CONTENT),
  createExampleElement(8, "code", CODE_CONTENT),
  createExampleElement(9, "latex", LATEX_CONTENT),
  createExampleElement(10, "md_img", MARKDOWN_IMAGE_CONTENT),
  createExampleElement(11, "mermaid", MERMAID_CONTENT),
  createExampleElement(12, "title", TITLE_CONTENT),
  createExampleElement(13, "text", TEXT_CONTENT),
  createExampleElement(14, "link", LINK_CONTENT),
  createExampleElement(15, "video", VIDEO_CONTENT),
];

export const Default: Story = {
  args: {
    elementList: exampleElementList,
  },
};

export const FullViewportSlides: Story = {
  args: {
    elementList: exampleElementList,
  },
  render: ({ elementList = [] }) => (
    <div className="w-full">
      {elementList.map((element, index) => (
        <div
          key={`${element.serial_number ?? index}-${element.type}-viewport`}
          className="flex h-[100dvh] w-full items-center justify-center border-b border-dashed border-border bg-muted/20"
        >
          <Slide className="w-full" elementList={[element]} />
        </div>
      ))}
    </div>
  ),
};
