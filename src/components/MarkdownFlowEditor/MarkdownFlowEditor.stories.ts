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

export const MarkdownFlowEditorWithCustomUpload: Story = {
  args: {
    content,
    editMode: EditMode.QuickEdit,
    uploadProps: mockUploadProps,
  },
};

export const MarkdownFlowEditorWithVariables: Story = {
  args: {
    content: `Here is a variable: {{sys_user_email}}.`,
    editMode: EditMode.QuickEdit,
    variables: [
      { name: "sys_user_nickname" },
      { name: "sys_user_style" },
      { name: "sys_user_email" },
      { name: "custom_var_1" },
    ],
    uploadProps: mockUploadProps,
  },
};
