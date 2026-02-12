import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import ContentRender from "./ContentRender";
import IframeSandbox from "./IframeSandbox";

const meta = {
  title: "MarkdownFlow/ContentRender",
  component: ContentRender,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    content: {
      control: "text",
      description: "Markdown content to render",
    },
  },
  args: { content: "" },
} satisfies Meta<typeof ContentRender>;

export default meta;
type Story = StoryObj<typeof meta>;

// ==============================================================================
// Markdown Test Content Constants
// ==============================================================================

const COMPREHENSIVE_MARKDOWN_SYNTAX = `# Complete Markdown Syntax Test
## Heading Levels
### H3 Heading
#### H4 Heading
##### H5 Heading
###### H6 Heading

## Text Formatting
**Bold text**, *italic text*, ~~strikethrough text~~, and \`inline code\`

## Lists

### Unordered Lists
- First item
- Second item
  - Nested item 1
  - Nested item 2
    - Deep nesting
- Third item

### Ordered Lists
1. First item
2. Second item
   1. Nested item 1
   2. Nested item 2
      1. Deep nested item
3. Third item

## Links and Images

Link:

[AI-Shifu Link](https://ai-shifu.cn/)

Image:

![Image Description](https://ai-shifu.cn/imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:2000/height:2000/https:/cdn.gamma.app/51wyzvm6tssdgg1/c8d63919f06741bb8967fa6af3a299f2/original/Cai-Se-logo-Dai-Wen-Zi-Gao-Du-Liu-Bai-h110.png)

## Video

<iframe data-tag="video" data-title="哔哩哔哩视频" data-url="https://www.bilibili.com/video/BV1ry4y1y7KZ/" class="w-full aspect-video rounded-lg border-0" src="https://player.bilibili.com/player.html?bvid=BV1ry4y1y7KZ&autoplay=0" allowfullscreen="" allow="autoplay; encrypted-media"></iframe>

## Blockquotes
> This is a blockquote
> Second line of quote
> > Nested blockquote

## Code Blocks
\`\`\`javascript
// JavaScript code block
function hello() {
  console.log("Hello World!\n");
}
\`\`\`

\`\`\`python
# Python code block
def hello():
    print("Hello World!")
\`\`\`

\`\`\`c
int maze[5][5] = {
    {1, 1, 1, 1, 1},
    {1, 2, 0, 0, 1},
    {1, 1, 1, 0, 1},
    {1, 0, 0, 0, 0},
    {1, 1, 1, 1, 1}
};
\`\`\`
\`\`\`html
<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="600" height="400" fill="#f5f5f5"/>

  <!-- 标题 -->
  <text x="300" y="40" text-anchor="middle" font-family="Arial" font-size="20" font-weight="bold">AI 早期形态：穷举法的局限</text>

  <!-- 时间线 -->
  <line x1="50" y1="80" x2="550" y2="80" stroke="#333" stroke-width="2"/>
  <text x="50" y="75" text-anchor="middle" font-family="Arial" font-size="12">1950s</text>
  <text x="300" y="75" text-anchor="middle" font-family="Arial" font-size="12">1997</text>
  <text x="550" y="75" text-anchor="middle" font-family="Arial" font-size="12">Now</text>

  <!-- 早期AI -->
  <circle cx="50" cy="150" r="30" fill="#ff9999"/>
  <text x="50" y="150" text-anchor="middle" font-family="Arial" font-size="10" fill="white">早期AI</text>
  <text x="50" y="190" text-anchor="middle" font-family="Arial" font-size="10">让机器像人一样思考</text>

  <!-- 深蓝 -->
  <circle cx="300" cy="150" r="40" fill="#99ccff"/>
  <text x="300" y="150" text-anchor="middle" font-family="Arial" font-size="12" fill="white">深蓝</text>
  <text x="300" y="200" text-anchor="middle" font-family="Arial" font-size="10">击败国际象棋冠军</text>

  <!-- 箭头连接 -->
  <line x1="80" y1="150" x2="260" y2="150" stroke="#333" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- 穷举法原理 -->
  <rect x="100" y="250" width="200" height="60" fill="#ccffcc" stroke="#333"/>
  <text x="200" y="270" text-anchor="middle" font-family="Arial" font-size="12">穷举法原理</text>
  <text x="200" y="290" text-anchor="middle" font-family="Arial" font-size="10">速度优势 · 重复计算</text>

  <!-- 局限性 -->
  <rect x="350" y="250" width="200" height="60" fill="#ffcc99" stroke="#333"/>
  <text x="450" y="270" text-anchor="middle" font-family="Arial" font-size="12">核心局限性</text>
  <text x="450" y="290" text-anchor="middle" font-family="Arial" font-size="10">只能解决有限计算量问题</text>

  <!-- 连接线 -->
  <line x1="300" y1="190" x2="300" y2="240" stroke="#333" stroke-width="1"/>
  <line x1="300" y1="240" x2="200" y2="240" stroke="#333" stroke-width="1" marker-end="url(#arrow)"/>
  <line x1="300" y1="240" x2="400" y2="240" stroke="#333" stroke-width="1" marker-end="url(#arrow)"/>

  <!-- 底部结论 -->
  <text x="300" y="350" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold">绝大多数现实问题无法用穷举解决</text>

  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#333"/>
    </marker>
  </defs>
</svg>
\`\`\`



Inline code: \`\`\` console.log("Hello World!"); \`\`\`

## Tables
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

## Custom Variable Syntax Examples

### Format 1: Multiple Buttons + Placeholder
Choose your profession: ?[%{{occupation}}Warrior|Mage|Rogue|... Other profession]

### Format 2: Multiple Buttons (with spaces)
Select color: ?[%{{ color }} Red | Blue | Green ]

### Format 3: Single Button (with spaces)
Confirm submission: ?[%{{ submit }} Confirm ]

### Format 4: Placeholder (with spaces)
Enter username: ?[%{{ username }} ... Please enter username ]

### Mixed Formats
1. No spaces: ?[%{{quick}}Option1|Option2]
2. With spaces: ?[%{{ variable }} Option A | Option B | ... Custom option]
3. Complex combination: ?[%{{ complex }} Step 1 | Step 2 | Step 3 | ... Other steps]

## Horizontal Rules
---

## HTML Embedding
<p style="color: blue;">This is an HTML paragraph</p>

## Task Lists
- [x] Completed task
- [ ] Incomplete task
- [ ] Another incomplete task

## Footnotes
This is text with a footnote[^1]
[^1]: Footnote content

## Emoji
:smile: :heart: :+1:

## Escape Characters
\\*not italic\\*, \\[not a link\\]

## Math Formulas (partial Markdown support)
$$
a^2 + b^2 = c^2
$$

## Conclusion
This demonstrates various Markdown syntax elements, including custom variable syntax.`;

const MATH_AND_MERMAID_CONTENT = `# Math Formulas and Mermaid Charts Demo

## Math Formulas

### Inline Formulas
This is an inline math formula: $E = mc^2$, Einstein's mass-energy equivalence.

When $a \\\\ne 0$, the quadratic equation $ax^2 + bx + c = 0$ has two solutions: $x = \\\\frac{-b \\\\pm \\\\sqrt{b^2-4ac}}{2a}$

### Block Formulas

Pythagorean theorem:
$$a^2 + b^2 = c^2$$

Newton's second law:
$$F = ma$$

Integration:
$$\\\\int_{a}^{b} x^2 dx = \\\\left[\\\\frac{x^3}{3}\\\\right]_{a}^{b} = \\\\frac{b^3 - a^3}{3}$$

## Mermaid Charts

### Flowchart
\`\`\`mermaid
flowchart TD
    A[Start] --> B{Is User?}
    B -->|Yes| C[Show User Interface]
    B -->|No| D[Show Error]
    C --> E[User Operation]
    E --> F{Operation Success?}
    F -->|Yes| G[Show Success Message]
    F -->|No| H[Show Error Message]
    G --> I[End]
    H --> I
    D --> I
\`\`\`

### Sequence Diagram
\`\`\`mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Database

    User->>Frontend: Login Request
    Frontend->>API: Send Authentication
    API->>Database: Verify Credentials
    Database-->>API: Return User Info
    API-->>Frontend: Return Auth Result
    Frontend-->>User: Display Login Status
\`\`\`

### Pie Chart
\`\`\`mermaid
pie title Programming Language Usage Statistics
    "JavaScript" : 42.7
    "Python" : 31.1
    "Java" : 16.2
    "TypeScript" : 6.1
    "Others" : 3.9
\`\`\`

## Custom Variable Example

Please select a math concept you'd like to learn: ?[%{{math_concept}}Calculus|Linear Algebra|Probability|...Other concepts]

You selected **{{math_concept}}**, which is a very important mathematical field!

## Conclusion

This example demonstrates that our Markdown renderer now supports:
- Inline and block math formulas (using KaTeX)
- Multiple Mermaid chart types
- Perfect integration with existing custom variable functionality

This greatly enhances content expressiveness and interactivity!

`;

const MULTI_SELECT_EXAMPLES = `# Multi-Select Feature Examples

## Basic Multi-Select

Choose your favorite programming languages (select multiple):
?[%{{programming_languages}}JavaScript||Python||TypeScript||Java||Go||Rust]

## Multi-Select with Text Input

Select features you want and describe any additional requirements:
?[%{{features}}User Authentication||API Integration||Database Support||File Upload||...Additional requirements]

## Mixed Single and Multi-Select Examples

### Single Selection (traditional buttons)
Choose your experience level: ?[%{{experience}}Beginner|Intermediate|Advanced]

### Multi-Selection (checkboxes + confirm)
Select technologies you're interested in:
?[%{{technologies}}React||Vue||Angular||Svelte||Next.js||Nuxt.js]

### Text Only Input
Enter your project name: ?[%{{project_name}}...Project name]

### Single Button with Text
Choose action and add comment: ?[%{{action}}Approve|Reject|...Add your comment]

## Complex Multi-Select Scenarios

### Skills Assessment
Select all skills you have (choose multiple):
?[%{{skills}}HTML/CSS||JavaScript||TypeScript||React||Vue.js||Node.js||Python||Java||Database Design||API Development]

### Restaurant Order
Choose your toppings (multiple selections allowed):
?[%{{toppings}}Cheese||Pepperoni||Mushrooms||Onions||Bell Peppers||Olives||Tomatoes||...Special instructions]

## Comparison: Single vs Multi-Select

**Single Select (radio-style buttons):**
Pick one main technology: ?[%{{main_tech}}Frontend|Backend|Mobile|DevOps]

**Multi-Select (checkbox-style):**
Areas of expertise (select all that apply):
?[%{{expertise}}Frontend Development||Backend Development||Mobile Development||DevOps||UI/UX Design||Data Science]

**Mixed Mode:**
Choose primary role and additional skills:
Primary: ?[%{{primary_role}}Developer|Designer|Manager|QA]
Additional skills: ?[%{{additional_skills}}Leadership||Teaching||Project Management||Technical Writing||...Other skills]

## Interactive Flow Example

1. **First, choose your role:**
   ?[%{{user_role}}Student|Professional|Freelancer|Entrepreneur]

2. **Then select your interests (multiple):**
   ?[%{{interests}}Web Development||Mobile Apps||AI/ML||Data Science||Cybersecurity||Game Development||...Other interests]

3. **Finally, tell us about your goals:**
   ?[%{{goals}}...What do you want to achieve?]

This demonstrates the power of combining single-select, multi-select, and text input modes in a conversational flow!`;

const NATIVE_HTML_CONTENT = `# Native HTML Showcase
<div style="font-family: sans-serif; padding: 20px; background-color: #f0f4ff; border-radius: 12px; color: #333;">
  <div style="margin-bottom: 20px; border-left: 5px solid #0F63EE; padding-left: 15px;">
    <p style="font-weight: bold; color: #0F63EE; margin: 0;">AI 正在思考下一个字...</p>
  </div>

  <div style="display: flex; flex-direction: column; gap: 15px;">
    <!-- Step 1 -->
    <div style="display: flex; align-items: center; gap: 10px;">
      <div style="background: #fff; padding: 8px 12px; border-radius: 6px; border: 1px solid #0F63EE; min-width: 100px;">床前明月光,</div>
      <div style="color: #0F63EE;">→</div>
      <div style="display: flex; gap: 5px;">
        <div style="background: #0F63EE; color: white; padding: 5px 10px; border-radius: 4px; font-size: 14px;">疑 (99%)</div>
        <div style="background: #e0e0e0; padding: 5px 10px; border-radius: 4px; font-size: 14px;">看 (0.5%)</div>
        <div style="background: #e0e0e0; padding: 5px 10px; border-radius: 4px; font-size: 14px;">有 (0.2%)</div>
      </div>
    </div>

    <!-- Step 2 -->
    <div style="display: flex; align-items: center; gap: 10px;">
      <div style="background: #fff; padding: 8px 12px; border-radius: 6px; border: 1px solid #0F63EE; min-width: 100px;">床前明月光，</div>
      <div style="color: #0F63EE;">→</div>
      <div style="display: flex; gap: 5px;">
        <div style="background: #0F63EE; color: white; padding: 5px 10px; border-radius: 4px; font-size: 14px;">疑 (99%)</div>
        <div style="background: #e0e0e0; padding: 5px 10px; border-radius: 4px; font-size: 14px;">看 (0.5%)</div>
        <div style="background: #e0e0e0; padding: 5px 10px; border-radius: 4px; font-size: 14px;">有 (0.2%)</div>
      </div>
    </div>
  </div>
</div>

<section>
  <h2>Classic HTML Elements</h2>
  <p>
    <mark>Highlighted text</mark> can sit beside <code>inline code</code> and
    <em>italic text</em> without losing Markdown capabilities.
  </p>
  <details open>
    <summary>Expandable Details</summary>
    <p>
      Native HTML tags now render as expected, so you can mix structured
      callouts, <strong>emphasis</strong>, and custom layouts.
    </p>
  </details>
  <div style="display: flex; gap: 1rem; align-items: center;">
    <span style="font-weight: 600;">Progress:</span>
    <progress value="70" max="100">70%</progress>
    <meter min="0" max="100" high="80" value="65">65%</meter>
  </div>
  <blockquote>
    <p>
      You can style content with inline CSS, such as
      <span style="color: #6366f1;">accent colors</span>, to highlight
      important information.
    </p>
  </blockquote>
</section>
`;
const CODE_BLOCK_SHOWCASE = String.raw`
\`\`\`js
console.log("Highlight.js \n keeps syntax styling consistent");
\`\`\`
\`\`\`c
printf("You win!\\n");
\`\`\`
\`\`\`svg
<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="600" height="400" fill="#f5f5f5"/>

  <!-- 标题 -->
  <text x="300" y="40" text-anchor="middle" font-family="Arial" font-size="20" font-weight="bold">AI 早期形态：穷举法的局限</text>

  <!-- 时间线 -->
  <line x1="50" y1="80" x2="550" y2="80" stroke="#333" stroke-width="2"/>
  <text x="50" y="75" text-anchor="middle" font-family="Arial" font-size="12">1950s</text>
  <text x="300" y="75" text-anchor="middle" font-family="Arial" font-size="12">1997</text>
  <text x="550" y="75" text-anchor="middle" font-family="Arial" font-size="12">Now</text>

  <!-- 早期AI -->
  <circle cx="50" cy="150" r="30" fill="#ff9999"/>
  <text x="50" y="150" text-anchor="middle" font-family="Arial" font-size="10" fill="white">早期AI</text>
  <text x="50" y="190" text-anchor="middle" font-family="Arial" font-size="10">让机器像人一样思考</text>

  <!-- 深蓝 -->
  <circle cx="300" cy="150" r="40" fill="#99ccff"/>
  <text x="300" y="150" text-anchor="middle" font-family="Arial" font-size="12" fill="white">深蓝</text>
  <text x="300" y="200" text-anchor="middle" font-family="Arial" font-size="10">击败国际象棋冠军</text>

  <!-- 箭头连接 -->
  <line x1="80" y1="150" x2="260" y2="150" stroke="#333" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- 穷举法原理 -->
  <rect x="100" y="250" width="200" height="60" fill="#ccffcc" stroke="#333"/>
  <text x="200" y="270" text-anchor="middle" font-family="Arial" font-size="12">穷举法原理</text>
  <text x="200" y="290" text-anchor="middle" font-family="Arial" font-size="10">速度优势 · 重复计算</text>

  <!-- 局限性 -->
  <rect x="350" y="250" width="200" height="60" fill="#ffcc99" stroke="#333"/>
  <text x="450" y="270" text-anchor="middle" font-family="Arial" font-size="12">核心局限性</text>
  <text x="450" y="290" text-anchor="middle" font-family="Arial" font-size="10">只能解决有限计算量问题</text>

  <!-- 连接线 -->
  <line x1="300" y1="190" x2="300" y2="240" stroke="#333" stroke-width="1"/>
  <line x1="300" y1="240" x2="200" y2="240" stroke="#333" stroke-width="1" marker-end="url(#arrow)"/>
  <line x1="300" y1="240" x2="400" y2="240" stroke="#333" stroke-width="1" marker-end="url(#arrow)"/>

  <!-- 底部结论 -->
  <text x="300" y="350" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold">绝大多数现实问题无法用穷举解决</text>

  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#333"/>
    </marker>
  </defs>
</svg>
\`\`\`

`;

// ==============================================================================
// Story Definitions
// ==============================================================================

export const ComprehensiveMarkdownSyntax: Story = {
  name: "Comprehensive Markdown Syntax",
  args: {
    content: COMPREHENSIVE_MARKDOWN_SYNTAX,
    enableTypewriter: false,
  },
};

export const MarkdownSyntaxWithTypewriter: Story = {
  name: "Markdown Syntax + Typewriter Effect",
  args: {
    content: COMPREHENSIVE_MARKDOWN_SYNTAX,
    enableTypewriter: true,
  },
};

export const MathAndMermaidDemo: Story = {
  name: "Math Formulas + Mermaid Charts",
  args: {
    content: MATH_AND_MERMAID_CONTENT,
    enableTypewriter: false,
  },
};

export const MermaidWithTypewriter: Story = {
  name: "Mermaid Charts + Typewriter Effect",
  args: {
    content: `## Streaming Mermaid Demo
\`\`\`mermaid
flowchart LR
  Typing -->|tokens| Mermaid
  Mermaid -->|partial| Flicker[Flash?]
  Flicker -->|fix| Stable[[Stable Preview]]
\`\`\`
AI 助手正在输出 Mermaid 代码，Typewriter 也会把它分段展示
\`\`\`mermaid
graph TD
    A[硬盘里的空文件] -->|预训练| B[读完 40TB 书报代码]
    B -->|后训练| C[大语言模型 LLM]
    C -->|封装| D[ChatGPT/文心一言/通义千问]
\`\`\`
AI 助手正在输出 Mermaid 代码，Typewriter 也会把它分段展示
`,
    enableTypewriter: true,
  },
};

export const ContentRenderMathAndMermaid: Story = {
  args: {
    enableTypewriter: false,
    content: `# 数学公式和图表展示

## HTML 展示

<a href="https://bolt.new/" target="_blank"> ?点击进入Bolt </a>

## 数学公式

### 行内公式
这是一个行内数学公式：$E = mc^2$，爱因斯坦的质能方程。

当 $a \\\\ne 0$ 时，一元二次方程 $ax^2 + bx + c = 0$ 有两个解：$x = \\\\frac{-b \\\\pm \\\\sqrt{b^2-4ac}}{2a}$

### 块级公式

勾股定理：
$$a^2 + b^2 = c^2$$

牛顿第二定律：
$$F = ma$$

积分：
$$\\\\int_{a}^{b} x^2 dx = \\\\left[\\\\frac{x^3}{3}\\\\right]_{a}^{b} = \\\\frac{b^3 - a^3}{3}$$

## Mermaid 图表

### 流程图
\`\`\`mermaid
flowchart TD
    A[开始] --> B{是否为用户?}
    B -->|是| C[显示用户界面]
    B -->|否| D[显示错误]
    C --> E[用户操作]
    E --> F{操作成功?}
    F -->|是| G[显示成功信息]
    F -->|否| H[显示错误信息]
    G --> I[结束]
    H --> I
    D --> I
\`\`\`

### 时序图
\`\`\`mermaid
sequenceDiagram
    participant 用户
    participant 前端
    participant API
    participant 数据库

    用户->>前端: 登录请求
    前端->>API: 发送认证信息
    API->>数据库: 验证用户凭据
    数据库-->>API: 返回用户信息
    API-->>前端: 返回认证结果
    前端-->>用户: 显示登录状态
\`\`\`

### 饼图
\`\`\`mermaid
pie title 编程语言使用统计
    "JavaScript" : 42.7
    "Python" : 31.1
    "Java" : 16.2
    "TypeScript" : 6.1
    "其他" : 3.9
\`\`\`

## 自定义变量示例

请选择你想了解的数学概念：?[%{{math_concept}}微积分|线性代数|概率论|...其他概念]

你选择了 **{{math_concept}}**，这是一个非常重要的数学分支！

## 结论

通过以上示例可以看到，我们的 Markdown 渲染器现在支持：
- 行内和块级数学公式（使用 KaTeX）
- 多种 Mermaid 图表类型
- 与现有自定义变量功能的完美结合

这大大增强了内容的表现力和交互性！`,
  },
};

export const CustomButtonAfterContentDemo: Story = {
  name: "Custom Button After Content",
  args: {
    content: `## 自定义按钮演示

当内容渲染完成后，我们可以通过 \`<custom-button-after-content>\` 标签渲染一个按钮。

点击下方按钮可以触发 Storybook 控制台中的自定义回调。<custom-button-after-content><img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f680.svg" alt="icon" width="16" height="16" loading="lazy" /><span>点击自定义按钮</span></custom-button-after-content>

---

你可以在实际项目中将该回调用于展开追问输入框、重新生成内容等场景。`,
    onClickCustomButtonAfterContent: () => {
      console.log("custom-button-after-content clicked");
    },
    enableTypewriter: false,
  },
};

export const MermaidErrorHandlingTest: Story = {
  name: "Mermaid Error Handling Test",
  args: {
    enableTypewriter: false,
    content: `# Mermaid Error Handling Test

## Valid Mermaid Chart
\`\`\`mermaid
graph TD
    A[Start] --> B[End]
\`\`\`

\`\`\`mermaid\ngraph TD\n    A[大语言模型] --> B(对话助手)\n    A --> C(AI 写作)\n    A --> D(智能办公)\n    A --> E(编程辅助)\n\`\`\`\n


## Invalid Mermaid Chart 1 - Missing Arrow
\`\`\`mermaid
graph TD
    A[Start] B[End]
    C --> D
\`\`\`

## Invalid Mermaid Chart 2 - Wrong Syntax
\`\`\`mermaid
flowchart XYZ
    A[Start] --> B{Decision}
    wrongkeyword --> D[End]
\`\`\`

## Invalid Mermaid Chart 3 - Completely Wrong Content
\`\`\`mermaid
This is not mermaid syntax at all
Just some random text
With some --> arrows
And [bracket] content
\`\`\`

## Invalid Mermaid Chart 4 - Empty Content
\`\`\`mermaid

\`\`\`

This test demonstrates the new error handling mechanism. Invalid Mermaid charts now show friendly error messages with helpful syntax hints instead of crashing or showing confusing error messages.
`,
  },
};

export const MultiSelectExamples: Story = {
  name: "Multi-Select Feature Examples",
  args: {
    content: MULTI_SELECT_EXAMPLES,
    enableTypewriter: false,
    onSend: (params) => {
      console.log("Multi-select callback received:", params);
      alert(`Received data:\n${JSON.stringify(params, null, 2)}`);
    },
  },
};

export const MultiSelectWithTypewriter: Story = {
  name: "Multi-Select + Typewriter Effect",
  args: {
    content: MULTI_SELECT_EXAMPLES,
    enableTypewriter: true,
    typingSpeed: 20,
    onSend: (params) => {
      console.log("Multi-select callback received:", params);
      alert(`Received data:\n${JSON.stringify(params, null, 2)}`);
    },
  },
};

export const InteractiveMultiSelectDemo: Story = {
  name: "Interactive Multi-Select Demo",
  args: {
    content: `# Interactive Multi-Select Demo

Welcome! Let's test the multi-select functionality.

## Step 1: Choose Your Interests (Multi-Select)
Select all topics that interest you:
?[%{{interests}}Web Development||Mobile Development||AI/Machine Learning||Data Science||Cybersecurity||Game Development||DevOps||UI/UX Design]

## Step 2: Primary Focus (Single Select)
What's your primary focus area?
?[%{{primary_focus}}Frontend|Backend|Full Stack|Mobile|Data|AI/ML]

## Step 3: Experience Level (Single Select)
How would you describe your experience level?
?[%{{experience}}Beginner|Intermediate|Advanced|Expert]

## Step 4: Learning Goals (Multi-Select with Text)
What would you like to learn or improve? Select options and add custom goals:
?[%{{learning_goals}}React/Next.js||Vue/Nuxt.js||Node.js||Python||Machine Learning||Cloud Computing||...Other specific goals]

## Step 5: Additional Comments
Any additional thoughts or questions?
?[%{{comments}}...Feel free to share your thoughts]

---

Try interacting with the elements above to see how single-select (buttons) and multi-select (checkboxes + confirm button) work differently!`,
    enableTypewriter: false,
    confirmButtonText: "Submit", // English confirm button
    onSend: (params) => {
      console.log("Interaction received:", params);

      // Create a more detailed alert message
      let message = "Form Data Received:\n\n";
      if (params.variableName) {
        message += `Variable: ${params.variableName}\n`;
      }
      if (params.buttonText) {
        message += `Button: ${params.buttonText}\n`;
      }
      if (params.selectedValues && params.selectedValues.length > 0) {
        message += `Selected: ${params.selectedValues.join(", ")}\n`;
      }
      if (params.inputText) {
        message += `Input: ${params.inputText}\n`;
      }

      alert(message);
    },
  },
};

export const ChineseMultiSelectDemo: Story = {
  name: "Chinese Multi-Select Demo (中文示例)",
  args: {
    content: `# 多选功能中文演示

欢迎体验多选功能！
## 全面测试（单选）
单选没有选项
?[%{{answer}}]
?[%{{answer}}...]
?[继续]

单选有选项
?[%{{answer}}选项A|选项B|选项C]
单选有选项和输入框
?[%{{answer}}选项A|选项B|选项C|...其他选项]
单选有输入框
?[%{{answer}}...其他选项]


## 第一步：选择你的兴趣（多选）
选择所有你感兴趣的主题：
?[%{{interests}}Web开发||移动开发||人工智能||数据科学||网络安全||游戏开发||运维||UI/UX设计]

## 第二步：主要方向（单选）
你的主要专业方向是？
?[%{{primary_focus}}前端|后端|全栈|移动端|数据|人工智能]

## 第三步：经验水平（单选）
你如何描述自己的经验水平？
?[%{{experience}}初学者|中级|高级|专家]

## 第四步：学习目标（多选+文本，测试多行的情况）
你想学习或提升什么？选择选项并添加自定义目标：
?[%{{learning_goals}}React/Next.js||Vue/Nuxt.js||Node.js||Python||机器学习||云计算||...其他具体目标]

## 第四步：学习目标（多选+文本，测试一行的情况）
你想学习或提升什么？选择选项并添加自定义目标：
?[%{{learning_goals}}React/Next.js||Vue/Nuxt.js||...其他具体目标]

## 第五步：学习意图（单选+文本，测试多行的情况）
你主要想学习什么？选择选项并添加自定义目标：
?[%{{learning_goals}}React/Next.js|Vue/Nuxt.js|Node.js|Python|React Native|Flutter|...其他具体目标]

## 第五步：学习意图（单选+文本， 测试一行的情况）
你主要想学习什么？选择选项并添加自定义目标：
?[%{{learning_goals}}React/Next.js|Vue/Nuxt.js|...其他具体目标]

## 第六步：补充说明（文本）
还有什么想法或问题吗？
?[%{{comments}}...请分享你的想法]


---

尝试与上面的元素交互，体验单选（按钮）和多选（复选框+确认按钮）的不同工作方式！`,
    enableTypewriter: false,
    // defaultButtonText: '继续',
    // defaultInputText: `我就是测试一下超长超长我就是测试一下超长超长我就是测试一下超长超长我就是测试一下超长超长我就是测试一下超长超一下超长一下超长长`,
    confirmButtonText: "提交", // Chinese confirm button
    beforeSend: (params) => {
      console.log("beforeSend", params);
      return true;
    },
    onSend: (params) => {
      console.log("收到交互数据:", params);

      // Create a more detailed alert message in Chinese
      let message = "收到的表单数据：\n\n";
      if (params.variableName) {
        message += `变量名: ${params.variableName}\n`;
      }
      if (params.buttonText) {
        message += `按钮: ${params.buttonText}\n`;
      }
      if (params.selectedValues && params.selectedValues.length > 0) {
        message += `选择项: ${params.selectedValues.join(", ")}\n`;
      }
      if (params.inputText) {
        message += `输入: ${params.inputText}\n`;
      }

      alert(message);
    },
  },
};

export const NativeHtmlElements: Story = {
  name: "Native HTML Elements",
  args: {
    enableTypewriter: false,
    content: NATIVE_HTML_CONTENT,
  },
};

export const CodeBlockShowcase: Story = {
  name: "Code Block Showcase",
  args: {
    enableTypewriter: false,
    content: CODE_BLOCK_SHOWCASE,
  },
};

export const EnglishChineseTypographyPreview: Story = {
  name: "English + 中文 Typography",
  args: {
    enableTypewriter: false,
    content: `# Typography Preview

## English Section
Hey there, I’m Zhigang Sun—pleased to meet you. I founded AI Shifu, used to teach at Harbin Institute of Technology as an associate professor, then built products at NetEase and Dedao. My turf has always been the crossroads of internet, AI, and education.
> English quote: "Great typography lets the story shine."

Hello there, I’m Sun Zhigang—delighted to meet you for the first time.
Its “memory” is a sandbox you can shape, trim, or flood at will.


- Headline sample
- Body paragraph sample
- Caption text sample

## 中文部分
欢迎来到字体测试场景，这里可以检查中文标题、正文和引用的展示效果。默认段落行高需要让多行文字保持舒适的阅读体验。

**中文粗体**、*中文斜体* 与 1234567890 同时出现，确保数字和文字的组合也正常。

> 中文引用：「好排版能帮助读者迅速理解内容。」

- 项目一：中文列表
- 项目二：强调不同字号
- 项目三：中英文混排 test

最后一段混排：Design with empathy, 用心打磨体验。
`,
  },
};

export const SVGDemo: Story = {
  name: "SVG 展示",
  args: {
    content: `
好的，**111**。我将为您介绍烟花（爆竹）在春节中的历史与角色演变。\n\n烟花，或者说它的前身——爆竹，是春节最响亮、最绚烂的符号。它的历史，就是一部从**驱邪的实用工具**，演变为**庆典的艺术表达**的进化史。我们先通过一张时间轴，来快速把握其关键演变节点：\n\n<svg width=\"100%\" height=\"350\" viewBox=\"0 0 900 350\" xmlns=\"http://www.w3.org/2000/svg\">\n    <rect x=\"0\" y=\"0\" width=\"900\" height=\"350\" fill=\"#f8f9fa\"/>\n    \n    <!-- 时间轴线 -->\n    <line x1=\"80\" y1=\"200\" x2=\"820\" y2=\"200\" stroke=\"#adb5bd\" stroke-width=\"2\"/>\n    \n    <!-- 上古至南北朝：爆竹起源 -->\n    <circle cx=\"150\" cy=\"200\" r=\"8\" fill=\"#0F63EE\"/>\n    <rect x=\"120\" y=\"120\" width=\"60\" height=\"20\" rx=\"2\" fill=\"#0F63EE\" opacity=\"0.7\"/>\n    <text x=\"150\" y=\"134\" font-size=\"11\" fill=\"white\" text-anchor=\"middle\">爆竹起源</text>\n    <text x=\"150\" y=\"230\" font-size=\"12\" fill=\"#333\" text-anchor=\"middle\">(上古-南北朝)</text>\n    <text x=\"150\" y=\"250\" font-size=\"10\" fill=\"#666\" text-anchor=\"middle\">燃烧竹节<br>“爆竹”驱年兽</text>\n    <text x=\"150\" y=\"270\" font-size=\"9\" fill=\"#999\" text-anchor=\"middle\">功能：驱邪</text>\n    \n    <!-- 唐宋：火药与烟花诞生 -->\n    <circle cx=\"300\" cy=\"200\" r=\"8\" fill=\"#0F63EE\"/>\n    <rect x=\"270\" y=\"80\" width=\"60\" height=\"20\" rx=\"2\" fill=\"#0F63EE\" opacity=\"0.8\"/>\n    <text x=\"300\" y=\"94\" font-size=\"11\" fill=\"white\" text-anchor=\"middle\">火药烟花</text>\n    <text x=\"300\" y=\"230\" font-size=\"12\" fill=\"#333\" text-anchor=\"middle\">(唐宋)</text>\n    <text x=\"300\" y=\"250\" font-size=\"10\" fill=\"#666\" text-anchor=\"middle\">火药发明<br>“爆仗”出现<br>宫廷庆典</text>\n    <text x=\"300\" y=\"270\" font-size=\"9\" fill=\"#999\" text-anchor=\"middle\">功能：驱邪+庆典</text>\n    \n    <!-- 明清：普及与工艺发展 -->\n    <circle cx=\"450\" cy=\"200\" r=\"8\" fill=\"#0F63EE\"/>\n    <rect x=\"420\" y=\"120\" width=\"60\" height=\"20\" rx=\"2\" fill=\"#0F63EE\" opacity=\"0.85\"/>\n    <text x=\"450\" y=\"134\" font-size=\"11\" fill=\"white\" text-anchor=\"middle\">工艺发展</text>\n    <text x=\"450\" y=\"230\" font-size=\"12\" fill=\"#333\" text-anchor=\"middle\">(明清)</text>\n    <text x=\"450\" y=\"250\" font-size=\"10\" fill=\"#666\" text-anchor=\"middle\">民间普及<br>“架子烟花”<br>花色增多</text>\n    <text x=\"450\" y=\"270\" font-size=\"9\" fill=\"#999\" text-anchor=\"middle\">功能：庆典艺术化</text>\n    \n    <!-- 近现代：工业化与管制 -->\n    <circle cx=\"600\" cy=\"200\" r=\"8\" fill=\"#0F63EE\"/>\n    <rect x=\"570\" y=\"80\" width=\"60\" height=\"20\" rx=\"2\" fill=\"#0F63EE\" opacity=\"0.9\"/>\n    <text x=\"600\" y=\"94\" font-size=\"11\" fill=\"white\" text-anchor=\"middle\">工业化时代</text>\n    <text x=\"600\" y=\"230\" font-size=\"12\" fill=\"#333\" text-anchor=\"middle\">(20世纪)</text>\n    <text x=\"600\" y=\"250\" font-size=\"10\" fill=\"#666\" text-anchor=\"middle\">机械化生产<br>品类爆发<br>安全与环保问题</text>\n    <text x=\"600\" y=\"270\" font-size=\"9\" fill=\"#999\" text-anchor=\"middle\">功能：大众娱乐</text>\n    \n    <!-- 当代：电子化与回归 -->\n    <circle cx=\"750\" cy=\"200\" r=\"8\" fill=\"#0F63EE\"/>\n    <rect x=\"720\" y=\"120\" width=\"60\" height=\"20\" rx=\"2\" fill=\"#0F63EE\"/>\n    <text x=\"750\" y=\"134\" font-size=\"11\" fill=\"white\" text-anchor=\"middle\">电子化时代</text>\n    <text x=\"750\" y=\"230\" font-size=\"12\" fill=\"#333\" text-anchor=\"middle\">(21世纪至今)</text>\n    <text x=\"750\" y=\"250\" font-size=\"10\" fill=\"#666\" text-anchor=\"middle\">城市禁放<br>电子鞭炮<br>集中焰火表演</text>\n    <text x=\"750\" y=\"270\" font-size=\"9\" fill=\"#999\" text-anchor=\"middle\">功能：仪式感与公共观赏</text>\n    \n    <!-- 连接线 -->\n    <polyline points=\"150,200 300,200 450,200 600,200 750,200\" fill=\"none\" stroke=\"#0F63EE\" stroke-width=\"2\" stroke-dasharray=\"5,5\"/>\n    \n    <!-- 趋势箭头 -->\n    <polygon points=\"800,200 790,195 790,205\" fill=\"#0F63EE\"/>\n    <text x=\"820\" y=\"205\" font-size=\"12\" fill=\"#0F63EE\">趋势：从实用到艺术，从私人到公共</text>\n</svg>\n\n**历史脉络详解：**\n\n1.  **起源：驱邪的“爆竹” (上古-南北朝)**\n    *   **核心**：还不是火药制品。古人发现燃烧竹节时，竹腔内的空气受热膨胀，会爆裂发出“噼啪”巨响。\n    *   **与“年”兽传说结合**：这响声恰好被附会到“驱逐年兽”的故事里，形成了**春节燃放爆竹驱邪避害**的核心民俗逻辑。这本质上是一种基于声音的“精神防护”。\n\n2.  **质变：火药的引入与“烟火”诞生 (唐宋)**\n    *   **唐代**：炼丹家发明了火药。将火药填入竹筒或纸卷中燃烧，产生了更响、更持续的爆炸，称为“爆仗”或“炮仗”。\n    *   **宋代**：这是**烟花艺术真正的起点**。工匠在火药中加入不同金属盐（如锶-红、钡-绿、铜-蓝），制造出色彩。出现了“架子烟花”（将多个烟花组合燃放，形成图案、文字）。**烟花从单纯的听觉惊吓，升级为视听盛宴，进入宫廷和重大庆典**。\n\n3.  **普及与发展：民间艺术的繁荣 (明清)**\n    *   制作工艺成熟，传入民间。湖南浏阳、江西上栗等地成为花炮之乡。\n    *   春节、元宵放烟花成为全民习俗，是节日气氛的**高潮制造者**。其功能彻底从“驱邪”转向“**庆贺、渲染欢乐**”。\n\n4.  **工业化与现代困境 (20世纪)**\n    *   机械化生产使烟花产量剧增，成本下降，进入千家万户。\n    *   但随之而来的是**安全事故、空气污染、噪音扰民**等问题日益突出。\n\n5.  **当代转型：管制、替代与公共化 (21世纪至今)**\n    *   **城市禁限放**：大多数城市出于安全和环保考虑，禁止或限制私人燃放。\n    *   **替代品出现**：电子鞭炮、空气炮等模拟声音和闪光的产品，保留了仪式感，避免了污染。\n    *   **公共焰火表演**：春节、国庆等重大节日，由政府或机构组织大型专业焰火表演。**烟花从一项家庭私人活动，转变为公共文化消费产品**。人们从“自己放”变成“一起看”。\n\n---\n\n### **烟花在春节中的核心角色演变**\n\n我们可以用下面这个简单的模型来理解：\n\n<div style=\"text-align: center; margin: 20px 0;\">\n<svg width=\"500\" height=\"300\" viewBox=\"0 0 500 300\" xmlns=\"http://www.w3.org/2000/svg\">\n    <rect x=\"0\" y=\"0\" width=\"500\" height=\"300\" fill=\"#f8f9fa\"/>\n    \n    <!-- 古代：驱邪 -->\n    <circle cx=\"100\" cy=\"150\" r=\"50\" fill=\"#0F63EE\" opacity=\"0.1\" stroke=\"#0F63EE\" stroke-width=\"2\"/>\n    <text x=\"100\" y=\"140\" font-size=\"16\" fill=\"#0F63EE\" text-anchor=\"middle\" font-weight=\"bold\">古代角色</text>\n    <text x=\"100\" y=\"160\" font-size=\"14\" fill=\"#0F63EE\" text-anchor=\"middle\">驱邪避害</text>\n    <text x=\"100\" y=\"185\" font-size=\"12\" fill=\"#666\" text-anchor=\"middle\">(功能性、生存性)</text>\n    <!-- 图标：竹子和火焰 -->\n    <line x1=\"90\" y1=\"200\" x2=\"90\" y2=\"220\" stroke=\"#8b4513\" stroke-width=\"3\"/>\n    <polygon points=\"90,200 85,210 95,210\" fill=\"#8b4513\"/>\n    <circle cx=\"90\" cy=\"195\" r=\"5\" fill=\"#ff6b6b\"/>\n    \n    <!-- 近代：庆贺 -->\n    <circle cx=\"250\" cy=\"150\" r=\"50\" fill=\"#0F63EE\" opacity=\"0.2\" stroke=\"#0F63EE\" stroke-width=\"2\"/>\n    <text x=\"250\" y=\"140\" font-size=\"16\" fill=\"#0F63EE\" text-anchor=\"middle\" font-weight=\"bold\">近代角色</text>\n    <text x=\"250\" y=\"160\" font-size=\"14\" fill=\"#0F63EE\" text-anchor=\"middle\">渲染喜庆</text>\n    <text x=\"250\" y=\"185\" font-size=\"12\" fill=\"#666\" text-anchor=\"middle\">(情感性、氛围性)</text>\n    <!-- 图标：彩色烟花 -->\n    <circle cx=\"250\" cy=\"210\" r=\"8\" fill=\"#ff6b6b\"/>\n    <line x1=\"250\" y1=\"210\" x2=\"240\" y2=\"200\" stroke=\"#ff6b6b\" stroke-width=\"1\"/>\n    <line x1=\"250\" y1=\"210\" x2=\"260\" y2=\"200\" stroke=\"#4db8ff\" stroke-width=\"1\"/>\n    <line x1=\"250\" y1=\"210\" x2=\"250\" y2=\"195\" stroke=\"#99cc66\" stroke-width=\"1\"/>\n    \n    <!-- 现代：仪式与观赏 -->\n    <circle cx=\"400\" cy=\"150\" r=\"50\" fill=\"#0F63EE\" opacity=\"0.3\" stroke=\"#0F63EE\" stroke-width=\"2\"/>\n    <text x=\"400\" y=\"140\" font-size=\"16\" fill=\"#0F63EE\" text-anchor=\"middle\" font-weight=\"bold\">现代角色</text>\n    <text x=\"400\" y=\"160\" font-size=\"14\" fill=\"#0F63EE\" text-anchor=\"middle\">公共仪式</text>\n    <text x=\"400\" y=\"185\" font-size=\"12\" fill=\"#666\" text-anchor=\"middle\">(文化性、观赏性)</text>\n    <!-- 图标：人群和天空烟花 -->\n    <circle cx=\"400\" cy=\"210\" r=\"5\" fill=\"#333\"/>\n    <circle cx=\"390\" cy=\"215\" r=\"4\" fill=\"#666\"/>\n    <circle cx=\"410\" cy=\"215\" r=\"4\" fill=\"#666\"/>\n    <circle cx=\"400\" cy=\"230\" r=\"10\" fill=\"#ffcc00\" opacity=\"0.7\"/>\n</svg>\n</div>\n\n*   **驱邪者 → 庆贺者 → 仪式符号**：角色从对抗超自然力量，转变为表达内心喜悦，最终升华为一种代表节日、庆典的**文化仪式符号**。\n*   **私人行为 → 公共事件**：从每家每户在自家门口燃放，转变为集体观看专业表演，反映了社会治理方式和公共空间利用的变化。\n*   **听觉主导 → 视觉主导**：从要“响”到要“美”，体现了人们审美需求和科技水平的提升。\n\n**对现代人的意义**：\n对于像你这样的现代人，尤其是生活在城市的自由职业者，烟花的角色可能是：\n*   **一种遥远的童年记忆**，关联着传统的年味。\n*   **一场值得期待的公共视听盛宴**，是节日里的“文化消费项目”。\n*   **一个环保与习俗矛盾的思考点**。\n*   **一种强烈的仪式感触发器**：即便只是看到视频或听到电子鞭炮声，也能瞬间激活“这是春节”的心理认知。\n\n**总结**：烟花的历史，是一部**技术革新驱动民俗演变**的微型史。它从解决古人的**心理安全需求**出发，借助科技（火药、化学）的力量，演变为满足人们**情感表达和审美需求**的高级形式，最终在当代社会因公共治理的需要而再次转型。它就像很多传统行业一样，内核价值（营造气氛、标志节点）不变，但外在形式必须随着时代的技术、规则和观念不断进化，才能持续生存并焕发新的生命力。
### 带有<br>换行的svg:
    <svg viewBox="0 0 1200 700" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto; background: white;">
    <style>
      text { font-family: Arial, sans-serif; }
      .timeline { stroke: #0F63EE; stroke-width: 8; }
      .node { fill: #0F63EE; stroke: white; stroke-width: 3; }
      .node-text { fill: white; font-size: 24px; font-weight: bold; text-anchor: middle; dominant-baseline: middle; }
      .title { fill: #0F63EE; font-size: 36px; font-weight: bold; text-anchor: start; }
      .desc { fill: #333; font-size: 18px; text-anchor: start; }
    </style>
    <line x1="100" y1="100" x2="100" y2="550" class="timeline"/>
    <circle cx="100" cy="150" r="40" class="node"/>
    <text x="100" y="150" class="node-text">当<br>下</text>
    <text x="180" y="130" class="title">当下：个人效率的超级杠杆</text>
    <text x="180" y="170" class="desc">• 信息处理：快速阅读、总结海量资料，成为你的“第二大脑”</text>
    <text x="180" y="200" class="desc">• 内容创作：辅助写作、设计、生成基础代码，突破创意瓶颈</text>
    <text x="180" y="230" class="desc">• 决策支持：基于数据提供多角度分析，减少直觉判断的偏差</text>

    <circle cx="100" cy="300" r="40" class="node"/>
    <text x="100" y="300" class="node-text">2-3<br>年</text>
    <text x="180" y="280" class="title">2-3年后：职业竞争力的重构器</text>
    <text x="180" y="320" class="desc">• 技能融合：AI 将深度融入各岗位，懂 AI 成为基础职业素养</text>
    <text x="180" y="350" class="desc">• 角色进化：从“执行者”转向“AI 协作管理者”和“问题定义者”</text>
    <text x="180" y="380" class="desc">• 新机会涌现：AI 运维、提示工程、AI 赋能培训等新岗位成熟</text>

    <circle cx="100" cy="450" r="40" class="node"/>
    <text x="100" y="450" class="node-text">4-5<br>年</text>
    <text x="180" y="430" class="title">4-5年后（AGI 前夜）：生存模式的切换点</text>
    <text x="180" y="470" class="desc">• 人机协作常态化：与 AI 智能体组成团队，完成复杂项目成为标准流程</text>
    <text x="180" y="500" class="desc">• 核心能力迁移：人类的独特价值更集中于愿景、伦理、情感和跨领域创新</text>
    <text x="180" y="530" class="desc">• 为 AGI 适配做准备：建立与超级智能协作的心理与技能基础</text>
  </svg>
你好 K，我是孙志岗，初次见面，很高兴认识你！

<svg width=\"100%\" height=\"auto\" viewBox=\"0 0 800 400\" xmlns=\"http://www.w3.org/2000/svg\">\n  <defs>\n    <linearGradient id=\"bgGradient\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\">\n      <stop offset=\"0%\" style=\"stop-color:#0F63EE;stop-opacity:0.1\" />\n      <stop offset=\"100%\" style=\"stop-color:#0F63EE;stop-opacity:0.3\" />\n    </linearGradient>\n    <clipPath id=\"imageClip\">\n      <circle cx=\"600\" cy=\"150\" r=\"80\"/>\n    </clipPath>\n  </defs>\n  <rect width=\"800\" height=\"400\" fill=\"url(#bgGradient)\"/>\n  <rect x=\"50\" y=\"50\" width=\"500\" height=\"300\" rx=\"20\" fill=\"white\" stroke=\"#0F63EE\" stroke-width=\"4\"/>\n  <text x=\"80\" y=\"120\" font-family=\"Arial, sans-serif\" font-size=\"48\" font-weight=\"bold\" fill=\"#0F63EE\">跟 AI 学 AI 通识</text>\n  <text x=\"80\" y=\"180\" font-family=\"Arial, sans-serif\" font-size=\"24\" fill=\"#666\">孙志岗 · AI 大模型应用专家</text>\n  <line x1=\"80\" y1=\"200\" x2=\"480\" y2=\"200\" stroke=\"#0F63EE\" stroke-width=\"2\"/>\n  <text x=\"80\" y=\"250\" font-family=\"Arial, sans-serif\" font-size=\"20\" fill=\"#333\">探索大语言模型，开启职业新篇章</text>\n  <image href=\"https://resource.ai-shifu.com/ac186b833d0e417fb02737910b3a5ae0\" x=\"520\" y=\"70\" height=\"160\" width=\"160\" clip-path=\"url(#imageClip)\"/>\n</svg>

为了判断这门《跟 AI 学 AI 通识》课是不是你的“菜”，我想先听听你对下面几个观点的看法。咱们不绕弯子，直接上观点：\n\n1.  **AI 是一种工具**，你同意吗？\n2.  **每种 AI 产品都需要学习使用方法**，你觉得呢？\n3.  **打造 AI 产品是技术高手的事情**，你怎么看？
<img src="https://resource.ai-shifu.cn/7b007ca873b14edeb4d3e6817f520550" />

啊啊啊下面这张图总结了咱们刚才聊的全部要点下面这张图总结了咱们刚才聊的全部要点下面这张图总结了咱们刚才聊的全部要点下面这张图总结了咱们刚才聊的全部要点下面这张图总结了咱们刚才聊的全部要点下面这张图总结了咱们刚才聊的全部要点
<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="600" height="400" fill="#f5f5f5"/>

  <!-- 标题 -->
  <text x="300" y="40" text-anchor="middle" font-family="Arial" font-size="20" font-weight="bold">AI 早期形态：穷举法的局限</text>

  <!-- 时间线 -->
  <line x1="50" y1="80" x2="550" y2="80" stroke="#333" stroke-width="2"/>
  <text x="50" y="75" text-anchor="middle" font-family="Arial" font-size="12">1950s</text>
  <text x="300" y="75" text-anchor="middle" font-family="Arial" font-size="12">1997</text>
  <text x="550" y="75" text-anchor="middle" font-family="Arial" font-size="12">Now</text>

  <!-- 早期AI -->
  <circle cx="50" cy="150" r="30" fill="#ff9999"/>
  <text x="50" y="150" text-anchor="middle" font-family="Arial" font-size="10" fill="white">早期AI</text>
  <text x="50" y="190" text-anchor="middle" font-family="Arial" font-size="10">让机器像人一样思考</text>

  <!-- 深蓝 -->
  <circle cx="300" cy="150" r="40" fill="#99ccff"/>
  <text x="300" y="150" text-anchor="middle" font-family="Arial" font-size="12" fill="white">深蓝</text>
  <text x="300" y="200" text-anchor="middle" font-family="Arial" font-size="10">击败国际象棋冠军</text>

  <!-- 箭头连接 -->
  <line x1="80" y1="150" x2="260" y2="150" stroke="#333" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- 穷举法原理 -->
  <rect x="100" y="250" width="200" height="60" fill="#ccffcc" stroke="#333"/>
  <text x="200" y="270" text-anchor="middle" font-family="Arial" font-size="12">穷举法原理</text>
  <text x="200" y="290" text-anchor="middle" font-family="Arial" font-size="10">速度优势 · 重复计算</text>

  <!-- 局限性 -->
  <rect x="350" y="250" width="200" height="60" fill="#ffcc99" stroke="#333"/>
  <text x="450" y="270" text-anchor="middle" font-family="Arial" font-size="12">核心局限性</text>
  <text x="450" y="290" text-anchor="middle" font-family="Arial" font-size="10">只能解决有限计算量问题</text>

  <!-- 连接线 -->
  <line x1="300" y1="190" x2="300" y2="240" stroke="#333" stroke-width="1"/>
  <line x1="300" y1="240" x2="200" y2="240" stroke="#333" stroke-width="1" marker-end="url(#arrow)"/>
  <line x1="300" y1="240" x2="400" y2="240" stroke="#333" stroke-width="1" marker-end="url(#arrow)"/>

  <!-- 底部结论 -->
  <text x="300" y="350" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold">绝大多数现实问题无法用穷举解决</text>

  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#333"/>
    </marker>
  </defs>
</svg>

下面这张图总结了咱们刚才聊的全部要点：
<svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景 -->
  <rect width="800" height="400" fill="#f8f9fa" rx="10"/>

  <!-- 图书馆背景线条 -->
  <path d="M50 350 L750 350" stroke="#dee2e6" stroke-width="2"/>

  <!-- 人类侧 -->
  <g transform="translate(150, 200)">
    <!-- 书堆 -->
    <rect x="-60" y="80" width="120" height="70" fill="#e9ecef" stroke="#adb5bd"/>
    <text x="0" y="115" font-family="sans-serif" font-size="14" text-anchor="middle" fill="#495057">有限的阅读量</text>
    <!-- 人物 -->
    <circle cx="0" cy="0" r="30" fill="#adb5bd"/>
    <path d="M-15 10 Q0 20 15 10" stroke="#fff" fill="none" stroke-width="2"/>
    <text x="0" y="50" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#000">人类：精力有限</text>
    <text x="0" y="70" font-family="sans-serif" font-size="12" text-anchor="middle" fill="#6c757d">（会疲劳、会遗忘、选择性阅读）</text>
  </g>

  <!-- 分隔线 -->
  <line x1="400" y1="50" x2="400" y2="350" stroke="#dee2e6" stroke-dasharray="5,5"/>

  <!-- AI 侧 -->
  <g transform="translate(600, 200)">
    <!-- 浩瀚数据流 -->
    <path d="M-100 80 L100 80 L100 150 L-100 150 Z" fill="#0F63EE" opacity="0.1"/>
    <text x="0" y="115" font-family="sans-serif" font-size="14" text-anchor="middle" fill="#0F63EE" font-weight="bold">全量数据吞噬 (自监督)</text>
    <!-- AI 核心 -->
    <rect x="-40" y="-40" width="80" height="80" rx="10" fill="#0F63EE"/>
    <path d="M-20 0 L20 0 M0 -20 L0 20" stroke="#fff" stroke-width="4"/>
    <circle cx="0" cy="0" r="10" fill="none" stroke="#fff" stroke-width="2">
      <animate attributeName="r" values="10;15;10" dur="2s" repeatCount="indefinite" />
    </circle>
    <text x="0" y="60" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#0F63EE">AI：全量吸收</text>
    <text x="0" y="80" font-family="sans-serif" font-size="12" text-anchor="middle" fill="#6c757d">（24/7 运行、无损记忆、真读真学）</text>
  </g>

  <!-- 标题 -->
  <text x="400" y="30" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="#333">图书馆里的“自监督学习”：人 vs AI</text>
</svg>

`,
    enableTypewriter: false,
    typingSpeed: 10,
  },
};

const HTML_DEMO_STREAM_SOURCE = `
div长度
<div style=\"display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: linear-gradient(to bottom right, #f8fafc, #e0e7ff); font-family: 'Arial', sans-serif; padding: 2rem;\">\n  <div style=\"font-size: 4.5rem; font-weight: 900; color: #0F63EE; text-align: center; line-height: 1.2; margin-bottom: 3rem;\">\n    AI 是一种工具\n  </div>\n  <div style=\"font-size: 4.5rem; font-weight: 900; color: #0F63EE; text-align: center; line-height: 1.2; margin-bottom: 3rem;\">\n    每种 AI 产品都需要<br>学习使用方法\n  </div>\n  <div style=\"font-size: 4.5rem; font-weight: 900; color: #0F63EE; text-align: center; line-height: 1.2;\">\n    打造 AI 产品是<br>技术高手的事情\n  </div>\n</div>
测试一下

<div style=\"width: 100%; overflow-x: auto; margin: 20px 0; padding: 20px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;\">\n<svg width=\"600\" height=\"180\" viewBox=\"0 0 600 180\" xmlns=\"http://www.w3.org/2000/svg\">\n    <rect x=\"50\" y=\"30\" width=\"500\" height=\"120\" rx=\"12\" fill=\"#ffffff\" stroke=\"#0F63EE\" stroke-width=\"2\"/>\n    <rect x=\"70\" y=\"60\" width=\"460\" height=\"60\" rx=\"6\" fill=\"#f0f9ff\" stroke=\"#0F63EE\" stroke-width=\"1\"/>\n    <text x=\"300\" y=\"95\" text-anchor=\"middle\" fill=\"#1e293b\" font-family=\"Arial, sans-serif\" font-size=\"14\" font-weight=\"bold\">题目：以下哪一项是“人工智能”的英文缩写？</text>\n    <text x=\"300\" y=\"120\" text-anchor=\"middle\" fill=\"#0F63EE\" font-family=\"Arial, sans-serif\" font-size=\"12\">A. IT  B. AI  C. VR  D. UI</text>\n    <rect x=\"250\" y=\"125\" width=\"20\" height=\"20\" rx=\"10\" fill=\"#d1fae5\" stroke=\"#10b981\" stroke-width=\"2\"/>\n    <text x=\"260\" y=\"140\" text-anchor=\"middle\" fill=\"#10b981\" font-family=\"Arial, sans-serif\" font-size=\"12\" font-weight=\"bold\">B</text>\n    <circle cx=\"540\" y=\"90\" r=\"12\" fill=\"#10b981\"/>\n    <text x=\"540\" y=\"95\" text-anchor=\"middle\" fill=\"#ffffff\" font-family=\"Arial, sans-serif\" font-size=\"12\" font-weight=\"bold\">✓</text>\n</svg>\n</div>\n\n你的答案 **“B”** 是正确的！\n\n**AI** 正是 “Artificial Intelligence” 的缩写。回答得很棒，kk！

**提示词是：** \`// 这个函数用于\`

“为了装得更像人”，这个猜想特别有意思！它触及了咱们对人机交互的一种直觉期待。不过，真相可能更底层、更本质：**这其实就是生成式 AI 本来的样子**，并非刻意模仿，也无关网络延迟。\n\n这种“一个字一个字”的生成方式，恰恰是 AI 智慧的源头活水。要理解它，咱们得先搞懂一个核心概念：**Token**。\n\n你可以把 Token 想象成 AI 理解世界的基本积木。对文字模型来说，一个 Token 通常不是一个完整的汉字或英文单词，而是一个更小的语义片段。\n\n下面这张图展示了同一句话，在不同语言里是如何被“切”成 Token 的：\n\n<div style=\"background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #0F63EE; margin: 20px 0;\">\n  <div style=\"display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;\">\n    <!-- 中文示例 -->\n    <div style=\"flex: 1; min-width: 250px;\">\n      <div style=\"font-weight: 600; color: #0F63EE; margin-bottom: 8px;\">中文例子</div>\n      <div style=\"background: white; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0;\">\n        <div style=\"color: #64748b; font-size: 0.9em; margin-bottom: 5px;\">原句：人工智能很强大</div>\n        <div style=\"display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px;\">\n          <span style=\"background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 0.9em;\">人工</span>\n          <span style=\"background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 0.9em;\">智能</span>\n          <span style=\"background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 0.9em;\">很</span>\n          <span style=\"background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 0.9em;\">强大</span>\n        </div>\n        <div style=\"color: #64748b; font-size: 0.85em; margin-top: 8px;\">被切分成 4 个 Token</div>\n      </div>\n    </div>\n\n    <!-- 英文示例 -->\n    <div style=\"flex: 1; min-width: 250px;\">\n      <div style=\"font-weight: 600; color: #0F63EE; margin-bottom: 8px;\">英文例子</div>\n      <div style=\"background: white; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0;\">\n        <div style=\"color: #64748b; font-size: 0.9em; margin-bottom: 5px;\">原句：Artificial intelligence is powerful</div>\n        <div style=\"display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px;\">\n          <span style=\"background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-size: 0.9em;\">Artificial</span>\n          <span style=\"background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-size: 0.9em;\"> intelligence</span>\n          <span style=\"background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-size: 0.9em;\"> is</span>\n          <span style=\"background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-size: 0.9em;\"> powerful</span>\n        </div>\n        <div style=\"color: #64748b; font-size: 0.85em; margin-top: 8px;\">被切分成 4 个 Token</div>\n      </div>\n    </div>\n  </div>\n</div>\n\n你看，无论是中文还是英文，任何文章在 AI 眼里，都是由这样一块块 **Token 积木**组合而成的。它写作时，就是在玩一个超级复杂的“下一块积木猜猜看”游戏。\n\n这个逻辑可以推广。文生图模型，比如 Midjourney，它眼中的“Token”可能是图像的一个色块、一条线条；文生视频模型，它的“Token”可能就是视频的一帧画面或一个动作片段。**虽然在这些领域可能不直接叫“Token”，但核心理念相通：把复杂内容拆解成基础单元，再学习如何组合它们。**\n\n所以，AI 逐字输出，是因为它必须在生成当前 Token 后，才能基于它去预测下一个最可能的 Token。**这看似缓慢的“思考”过程，正是它创造力的来源。**

下面这张图会动态展示 AI 是如何像“猜谜”一样，<custom-button-after-content><img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f680.svg" alt="icon" width="16" height="16" loading="lazy" /><span>点击自定义按钮</span></custom-button-after-content>一个 Token 一个 Token 地“猜”出完整句子的：

<div id="token-demo" style="background: #f8fafc; padding: 25px; border-radius: 16px; border: 2px solid #e2e8f0; font-family: 'Segoe UI', system-ui, monospace; max-width: 800px; margin: 0 auto;">
  <div style="color: #0F63EE; font-weight: 700; margin-bottom: 20px; font-size: 1.2em; text-align: center;">🧠 AI 的“猜词”生成过程（基于概率的 Token 预测）</div>

  <!-- 提示词区域 -->
  <div style="margin-bottom: 30px;">
    <div style="color: #64748b; font-size: 0.95em; margin-bottom: 8px;">📝 初始提示词：</div>
    <div style="background: white; padding: 15px; border-radius: 10px; border-left: 5px solid #94a3b8; font-size: 1.1em; color: #334155;">
      <span id="current-prompt" style="color: #0F63EE; font-weight: 600;">// 这个函数用于</span>
      <span id="generated-text" style="color: #10b981; font-weight: 600;"></span>
      <span id="cursor" style="display: inline-block; width: 2px; height: 1.2em; background-color: #0F63EE; margin-left: 2px; vertical-align: middle; animation: blink 1s infinite;"></span>
    </div>
  </div>

  <!-- 预测选择区域 -->
  <div style="margin-bottom: 30px;">
    <div style="color: #64748b; font-size: 0.95em; margin-bottom: 12px;">🎯 预测下一个 Token（猜哪个词接上去最合理？）：</div>
    <div id="candidate-tokens" style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; padding: 20px; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(15, 99, 238, 0.08);">
      <!-- 候选Token将由JS动态生成 -->
    </div>
    <div id="selection-status" style="text-align: center; margin-top: 15px; color: #0F63EE; font-weight: 600; min-height: 24px;"></div>
  </div>

  <!-- 已生成序列区域 -->
  <div>
    <div style="color: #64748b; font-size: 0.95em; margin-bottom: 12px;">📜 已生成的 Token 序列：</div>
    <div id="token-sequence" style="display: flex; flex-wrap: wrap; gap: 8px; padding: 18px; background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-radius: 12px; border: 1px dashed #0F63EE; min-height: 60px; align-items: center; justify-content: center;">
      <!-- 已生成的Token块将由JS动态添加 -->
      <div class="token-tag" style="padding: 8px 14px; background: #0F63EE; color: white; border-radius: 6px; font-weight: 500; box-shadow: 0 2px 4px rgba(15, 99, 238, 0.3);">//</div>
      <div class="token-tag" style="padding: 8px 14px; background: #0F63EE; color: white; border-radius: 6px; font-weight: 500; box-shadow: 0 2px 4px rgba(15, 99, 238, 0.3);">这个</div>
      <div class="token-tag" style="padding: 8px 14px; background: #0F63EE; color: white; border-radius: 6px; font-weight: 500; box-shadow: 0 2px 4px rgba(15, 99, 238, 0.3);">函数</div>
      <div class="token-tag" style="padding: 8px 14px; background: #0F63EE; color: white; border-radius: 6px; font-weight: 500; box-shadow: 0 2px 4px rgba(15, 99, 238, 0.3);">用于</div>
    </div>
  </div>

  <!-- 控制按钮 -->
  <div style="text-align: center; margin-top: 25px;">
    <button id="next-step-btn" style="background: linear-gradient(135deg, #0F63EE, #3B82F6); color: white; border: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 1em; cursor: pointer; box-shadow: 0 4px 6px rgba(15, 99, 238, 0.3); transition: all 0.2s;">下一步：让 AI 猜下一个词</button>
    <button id="reset-btn" style="background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 1em; cursor: pointer; margin-left: 15px; transition: all 0.2s;">重置演示</button>
  </div>

  <!-- 最终答案（初始隐藏） -->
  <div id="final-result" style="display: none; margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #dbeafe, #bfdbfe); border-radius: 12px; border: 2px solid #0F63EE; text-align: center;">
    <div style="color: #0F63EE; font-weight: 700; font-size: 1.1em; margin-bottom: 10px;">🎉 生成完毕！AI “猜”出的完整句子是：</div>
    <div id="final-sentence" style="font-size: 1.3em; color: #1e293b; font-weight: 600; font-family: monospace; padding: 15px; background: white; border-radius: 8px; border-left: 5px solid #10b981;"></div>
  </div>
</div>

<style>
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.token-candidate {
  padding: 10px 18px;
  background: #f1f5f9;
  color: #475569;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
  text-align: center;
}
.token-candidate:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
}
.token-candidate.selected {
  background: linear-gradient(135deg, #10b981, #34d399) !important;
  color: white !important;
  border-color: #10b981 !important;
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3) !important;
}
.token-candidate.high-prob {
  background: #dbeafe;
  color: #1e40af;
  border: 2px solid #93c5fd;
}
</style>

<script>
(function() {
  // 演示数据：每一步的候选Token及其（模拟的）概率
  const generationSteps = [
    {
      candidates: [
        { text: '计算', prob: 0.35 },
        { text: '处理', prob: 0.28 },
        { text: '验证', prob: 0.15 },
        { text: '获取', prob: 0.12 },
        { text: '生成', prob: 0.10 }
      ],
      selected: '计算'
    },
    {
      candidates: [
        { text: '用户', prob: 0.40 },
        { text: '数据', prob: 0.25 },
        { text: '数组', prob: 0.18 },
        { text: '输入', prob: 0.12 },
        { text: '两个', prob: 0.05 }
      ],
      selected: '用户'
    },
    {
      candidates: [
        { text: '输入', prob: 0.55 },
        { text: '的', prob: 0.20 },
        { text: '信息', prob: 0.15 },
        { text: 'ID', prob: 0.07 },
        { text: '名', prob: 0.03 }
      ],
      selected: '输入'
    },
    {
      candidates: [
        { text: '的', prob: 0.60 },
        { text: '。', prob: 0.25 },
        { text: '，', prob: 0.10 },
        { text: '并', prob: 0.04 },
        { text: '然后', prob: 0.01 }
      ],
      selected: '的'
    },
    {
      candidates: [
        { text: '和', prob: 0.45 },
        { text: '平均值', prob: 0.30 },
        { text: '总和', prob: 0.15 },
        { text: '有效性', prob: 0.07 },
        { text: '长度', prob: 0.03 }
      ],
      selected: '和'
    },
    {
      candidates: [
        { text: '返回', prob: 0.50 },
        { text: '输出', prob: 0.25 },
        { text: '打印', prob: 0.15 },
        { text: '保存', prob: 0.07 },
        { text: '比较', prob: 0.03 }
      ],
      selected: '返回'
    },
    {
      candidates: [
        { text: '结果', prob: 0.65 },
        { text: '它', prob: 0.20 },
        { text: '。', prob: 0.10 },
        { text: '值', prob: 0.04 },
        { text: '状态', prob: 0.01 }
      ],
      selected: '结果'
    },
    {
      candidates: [
        { text: '。', prob: 0.90 },
        { text: '，', prob: 0.05 },
        { text: '；', prob: 0.03 },
        { text: '并', prob: 0.01 },
        { text: '然后', prob: 0.01 }
      ],
      selected: '。'
    }
  ];

  let currentStep = 0;
  const generatedTokens = ['//', '这个', '函数', '用于'];
  const promptElement = document.getElementById('current-prompt');
  const generatedTextElement = document.getElementById('generated-text');
  const candidateContainer = document.getElementById('candidate-tokens');
  const selectionStatusElement = document.getElementById('selection-status');
  const tokenSequenceContainer = document.getElementById('token-sequence');
  const nextStepBtn = document.getElementById('next-step-btn');
  const resetBtn = document.getElementById('reset-btn');
  const finalResultElement = document.getElementById('final-result');
  const finalSentenceElement = document.getElementById('final-sentence');

  function renderCandidates() {
    if (currentStep >= generationSteps.length) {
      completeGeneration();
      return;
    }

    const step = generationSteps[currentStep];
    candidateContainer.innerHTML = '';
    selectionStatusElement.textContent = '';

    // 找出概率最高的候选词
    const maxProb = Math.max(...step.candidates.map(c => c.prob));
    const highProbCandidates = step.candidates.filter(c => c.prob === maxProb);

    step.candidates.forEach(candidate => {
      const isHighProb = candidate.prob === maxProb;
      const div = document.createElement('div');
      div.className = \`token-candidate \${isHighProb ? 'high-prob' : ''}\`;
      div.innerHTML = \`
        <div>\${candidate.text}</div>
        <div style="font-size: 0.85em; margin-top: 4px; color: \${isHighProb ? '#1e40af' : '#64748b'};">概率: \${(candidate.prob * 100).toFixed(1)}%</div>
      \`;

      // 如果当前候选词是概率最高的之一，添加特殊标记
      if (isHighProb) {
        const badge = document.createElement('div');
        badge.style = 'position: absolute; top: -8px; right: -8px; background: #f59e0b; color: white; font-size: 0.7em; padding: 2px 6px; border-radius: 10px; font-weight: bold;';
        badge.textContent = '最高';
        div.style.position = 'relative';
        div.appendChild(badge);
      }

      div.addEventListener('click', () => selectCandidate(candidate.text, candidate.prob));
      candidateContainer.appendChild(div);
    });

    // 自动高亮并“选择”概率最高的候选词（模拟AI的选择）
    setTimeout(() => {
      autoSelectHighestProb(highProbCandidates[0].text);
    }, 500);
  }

  function autoSelectHighestProb(candidateText) {
    const candidates = document.querySelectorAll('.token-candidate');
    candidates.forEach(cand => {
      if (cand.textContent.includes(\`\${candidateText}\`\)) {
        cand.classList.add('selected');
        // 更新状态显示
        selectionStatusElement.textContent = \`✅ AI 选择了概率最高的 Token：“\${candidateText}”\`;
        selectionStatusElement.style.color = '#10b981';
      }
    });
  }

  function selectCandidate(text, prob) {
    // 添加到已生成序列
    generatedTokens.push(text);
    generatedTextElement.textContent = generatedTokens.slice(4).join(''); // 跳过前4个初始token

    // 更新Token序列显示
    const tokenTag = document.createElement('div');
    tokenTag.className = 'token-tag';
    tokenTag.style = 'padding: 8px 14px; background: #10b981; color: white; border-radius: 6px; font-weight: 500; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);';
    tokenTag.textContent = text;
    tokenSequenceContainer.appendChild(tokenTag);

    // 滚动到最新token
    tokenTag.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

    currentStep++;
    if (currentStep < generationSteps.length) {
      setTimeout(renderCandidates, 800);
    } else {
      setTimeout(completeGeneration, 800);
    }
  }

  function completeGeneration() {
    const fullSentence = '// 这个函数用于计算用户输入的和返回结果。';
    generatedTextElement.textContent = generatedTokens.slice(4).join('');
    candidateContainer.innerHTML = '<div style="padding: 20px; color: #0F63EE; font-weight: 600;">🎯 生成完成！AI 已基于概率“猜”出了整句话。</div>';
    selectionStatusElement.textContent = '✅ 任务完成！整个过程没有“查找”或“匹配”，全是“预测”和“猜测”。';
    nextStepBtn.disabled = true;
    nextStepBtn.style.opacity = '0.6';
    nextStepBtn.textContent = '演示完成';

    // 显示最终结果
    finalSentenceElement.textContent = fullSentence;
    finalResultElement.style.display = 'block';
    finalResultElement.scrollIntoView({ behavior: 'smooth' });
  }

  function resetDemo() {
    currentStep = 0;
    generatedTokens.length = 4; // 重置为初始4个token
    generatedTextElement.textContent = '';
    selectionStatusElement.textContent = '';
    nextStepBtn.disabled = false;
    nextStepBtn.style.opacity = '1';
    nextStepBtn.textContent = '下一步：让 AI 猜下一个词';

    // 重置Token序列显示（只保留前4个）
    tokenSequenceContainer.innerHTML = '';
    ['//', '这个', '函数', '用于'].forEach(token => {
      const tokenTag = document.createElement('div');
      tokenTag.className = 'token-tag';
      tokenTag.style = 'padding: 8px 14px; background: #0F63EE; color: white; border-radius: 6px; font-weight: 500; box-shadow: 0 2px 4px rgba(15, 99, 238, 0.3);';
      tokenTag.textContent = token;
      tokenSequenceContainer.appendChild(tokenTag);
    });

    // 隐藏最终结果
    finalResultElement.style.display = 'none';

    // 重新开始
    renderCandidates();
  }

  // 初始化
  nextStepBtn.addEventListener('click', () => {
    if (currentStep < generationSteps.length) {
      const step = generationSteps[currentStep];
      selectCandidate(step.selected, step.candidates.find(c => c.text === step.selected).prob);
    }
  });

  resetBtn.addEventListener('click', resetDemo);

  // 开始演示
  renderCandidates();
})();
</script>
<custom-button-after-content><img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f680.svg" alt="icon" width="16" height="16" loading="lazy" /><span>点击自定义按钮</span></custom-button-after-content>

---

### 图解说明

这个过程就像一场精心设计的“**概率接龙**”：

1.  **起点**：你给出了提示词 \`// 这个函数用于\`。AI 把它拆成 Token：\`//\`、\`这个\`、\`函数\`、\`用于\`。
2.  **第一次“猜”**：AI 看着这个序列，开始计算后面接哪个 Token 概率最高。它“脑”中浮现出几个候选：\`计算\`（35%）、\`处理\`（28%）、\`验证\`（15%）…… **它选择了概率最高的 \`计算\`**。
3.  **循环往复**：现在，提示词变成了 \`// 这个函数用于 计算\`。AI 再次基于**这个新的、更长的序列**，预测下一个 Token。候选可能是 \`用户\`、\`数据\`、\`数组\`…… 它再次选择概率最高的。
4.  **步步为营**：每猜对一个 Token，就把它加到提示词后面，作为预测**下一个** Token 的上下文。如此循环，直到生成一个完整的句子（比如遇到句号\`.\`的概率足够高）。
5.  **核心秘密**：**注意，AI 每次“猜”的时候，看的都是当前完整的上下文（即“提示词 + 已生成的所有 Token”）**。它没有在数据库里“搜索”标准答案，也没有进行“逻辑匹配”。它做的唯一一件事，就是基于海量数据训练出的“感觉”，计算**下一个词出现的概率**。

**整个过程，没有“查找”，没有“搜索”，没有“匹配”。有的，只是一次又一次的“猜测”。**

---

### 总结

所以，咱们可以得出一个既简单又震撼的结论：

**AI 最基础、最核心的工作过程，就是基于概率预测下一个 Token。**

它所有的“智慧”、所有的“胡言乱语”、所有的“惊人表现”和“低级错误”，都源于这个根本机制：
*   **它不是在“检索”知识**，而是在“联想”概率。
*   **它不是在“执行”逻辑**，而是在“模仿”模式。
*   **它完全是用“猜”的**，只不过是在数十亿文本上训练后，猜得比较有根据。

理解这一点，是你**摆脱对 AI 盲目恐惧或崇拜的关键第一步**。它既不是神，也不是鬼，它是一个极其复杂的**概率机器**。知道了它怎么“猜”，你才能明白它为何会“对”，更会明白它为何会“错”。


**任何你看到的文章、代码，在 AI 眼里，都是一串特定顺序的 Token 组合。**\n\n这个逻辑可以推广到更广阔的领域：
*   **文生图模型**（比如 Midjourney）：它眼中的“Token”可能是图像的一块小色块、一种纹理模式，或者一个视觉概念。
* *   **文生视频模型**（比如 Sora）：它的“Token”可能是一帧画面中的动态片段，或者几帧之间的变化规律。

虽然在文字以外的领域，工程师们可能不直接叫它“Token”，但**万变不离其宗，核心思想都是用更基础的“积木块”去组合、生成复杂内容**。

所以，下次你看到 AI 一个字一个字地“蹦”答案时，其实正是在目睹它**拿起一块又一块“Token积木”，为你现场搭建答案大厦**。它的智慧与局限，都藏在这个搭建过程里。

好的，咱们用一个你熟悉的场景来画这个图。假设你让 AI 帮你写一段简单的 JavaScript 代码注释。

`;

const STREAM_CODE_IFRAME_CONTENT = `\`\`\`c
int maze[5][5] = {
    {1, 1, 1, 1, 1},
    {1, 2, 0, 0, 1},
    {1, 1, 1, 0, 1},
    {1, 0, 0, 0, 0},
    {1, 1, 1, 1, 1}
};
\`\`\``;

const STREAM_SVG_IFRAME_CONTENT = `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="600" height="400" fill="#f5f5f5"/>

  <!-- 标题 -->
  <text x="300" y="40" text-anchor="middle" font-family="Arial" font-size="20" font-weight="bold">AI 早期形态：穷举法的局限</text>

  <!-- 时间线 -->
  <line x1="50" y1="80" x2="550" y2="80" stroke="#333" stroke-width="2"/>
  <text x="50" y="75" text-anchor="middle" font-family="Arial" font-size="12">1950s</text>
  <text x="300" y="75" text-anchor="middle" font-family="Arial" font-size="12">1997</text>
  <text x="550" y="75" text-anchor="middle" font-family="Arial" font-size="12">Now</text>

  <!-- 早期AI -->
  <circle cx="50" cy="150" r="30" fill="#ff9999"/>
  <text x="50" y="150" text-anchor="middle" font-family="Arial" font-size="10" fill="white">早期AI</text>
  <text x="50" y="190" text-anchor="middle" font-family="Arial" font-size="10">让机器像人一样思考</text>

  <!-- 深蓝 -->
  <circle cx="300" cy="150" r="40" fill="#99ccff"/>
  <text x="300" y="150" text-anchor="middle" font-family="Arial" font-size="12" fill="white">深蓝</text>
  <text x="300" y="200" text-anchor="middle" font-family="Arial" font-size="10">击败国际象棋冠军</text>

  <!-- 箭头连接 -->
  <line x1="80" y1="150" x2="260" y2="150" stroke="#333" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- 穷举法原理 -->
  <rect x="100" y="250" width="200" height="60" fill="#ccffcc" stroke="#333"/>
  <text x="200" y="270" text-anchor="middle" font-family="Arial" font-size="12">穷举法原理</text>
  <text x="200" y="290" text-anchor="middle" font-family="Arial" font-size="10">速度优势 · 重复计算</text>

  <!-- 局限性 -->
  <rect x="350" y="250" width="200" height="60" fill="#ffcc99" stroke="#333"/>
  <text x="450" y="270" text-anchor="middle" font-family="Arial" font-size="12">核心局限性</text>
  <text x="450" y="290" text-anchor="middle" font-family="Arial" font-size="10">只能解决有限计算量问题</text>

  <!-- 连接线 -->
  <line x1="300" y1="190" x2="300" y2="240" stroke="#333" stroke-width="1"/>
  <line x1="300" y1="240" x2="200" y2="240" stroke="#333" stroke-width="1" marker-end="url(#arrow)"/>
  <line x1="300" y1="240" x2="400" y2="240" stroke="#333" stroke-width="1" marker-end="url(#arrow)"/>

  <!-- 底部结论 -->
  <text x="300" y="350" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold">绝大多数现实问题无法用穷举解决</text>

  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#333"/>
    </marker>
  </defs>
</svg>
`;

const STREAM_MERMAID_IFRAME_CONTENT = `\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Success]
    B -->|No| D[Try Again]
    D --> B
    C --> E[End]
\`\`\``;

const STREAM_IMAGE_IFRAME_CONTENT =
  '<img src="https://resource.ai-shifu.cn/7b007ca873b14edeb4d3e6817f520550" />';

const STREAM_TABLE_IFRAME_CONTENT = `## Tables
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |`;

export const HTMLDemo: Story = {
  name: "HTML Demo",
  args: {
    enableTypewriter: false,
    typingSpeed: 10,
    // sandboxLoadingText: "正在生成动画...",
    // sandboxStyleLoadingText: "正在生成样式...",
    // sandboxScriptLoadingText: "正在生成脚本...",
    sandboxFullscreenButtonText: "全屏浏览",
  },
  render: (args) => {
    // const [streamContent, setStreamContent] = useState("");

    // useEffect(() => {
    //   let currentIndex = 0;
    //   let timeoutId: ReturnType<typeof setTimeout> | null = null;

    //   const streamNext = () => {
    //     if (currentIndex >= HTML_DEMO_STREAM_SOURCE.length) {
    //       timeoutId = null;
    //       return;
    //     }

    //     const chunkSize = Math.floor(Math.random() * 30) + 1;
    //     const nextIndex = Math.min(
    //       HTML_DEMO_STREAM_SOURCE.length,
    //       currentIndex + chunkSize
    //     );
    //     const nextChunk = HTML_DEMO_STREAM_SOURCE.slice(
    //       currentIndex,
    //       nextIndex
    //     );
    //     currentIndex = nextIndex;
    //     setStreamContent((prev) => `${prev}${nextChunk}`);

    //     timeoutId = setTimeout(streamNext, 80);
    //   };

    //   // Simulate SSE-like streaming by appending 1-3 characters per tick
    //   timeoutId = setTimeout(streamNext, 120);

    //   return () => {
    //     if (timeoutId) {
    //       clearTimeout(timeoutId);
    //     }
    //   };
    // }, []);
    // console.log("streamContent", streamContent);

    return <ContentRender {...args} content={HTML_DEMO_STREAM_SOURCE} />;
  },
};

export const HTMLDemoIframeOnly: Story = {
  name: "HTML Demo (Iframe Only)",
  args: {
    sandboxLoadingText: "正在生成动画...",
    sandboxStyleLoadingText: "正在生成样式...",
    sandboxScriptLoadingText: "正在生成脚本...",
    sandboxFullscreenButtonText: "全屏浏览",
    sandboxMode: "blackboard",
  },
  render: (args) => {
    const [codeContent, setCodeContent] = useState("");
    const [svgContent, setSvgContent] = useState("");
    const [mermaidContent, setMermaidContent] = useState("");
    const [imageContent, setImageContent] = useState("");
    const [tableContent, setTableContent] = useState("");
    const [htmlContent, setHtmlContent] = useState("");

    useEffect(() => {
      // Simulate SSE-style streaming for each iframe content block
      const startStreaming = (
        source: string,
        setter: typeof setCodeContent
      ) => {
        let currentIndex = 0;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const streamNext = () => {
          if (currentIndex >= source.length) {
            timeoutId = null;
            return;
          }

          const chunkSize = Math.floor(Math.random() * 30) + 1;
          const nextIndex = Math.min(source.length, currentIndex + chunkSize);
          const nextChunk = source.slice(currentIndex, nextIndex);
          currentIndex = nextIndex;
          setter((prev) => `${prev}${nextChunk}`);

          timeoutId = setTimeout(streamNext, 80);
        };

        timeoutId = setTimeout(streamNext, 120);

        return () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
        };
      };

      const cleanups = [
        startStreaming(STREAM_CODE_IFRAME_CONTENT, setCodeContent),
        startStreaming(STREAM_SVG_IFRAME_CONTENT, setSvgContent),
        startStreaming(STREAM_MERMAID_IFRAME_CONTENT, setMermaidContent),
        startStreaming(STREAM_IMAGE_IFRAME_CONTENT, setImageContent),
        startStreaming(STREAM_TABLE_IFRAME_CONTENT, setTableContent),
        startStreaming(HTML_DEMO_STREAM_SOURCE, setHtmlContent),
      ];

      return () => {
        cleanups.forEach((cleanup) => cleanup());
      };
    }, []);

    return (
      <>
        Text不渲染
        <div style={{ width: "100%", height: "700px", background: "#e0e0e0" }}>
          <IframeSandbox
            hideFullScreen
            type="markdown"
            content={
              "```mermaid\ngraph TD\n    subgraph 大语言模型的诞生\n        A[初始模型<br>空白的“大脑”] --> B[预训练<br>海量数据“上学”]\n        B --> C[后训练<br>对齐与微调]\n        C --> D[大语言模型<br>具备语言与知识]\n    end\n```\n\n你有没有想过，为什么一夜之间，好像全世界都在谈论“大模型”？\n\n伴随 ChatGPT 一起爆火的，AI 真的和人很像。"
            }
            className="content-render-iframe"
            loadingText={args.sandboxLoadingText}
            styleLoadingText={args.sandboxStyleLoadingText}
            scriptLoadingText={args.sandboxScriptLoadingText}
            fullScreenButtonText={args.sandboxFullscreenButtonText}
            mode={args.sandboxMode}
          />
        </div>
        Code
        <div style={{ width: "100%", height: "700px", background: "#e0e0e0" }}>
          <IframeSandbox
            type="markdown"
            content={codeContent}
            className="content-render-iframe"
            loadingText={args.sandboxLoadingText}
            styleLoadingText={args.sandboxStyleLoadingText}
            scriptLoadingText={args.sandboxScriptLoadingText}
            fullScreenButtonText={args.sandboxFullscreenButtonText}
            mode={args.sandboxMode}
          />
        </div>
        SVG
        <div style={{ width: "100%", height: "700px", background: "#e0e0e0" }}>
          <IframeSandbox
            type="markdown"
            content={svgContent}
            // content={`<svg width=\"100%\" height=\"100%\" viewBox=\"0 0 1000 600\" xmlns=\"http://www.w3.org/2000/svg\" style=\"background: linear-gradient(135deg, #0F63EE 0%, #1E3A8A 100%);\">\n  <defs>\n    <clipPath id=\"circleClip\">\n      <circle cx=\"200\" cy=\"300\" r=\"120\"/>\n    </clipPath>\n  </defs>\n\n  <image href=\"https://resource.ai-shifu.com/ac186b833d0e417fb02737910b3a5ae0\" x=\"80\" y=\"180\" height=\"240\" width=\"240\" clip-path=\"url(#circleClip)\"/>\n  <circle cx=\"200\" cy=\"300\" r=\"120\" fill=\"none\" stroke=\"white\" stroke-width=\"4\"/>\n\n  <text x=\"500\" y=\"280\" font-family=\"Arial, sans-serif\" font-size=\"48\" font-weight=\"bold\" fill=\"white\" text-anchor=\"middle\" style=\"text-shadow: 2px 2px 4px rgba(0,0,0,0.5);\">\n    <tspan x=\"500\" dy=\"-0.6em\">帮助 100 万人顺利走进</tspan>\n    <tspan x=\"500\" dy=\"1.2em\" font-size=\"56\">AGI 时代</tspan>\n  </text>\n\n  <text x=\"500\" y=\"400\" font-family=\"Arial, sans-serif\" font-size=\"28\" fill=\"#E0E7FF\" text-anchor=\"middle\">\n    跟 AI 学 AI 通识\n  </text>\n</svg>\n\n`}
            className="content-render-iframe"
            loadingText={args.sandboxLoadingText}
            styleLoadingText={args.sandboxStyleLoadingText}
            scriptLoadingText={args.sandboxScriptLoadingText}
            fullScreenButtonText={args.sandboxFullscreenButtonText}
            mode={args.sandboxMode}
          />
        </div>
        Mermaid
        <div style={{ width: "100%", height: "700px", background: "#e0e0e0" }}>
          <IframeSandbox
            type="markdown"
            content={mermaidContent}
            className="content-render-iframe"
            loadingText={args.sandboxLoadingText}
            styleLoadingText={args.sandboxStyleLoadingText}
            scriptLoadingText={args.sandboxScriptLoadingText}
            fullScreenButtonText={args.sandboxFullscreenButtonText}
            mode={args.sandboxMode}
          />
        </div>
        IMG
        <div style={{ width: "100%", height: "700px", background: "#e0e0e0" }}>
          <IframeSandbox
            type="markdown"
            content={imageContent}
            className="content-render-iframe"
            loadingText={args.sandboxLoadingText}
            styleLoadingText={args.sandboxStyleLoadingText}
            scriptLoadingText={args.sandboxScriptLoadingText}
            fullScreenButtonText={args.sandboxFullscreenButtonText}
            mode={args.sandboxMode}
          />
        </div>
        Table
        <div style={{ width: "100%", height: "700px", background: "#e0e0e0" }}>
          <IframeSandbox
            type="markdown"
            content={tableContent}
            className="content-render-iframe"
            loadingText={args.sandboxLoadingText}
            styleLoadingText={args.sandboxStyleLoadingText}
            scriptLoadingText={args.sandboxScriptLoadingText}
            fullScreenButtonText={args.sandboxFullscreenButtonText}
            mode={args.sandboxMode}
          />
        </div>
        HTML
        <div style={{ width: "100%", height: "700px", background: "#e0e0e0" }}>
          <IframeSandbox
            type="markdown"
            // content={`<div style=\"display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: linear-gradient(to bottom right, #f8fafc, #e0e7ff); font-family: 'Arial', sans-serif; padding: 2rem;\">\n  <div style=\"font-size: 4.5rem; font-weight: 900; color: #0F63EE; text-align: center; line-height: 1.2; margin-bottom: 3rem;\">\n    AI 是一种工具\n  </div>\n  <div style=\"font-size: 4.5rem; font-weight: 900; color: #0F63EE; text-align: center; line-height: 1.2; margin-bottom: 3rem;\">\n    每种 AI 产品都需要<br>学习使用方法\n  </div>\n  <div style=\"font-size: 4.5rem; font-weight: 900; color: #0F63EE; text-align: center; line-height: 1.2;\">\n    打造 AI 产品是<br>技术高手的事情\n  </div>\n</div>`}
            content={htmlContent}
            className="content-render-iframe"
            loadingText={args.sandboxLoadingText}
            styleLoadingText={args.sandboxStyleLoadingText}
            scriptLoadingText={args.sandboxScriptLoadingText}
            fullScreenButtonText={args.sandboxFullscreenButtonText}
            mode={args.sandboxMode}
          />
        </div>
      </>
    );
  },
};
