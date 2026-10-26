import React, { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EditorView } from "@codemirror/view";
import { Sparkles } from "lucide-react";

import { expect, userEvent, waitFor, within } from "storybook/test";
import { getEditorLocaleMessages } from "./editorI18n";

import MarkdownFlowEditor from "./MarkdownFlowEditor";
import { EditMode } from "./MarkdownFlowEditor";
import type { EditorApi, EditorAction } from "./types";
import type { UploadProps } from "./uploadTypes";

const meta = {
  title: "MarkdownFlow/MarkdownFlowEditor",
  component: MarkdownFlowEditor,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "The editor does not bind search shortcuts. Ctrl+F (Cmd+F on macOS) uses the browser's page search instead of opening an editor search panel. Variable references and assignment markers remain editable source text in both editing modes, including QuickEdit.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    content: {
      control: "text",
      description: "Markdown content to edit",
    },
    onChange: {
      action: "onChange",
      description: "Callback when content changes",
    },
    disabled: {
      control: "boolean",
      description: "Disables user interactions and editing",
    },
  },
  args: {
    content: "",
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

=== 单行确定输出 ===

!===
多行确定输出
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

Valid variable names preserve their Unicode text and internal spaces:
{{ name }} ✓ Boundary whitespace is trimmed
{{ user_name }} ✓ Existing identifiers remain compatible
{{ 你的性别是？ }} ✓ A complete question
{{ user name }} ✓ Internal spaces
{{ user-name }} ✓ Punctuation
{{ 🚀rocket }} ✓ Emoji
{{ name[0] | hint//value...? }} ✓ Delimiters remain part of the name
{{ user} }} ✓ A single closing brace with padded serialization
{{ {{inner }} ✓ A literal opening marker in the name

Invalid names:
{{}} ✗ Empty name
{{   }} ✗ Whitespace-only name
{{ first
second }} ✗ A line break inside the trimmed name

The first literal pair of closing braces ends a marker. Names cannot contain
that pair or control characters. UserName and username are distinct, case-sensitive identities.
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
  name: "Preserved output",
  render: (args) => <ControlledEditor {...args} />,
  args: {
    content: "Preserved output: ===Preserved output===",
    editMode: EditMode.QuickEdit,
    locale: "en-US",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const texts = getEditorLocaleMessages(args.locale);
    await userEvent.click(
      canvasElement.querySelector<HTMLElement>(".cm-content")!
    );
    const insertOutput = canvas.getByRole("button", {
      name: texts.toolbarConfirmOutput,
    });
    await userEvent.hover(insertOutput);
    await waitFor(() =>
      expect(
        within(canvasElement.ownerDocument.body).getByRole("tooltip")
      ).toHaveTextContent(texts.toolbarConfirmOutput)
    );
    await userEvent.click(insertOutput);
    const editor = EditorView.findFromDOM(
      canvasElement.querySelector<HTMLElement>(".cm-editor")!
    )!;
    await waitFor(() =>
      expect(editor.state.doc.toString()).toContain("======")
    );
  },
};

export const MarkdownFlowEditorWithPreservedOutputChinese: Story = {
  ...MarkdownFlowEditorWithFixedText,
  name: "Preserved output (Chinese)",
  args: {
    ...MarkdownFlowEditorWithFixedText.args,
    locale: "zh-CN",
    content: "确定输出：===确定输出===",
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

export const MarkdownFlowEditorFrenchLocale: Story = {
  args: {
    content: `## Bonjour

Tapez '/' pour insérer une image ou une vidéo.

Variable système: {{sys_user_language}}
`,
    editMode: EditMode.QuickEdit,
    locale: "fr-FR",
    variables: [{ name: "sys_user_language" }, { name: "plan" }],
  },
};

export const MarkdownFlowEditorSpanishLocale: Story = {
  args: {
    content: `## Hola

Escribe '/' para insertar una imagen o un vídeo.

Variable del sistema: {{sys_user_language}}
`,
    editMode: EditMode.QuickEdit,
    locale: "es-ES",
    variables: [{ name: "sys_user_language" }, { name: "plan" }],
  },
};

export const MarkdownFlowEditorArabicLocale: Story = {
  args: {
    content: `## مرحبًا

اكتب '/' لإدراج صورة أو فيديو.

متغير النظام: {{sys_user_language}}
`,
    editMode: EditMode.QuickEdit,
    locale: "ar-SA",
    variables: [{ name: "sys_user_language" }, { name: "plan" }],
  },
};

export const MarkdownFlowEditorThaiLocale: Story = {
  args: {
    content: `## สวัสดี

พิมพ์ '/' เพื่อแทรกรูปภาพหรือวิดีโอ

ตัวแปรระบบ: {{sys_user_language}}
`,
    editMode: EditMode.QuickEdit,
    locale: "th-TH",
    variables: [{ name: "sys_user_language" }, { name: "plan" }],
  },
};

export const MarkdownFlowEditorGermanLocale: Story = {
  args: {
    content:
      "## Hallo\n\nGib '/' ein, um ein Bild oder Video einzufügen.\n\nSystemvariable: {{sys_user_language}}\n",
    editMode: EditMode.QuickEdit,
    locale: "de-DE",
    variables: [{ name: "sys_user_language" }, { name: "plan" }],
  },
};

export const MarkdownFlowEditorJapaneseLocale: Story = {
  args: {
    content:
      "## こんにちは\n\n「/」を入力して画像や動画を挿入します。\n\nシステム変数: {{sys_user_language}}\n",
    editMode: EditMode.QuickEdit,
    locale: "ja-JP",
    variables: [{ name: "sys_user_language" }, { name: "plan" }],
  },
};

export const MarkdownFlowEditorUrduLocale: Story = {
  args: {
    content:
      "## خوش آمدید\n\nتصویر یا ویڈیو شامل کرنے کے لیے '/' ٹائپ کریں۔\n\nنظام کا متغیر: {{sys_user_language}}\n",
    editMode: EditMode.QuickEdit,
    locale: "ur-PK",
    variables: [{ name: "sys_user_language" }, { name: "plan" }],
  },
};

export const MarkdownFlowEditorFilipinoLocale: Story = {
  args: {
    content:
      "## Kumusta\n\nI-type ang '/' para maglagay ng larawan o bidyo.\n\nBaryabol ng sistema: {{sys_user_language}}\n",
    editMode: EditMode.QuickEdit,
    locale: "fil-PH",
    variables: [{ name: "sys_user_language" }, { name: "plan" }],
  },
};

export const MarkdownFlowEditorVietnameseLocale: Story = {
  args: {
    content:
      "## Xin chào\n\nNhập '/' để chèn hình ảnh hoặc video.\n\nBiến hệ thống: {{sys_user_language}}\n",
    editMode: EditMode.QuickEdit,
    locale: "vi-VN",
    variables: [{ name: "sys_user_language" }, { name: "plan" }],
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

export const QuestionMemoryKeys: Story = {
  args: {
    editMode: EditMode.QuickEdit,
    content: `你的性别是？
?[%{{ 你的性别是？ }} 男 | 女 | 秘密]

Which-option?
?[%{{ Which [path] | level//hint...? }} A | B]

{{ name} }}

{{你的性别是？}} / {{user_name}}`,
    variables: [
      { name: "你的性别是？" },
      { name: "user_name" },
      { name: "Which [path] | level//hint...?" },
      { name: "name}" },
    ],
  },
};

const ControlledEditor = (
  args: React.ComponentProps<typeof MarkdownFlowEditor>
) => {
  const [value, setValue] = useState(args.content ?? "");
  return <MarkdownFlowEditor {...args} content={value} onChange={setValue} />;
};

export const ToolbarWithoutVariableActions: Story = {
  render: (args) => <ControlledEditor {...args} />,
  args: { locale: "en-US", editMode: EditMode.QuickEdit },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const texts = getEditorLocaleMessages("en-US");
    const toolbar = canvasElement.querySelector(
      ".markdown-flow-editor-toolbar-left"
    )!;
    expect(
      within(toolbar)
        .getAllByRole("button")
        .map((button) => button.getAttribute("aria-label"))
    ).toEqual([
      texts.toolbarInsertSingleChoice,
      texts.toolbarInsertMultiChoice,
      texts.toolbarInsertInput,
      texts.toolbarInsertButton,
      texts.toolbarConfirmOutput,
      texts.toolbarInsertImage,
      texts.toolbarInsertVideo,
    ]);
    await userEvent.click(
      canvasElement.querySelector<HTMLElement>(".cm-content")!
    );
    await userEvent.click(
      canvas.getByRole("button", { name: texts.toolbarInsertSingleChoice })
    );
    await waitFor(() =>
      expect(canvasElement.querySelector(".cm-content")?.textContent).toBe(
        "?[%{{  }} Option 1 | Option 2]"
      )
    );
    expect(
      canvasElement.querySelector(".markdown-flow-editor-variable-search")
    ).toBeNull();
  },
};

export const SlashMenuWithoutVariables: Story = {
  render: (args) => <ControlledEditor {...args} />,
  args: { locale: "en-US", editMode: EditMode.QuickEdit },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const texts = getEditorLocaleMessages("en-US");
    const editor = canvasElement.querySelector<HTMLElement>(".cm-content")!;
    await userEvent.click(editor);
    await userEvent.type(editor, "/");
    await waitFor(() =>
      expect(
        canvas.getAllByRole("option").map((option) => option.textContent)
      ).toEqual([texts.slashImage, texts.slashVideo])
    );
    await userEvent.click(
      canvas.getByRole("option", { name: texts.slashImage })
    );
    await page.findByRole("dialog", { name: texts.dialogTitleImage });
  },
};

export const EditableVariableSyntax: Story = {
  render: (args) => <ControlledEditor {...args} />,
  args: {
    locale: "en-US",
    editMode: EditMode.QuickEdit,
    content: "Before {{ learner }} / ?[%{{完整问题}} A | B] after",
  },
  play: async ({ canvasElement, args }) => {
    const getView = () => {
      const editor = canvasElement.querySelector<HTMLElement>(".cm-content");
      expect(editor).not.toBeNull();
      const view = EditorView.findFromDOM(editor!);
      expect(view).not.toBeNull();
      return view!;
    };
    await waitFor(() =>
      expect(getView().state.doc.toString()).toBe(args.content)
    );
    getView().dispatch({ selection: { anchor: 0 } });
    await waitFor(() => {
      expect(canvasElement.querySelector(".cm-content")?.textContent).toBe(
        args.content
      );
      expect(canvasElement.querySelector(".tag-variable")).toBeNull();
    });

    const referenceView = getView();
    referenceView.dispatch({
      selection: {
        anchor: referenceView.state.doc.toString().indexOf("learner") + 3,
      },
    });
    referenceView.focus();
    await userEvent.keyboard("X");
    await waitFor(() =>
      expect(getView().state.doc.toString()).toBe(
        "Before {{ leaXrner }} / ?[%{{完整问题}} A | B] after"
      )
    );

    const assignmentView = getView();
    assignmentView.dispatch({
      selection: {
        anchor: assignmentView.state.doc.toString().indexOf("完整问题") + 2,
      },
    });
    assignmentView.focus();
    await userEvent.keyboard("X");
    const editedSource =
      "Before {{ leaXrner }} / ?[%{{完整X问题}} A | B] after";
    await waitFor(() =>
      expect(getView().state.doc.toString()).toBe(editedSource)
    );

    const finalView = getView();
    finalView.dispatch({ selection: { anchor: finalView.state.doc.length } });
    await waitFor(() => {
      expect(getView().state.doc.toString()).toBe(editedSource);
      expect(canvasElement.querySelector(".cm-content")?.textContent).toBe(
        editedSource
      );
      expect(canvasElement.querySelector(".tag-variable")).toBeNull();
    });
  },
};

export const MediaLikeVariableNames: Story = {
  render: (args) => <ControlledEditor {...args} />,
  args: {
    editMode: EditMode.QuickEdit,
    content: [
      "Before {{ ![avatar](https://example.com/a.png) }} after",
      '{{ <img src="https://example.com/b.png"> }}',
      '{{ <iframe data-tag="video" src="https://example.com/movie"></iframe> }}',
    ].join("\n"),
  },
  play: async ({ canvasElement, args }) => {
    await waitFor(() => {
      const lines = canvasElement.querySelectorAll(".cm-content .cm-line");
      expect(Array.from(lines, (line) => line.textContent).join("\n")).toBe(
        args.content
      );
      expect(
        canvasElement.querySelector(".tag-variable, .tag-image, .tag-video")
      ).toBeNull();
    });
  },
};
