import type { Meta, StoryObj } from "@storybook/nextjs-vite";

// import { fn } from 'storybook/test';

import MarkdownFlowEditor from "./MarkdownFlowEditor";
import { EditMode } from "./MarkdownFlowEditor";
import type { UploadProps } from "./uploadTypes";

const meta = {
  title: "MarkdownFlow/MarkdownFlowEditor",
  component: MarkdownFlowEditor,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: "text",
      description: "Markdown content to edit",
    },
    onChange: {
      action: "onChange",
      description: "Callback when content changes",
    },
    className: {
      control: "text",
      description: "Class name to apply to the editor",
    },
    readOnly: {
      control: "boolean",
      description: "Whether the editor is read-only",
    },
  },
  args: {
    value: "",
    className: "",
    readOnly: false,
  },
} satisfies Meta<typeof MarkdownFlowEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

const content = `
# Complete Markdown Syntax Test

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

<iframe data-tag="video" data-title="YouTube Video" src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowfullscreen="" allow="autoplay; encrypted-media" title="youtube-video" class="w-full aspect-video rounded-lg border-0"></iframe>

## Blockquotes
> This is a blockquote
> Second line of quote
> > Nested blockquote

## Code Blocks
\`\`\`javascript
// JavaScript code block
function hello() {
  console.log("Hello World!");
}
\`\`\`

\`\`\`python
# Python code block
def hello():
    print("Hello World!")
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
This demonstrates various Markdown syntax elements, including custom variable syntax.
    `;

// const content = `
// - 保持一致的风格，用 {{sys_user_language}} 语言原样输出：## 知其所以然
// - 简单阐述下现在很多人对 AI 是「知其然而不知其所以然」，这会带来的问题：让人不能举一反三，出现新情况就束手无策；强依赖死记硬背，记忆负担大，还容易遗忘
// - 基于用户的背景找到一个常见场景举例，在这个场景里用提示词会时好时坏，很不稳定。不懂原理的人就会乱改提示词做实验，而懂的人能知道该怎么做可以不断地提升正确率
// - 也就是说，如果懂了 AI 的通识原理，面对无论 ChatGPT、DeepSeek、Gemini、Kimi，还是AiPPT、Manus 等在用户文化圈里的基于 LLM 的众多工具，都能一眼看透其本质，知道如何能更好地操纵而获得想要的结果。任何新 AI 工具出现都是如此，只会让我们如虎添翼，而不会增加认知负担，更容易达成目标
// ---

// - 承认一个事实，大多数人都以为大模型 AI 的原理是非常复杂的，要技术大牛、算法高手才能搞懂
// - 强调大多数人都错了。真实情况是，大模型「大道至简」，其原理比传统的计算机技术都要简单，技术小白也完全能学懂。很多人更不知道的是，懂人性的人，比懂技术的人反倒更容易理解大模型，控制好大模型
// - 基于用户的背景类比举例子，让用户相信，这门课所讲的内容，是人人都必须知道的 AI 常识。如果不懂这些常识，会让工作和生活多么糟糕
// - 告诉用户，学完全课只需要三小时。然后介绍课程包含的内容，并说明知道这些内容能获得哪些马上可见的好处。课程内容如下：
//    1. 大模型的智能是怎么来的。领会神奇背后的「大道至简」
//    2. 智能，却常犯错。大模型的各种奇怪现象的原因是什么？用好 AI 避免错误的关键是什么？ 控制 AI 的本质动作是什么？
//    3. 怎样操纵大模型的记忆，使其更个性、贴心地为我们服务。普通人怎样理解和应用 RAG、微调？
//    4. 怎样实现 AI 自动化工作流？AI 真能代替人吗？怎样代替人？人还有什么作用？
//    5. 未来，我们应该如何与 AI 和谐相处？
// ---

// - 询问用户是否也感受到了：AI 正在改变一切，而且还在高速进化，速度超出想象
// - 讲述埃隆·马斯克在 2025 年初的一次访谈中做的预测：「未来3-4年内，除了体力活，AI 几乎能完成所有脑力工作」。评价这个预测，虽然可能不一定精准，但 AI 会越来越聪明，能力越来越强，人类会越来越依赖 AI 的趋势，是必然的。越来越多的专家相信，AI 的影响一定非常巨大。很可能会超过蒸汽机、电、计算机和互联网的影响总和
// - 问用户：面向剧烈变化的未来，打算怎么做呢？
// ---

// ?[%{{plan}}等待一切明确了，再见招拆招//等待一切明确了，再见招拆招|积极准备，以不变应万变//积极准备，以不变应万变|创造未来，把变化把握在自己手中//创造未来，把变化把握在自己手中]
// - 面向未来 AI 对社会影响的不确定性，用户的计划是'''{{plan}}'''。首先肯定这个计划，夸赞其优点，并结合这个计划建议用户学习本课。强调课程能让用户掌握 AI 时代相对比较稳定的根基，就能笑看各种风云变幻。
// - 保持一致的风格，用 {{sys_user_language}} 语言原样输出：「**技术大神创造 AI，懂原理的人驾驭 AI，普通人只能操作 AI**」
// - 鼓励用户掌握 AI 的通识原理，就能随心所欲地驾驭 AI，超越普通人
// - 这门课程就能帮助用户超越普通人，而且全程一对一为用户量身定制，随时可以互动交流，本来定价是 299 元
// - 但为了能让更多人掌握最有价值的 AI 知识，现在只需 **9.9 元**就能获得这门课
// - 只希望用户在学习过程中，如果有收获，比如学到了有用的知识，解答了长期的困惑，掌握了好用的技巧，刷新了旧的认知等，就把这门课推荐给身边的人，也帮助他们能顺利走进 AGI 时代
// ---

// ?[去支付//_sys_pay]
// - 先恭喜用户购课成功
// - 然后表示为了更好的支持学员学习，建议用户扫码关注 AI 师傅服务号?，如果学习中遇到平台操作问题时，可以给服务号留言
// - 原样输出 HTML 代码：<img src="https://resource.ai-shifu.cn/qrcode_for_gh_7cb879a76b6a_258.jpg" style="width:258px">
// ---
// `;

export const MarkdownFlowEditorWithCodeEditStory: Story = {
  args: {
    content,
  },
};

export const MarkdownFlowEditorWithQuickEditStory: Story = {
  args: {
    content,
    editMode: EditMode.QuickEdit,
    locale: "zh-CN",
    variables: [{ name: "sys_user_language" }, { name: "plan" }],
  },
};
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZDY3YTBlOGIyMGVkNGQ5MjlkMjA3Y2MxMjdhNGQ3M2EiLCJ0aW1lX3N0YW1wIjoxNzYwMDgyODY4Ljg1NjM4NDh9.GzpoT14Z1rh4BDq2ThJqpvQfx0tghVm71B8SSzjBedU";
const mockUploadProps: UploadProps = {
  action: "https://web01.dev.pillowai.cn/api/shifu/upfile",
  headers: {
    Authorization: `Bearer ${token}`,
    Token: token,
  },
};

export const MarkdownFlowEditorWithImage: Story = {
  args: {
    content: `Img tag with size: <img src="https://ai-shifu.cn/imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:2000/height:2000/https:/cdn.gamma.app/51wyzvm6tssdgg1/c8d63919f06741bb8967fa6af3a299f2/original/Cai-Se-logo-Dai-Wen-Zi-Gao-Du-Liu-Bai-h110.png" width="50%"/>
Markdown image: ![Markdown image](https://ai-shifu.cn/imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:2000/height:2000/https:/cdn.gamma.app/51wyzvm6tssdgg1/c8d63919f06741bb8967fa6af3a299f2/original/Cai-Se-logo-Dai-Wen-Zi-Gao-Du-Liu-Bai-h110.png)`,
    editMode: EditMode.QuickEdit,
    uploadProps: mockUploadProps,
    onChange: (value) => {
      console.log("value", value);
    },
  },
};

export const MarkdownFlowEditorWithDivider: Story = {
  args: {
    content: `# Divider 示例

在任意位置使用 \`/分割线\` 可以快速插入 Markdown 分割线。

---

上面的分割线为 \`---\`。你可以删除它，再通过 Slash 菜单重新插入以测试新功能。
`,
    editMode: EditMode.QuickEdit,
    locale: "zh-CN",
  },
};

export const MarkdownFlowEditorWithVariables: Story = {
  args: {
    content: `Here is a variable: {{sys_user_email}}.`,
    editMode: EditMode.QuickEdit,
    locale: "zh-CN",
    variables: [{ name: "sys_user_phone" }, { name: "sys_user_email" }],
    systemVariables: [
      { name: "sys_user_nickname", label: "请输入昵称" },
      { name: "sys_user_style", label: "授课风格" },
    ],
  },
};

export const MarkdownFlowEditorWithFixedText: Story = {
  args: {
    content: `Fixed text: ===Fixed text===`,
    editMode: EditMode.QuickEdit,
    onChange: (value) => {
      console.log("value", value);
    },
  },
};
