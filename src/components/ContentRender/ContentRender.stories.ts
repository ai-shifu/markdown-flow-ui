import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import ContentRender from "./ContentRender";

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

<iframe data-tag="video" data-title="bilibili-video" src="https://if-cdn.com/api/iframe?url=https%3A%2F%2Fwww.bilibili.com%2Fvideo%2FBV1b4HezEEdW%2F%3Fspm_id_from%3D888.80997.embed_other.whitelist%26t%3D12.242315%26bvid%3DBV1b4HezEEdW&amp;key=a68bac8b6624d46b6d0ba46e5b3f8971" allowfullscreen="" allow="autoplay; encrypted-media" title="bilibili-video" class="w-full aspect-video rounded-lg border-0"></iframe>

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

点击下方按钮可以触发 Storybook 控制台中的自定义回调。<custom-button-after-content><span style="color: red;">点击自定义按钮</span></custom-button-after-content>

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
