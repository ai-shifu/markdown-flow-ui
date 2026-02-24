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
| Feature | Syntax | Supported |
| --- | --- | --- |
| Heading | ## Title | Yes |
| Video | iframe[data-tag="video"] | Yes |
| SVG | <svg>...</svg> | Yes |

### Markdown Callout Example
> [!NOTE]
> This is a markdown callout example.

### HTML Example
<div style="padding: 12px; border: 1px solid #d4d4d8; border-radius: 8px; background: #f8fafc;">
  This is a sandbox HTML block.
</div>

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
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="whitespace-pre-wrap break-words rounded-md border border-zinc-200 bg-white p-4 text-sm leading-6 text-zinc-900">
            {SPLIT_CONTENT_VALIDATION_MARKDOWN}
          </div>
          <div>
            {renderSegmentList(
              "splitContentSegments(content, true)",
              segmentsWithText
            )}
          </div>
        </div>
      </div>
    );
  },
};
