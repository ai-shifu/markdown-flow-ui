import React, { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Sparkles } from "lucide-react";

// import { fn } from 'storybook/test';

import MarkdownFlowEditor from "./MarkdownFlowEditor";
import { EditMode } from "./MarkdownFlowEditor";
import type { EditorApi, EditorAction } from "./types";
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
    disabled: {
      control: "boolean",
      description: "Disables user interactions and editing",
    },
  },
  args: {
    value: "",
    className: "",
    readOnly: false,
    disabled: false,
  },
} satisfies Meta<typeof MarkdownFlowEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

const content = `
{{quick}}

{{ quick}}

?[%{{单选}} 选项1 | 选项2]

?[%{{多选}} 选项1 || 选项2]

?[%{{多选  }} 选项1 || 选项2]

?[%{{输入框}}...请输入]

?[继续]

<!-- 这是注释内容，不会被输出 -->

=== 单行固定输出 ===

!===
多行固定输出
!===



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

=== ![Image Description](https://ai-shifu.cn/imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:2000/height:2000/https:/cdn.gamma.app/51wyzvm6tssdgg1/c8d63919f06741bb8967fa6af3a299f2/original/Cai-Se-logo-Dai-Wen-Zi-Gao-Du-Liu-Bai-h110.png) ===

## Video

=== <iframe data-tag="video" data-title="哔哩哔哩视频" data-url="https://www.bilibili.com/video/BV1ry4y1y7KZ/" class="w-full aspect-video rounded-lg border-0" src="https://player.bilibili.com/player.html?bvid=BV1ry4y1y7KZ&autoplay=0" allowfullscreen="" allow="autoplay; encrypted-media"></iframe> ===

=== <iframe data-tag="video" data-title="YouTube Video" src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowfullscreen="" allow="autoplay; encrypted-media" title="youtube-video" class="w-full aspect-video rounded-lg border-0"></iframe> ===

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
const token = "your-token-here";

const mockUploadProps: UploadProps = {
  action: "https://web01.dev.pillowai.cn/api/shifu/upfile",
  headers: {
    Authorization: `Bearer ${token}`,
    Token: token,
  },
};

export const MarkdownFlowEditorWithImage: Story = {
  args: {
    content: `Img tag with size: === <img src="https://ai-shifu.cn/imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:2000/height:2000/https:/cdn.gamma.app/51wyzvm6tssdgg1/c8d63919f06741bb8967fa6af3a299f2/original/Cai-Se-logo-Dai-Wen-Zi-Gao-Du-Liu-Bai-h110.png" width="50%"/> ===
Markdown image: === ![Markdown image](https://ai-shifu.cn/imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:2000/height:2000/https:/cdn.gamma.app/51wyzvm6tssdgg1/c8d63919f06741bb8967fa6af3a299f2/original/Cai-Se-logo-Dai-Wen-Zi-Gao-Du-Liu-Bai-h110.png) ===`,
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
    content: `Here is a variable: {{sys_user_email}}.

    有效的变量名称：
    {{name}} ✓ 简单字母
    {{userName}} ✓ 驼峰命名法
    {{user_name}} ✓ 下划线命名法
    {{UserName}} ✓ 帕斯卡命名法
    {{user123}} ✓ 包含数字
    {{_private}} ✓ 以下划线开头
    {{CONSTANT}} ✓ 全大写
    {{a}} ✓ 单个字符
    {{123user}} ✓ 以数字开头
    {{用户名}} ✓ Unicode 字符（中文）
    {{ユーザー}} ✓ Unicode 字符（日文）
    {{пользователь}} ✓ Unicode 字符（俄文）
    {{utilisateur}} ✓ Unicode 字符（法文）

    无效的变量名称：
    {{user}name}} ✗ 包含 } 字符
    {{user name}} ✗ 名称内包含空格
    {{user-name}} ✗ 包含连字符
    {{user.name}} ✗ 包含点号
    {{user@email}} ✗ 包含特殊字符
    {{🚀rocket}} ✗ 包含表情符号
    {{name[0]}} ✗ 包含方括号
    {{user+id}} ✗ 包含加号
    {{}} ✗ 空变量
    {{   }} ✗ 只有空格
    {{ name }} ✗ 大括号与名称之间有空格（不会被识别为变量）
    {{ name}} ✗ 名称前有空格（不会被识别为变量）
    {{name }} ✗ 名称后有空格（不会被识别为变量）
    `,
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

export const MarkdownFlowEditorDisabled: Story = {
  args: {
    content,
    editMode: EditMode.QuickEdit,
    locale: "en-US",
    disabled: true,
    variables: [
      { name: "sys_user_language" },
      { name: "sys_user_email" },
      { name: "plan" },
    ],
  },
};

export const MarkdownFlowEditorWithToolbarRight: Story = {
  render: (args) => {
    const apiRef = useRef<EditorApi | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalText, setModalText] = useState("插槽输入的文本");
    const toolbarActions: EditorAction[] = [
      {
        key: "insertTemplate",
        label: "插入模板",
        onClick: (api: EditorApi) => {
          api.focus();
          // 会用传入文本替换当前选区（无选区时等同插入），并把光标放到新文本末尾。
          api.replaceSelection("{{slot_variable}}");
        },
      },
      {
        key: "insertGreeting",
        label: "插入问候",
        onClick: (api: EditorApi) => {
          api.focus();
          // 会在当前光标处插入文本，并把光标移到插入内容之后，原有选中文本不变；
          api.insertTextAtCursor("Hello from toolbar slot! ");
        },
      },
      {
        key: "insertIconSnippet",
        label: "",
        icon: <Sparkles size={14} />,
        tooltip: "插入短语",
        onClick: (api: EditorApi) => {
          api.focus();
          // 一次性替换全部文本，会把当前编辑器内的所有内容替换为传入的文本
          api.setContent("✨ Powered by toolbar slot");
        },
      },
      {
        key: "modalInsert",
        label: "弹窗插入",
        tooltip: "打开弹窗输入文本",
        onClick: () => {
          setModalOpen(true);
        },
      },
    ];
    // 弹窗插入文本
    const handleModalConfirm = () => {
      if (!modalText.trim()) {
        return;
      }
      apiRef.current?.focus();
      apiRef.current?.insertTextAtCursor(`${modalText}`);
      setModalOpen(false);
    };

    return (
      <div className="flex w-[1024px] flex-col gap-3">
        <MarkdownFlowEditor
          {...args}
          toolbarActionsRight={toolbarActions}
          onReady={(api) => {
            apiRef.current = api;
          }}
        />
        {modalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-[360px] rounded-lg bg-white p-4 shadow-lg">
              <h4 className="text-base font-semibold text-neutral-900">
                请输入要插入的文本
              </h4>
              <textarea
                className="mt-3 w-full rounded border border-neutral-200 p-2 text-sm"
                rows={3}
                value={modalText}
                onChange={(e) => setModalText(e.target.value)}
              />
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded border border-neutral-200 px-3 py-1 text-sm"
                  onClick={() => setModalOpen(false)}
                >
                  取消
                </button>
                <button
                  type="button"
                  className="rounded bg-black px-3 py-1 text-sm text-white"
                  onClick={handleModalConfirm}
                >
                  插入
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  },
  args: {
    content: "点击右侧按钮或外部按钮快速插入内容。\n",
    editMode: EditMode.QuickEdit,
    locale: "zh-CN",
  },
};
