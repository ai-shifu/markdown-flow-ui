import type { Meta, StoryObj } from '@storybook/nextjs-vite';

// import { fn } from 'storybook/test';

import ContentRender from './ContentRender';

const meta = {
  title: 'MarkdownFlow/ContentRender',
  component: ContentRender,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    content: {
      control: 'text',
      description: 'Markdown content to render',
    },
  },
  args: { content: '' },
} satisfies Meta<typeof ContentRender>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ContentRenderStory1: Story = {
  args: {
    content: `
  ## 欢迎使用自定义按钮
  
  点击继续: ?[Continue]
  
  或者尝试: ?[确认提交]

  或者尝试: ?[%{{inputVariable}}确认提交]

  或者尝试: ?[%{{inputVariable}}...希望我怎么称呼你]

  # 欢迎使用 Markdown

这是一个 **粗体** 文本和 *斜体* 文本。

- 列表项1
- 列表项2

[Google](https://google.com)

![图片](http://gips3.baidu.com/it/u=1821127123,1149655687&fm=3028&app=3028&f=JPEG&fmt=auto?w=720&h=1280)

~~删除线文本~~


\`\`\`javascript
console.log('Hello World');

  `,
    disableTyping: false
  },
};

export const ContentRenderStory2: Story = {
  args: {
    content: `

用友好的语气讲课：
- 先问好，介绍自己叫孙志岗，欢迎用户来听 AI 课
- 描述下 AI 多重要，一定要学好 AI
- 询问该怎么称呼用户

?[%{{sys_user_nickname}}...希望我怎么称呼你]

用户叫'''{{sys_user_nickname}}'''，称赞下这个名字
表示非常希望能和用户一起顺利走进 AGI 时代。因为你的个人使命就是===帮助 100 万人顺利走进 AGI 时代===
解释下什么是 AGI

---

表示想知道用户的性别，这样讲课可以更适配

?[%{{gender}}男|女]

询问用户喜欢什么样的讲课风格。可以点击按钮选择，也可以自定义

?[%{{sys_user_style}}幽默|大气|二次元|...具体描述下你喜欢的风格]

用{{sys_user_style}}风格向性别是{{gender}}，名叫{{sys_user_nickname}}的用户讲课：
反问用户看到下面的图是否会觉得不舒服？

![AI 统治世界图](http://gips3.baidu.com/it/u=1821127123,1149655687&fm=3028&app=3028&f=JPEG&fmt=auto?w=720&h=1280)

用同理心表示，不舒服是正常的，这是人类共同的反应
问用户是不是真的是人类？如果是，请登录

?[登录](login_url)

  `,
    disableTyping: false
  },
};

export const ContentRenderStory3: Story = {
  args: {
    content: `# Markdown 语法示例

## 基础文本样式
**粗体文本**、*斜体文本*、~~删除线文本~~、\`行内代码\`

## 列表
### 无序列表
- 列表项1
- 列表项2
  - 嵌套列表项
- 列表项3

### 有序列表
1. 第一项
2. 第二项
   1. 嵌套项
3. 第三项

## 链接与图片
[普通链接](https://example.com)
![图片描述](http://gips3.baidu.com/it/u=1821127123,1149655687&fm=3028&app=3028&f=JPEG&fmt=auto?w=720&h=1280)

## 引用块
> 这是一个引用块
> 第二行引用

## 代码块
\`\`\`javascript
// JavaScript 代码块
function hello() {
  console.log("Hello World!");
}
\`\`\`

## 表格
| 表头1 | 表头2 |
|-------|-------|
| 单元格1 | 单元格2 |
| 单元格3 | 单元格4 |

## 自定义变量语法示例

### 格式1: 多按钮+占位符
选择你的职业：?[%{{occupation}}战士|法师|盗贼|... 其他职业]

### 格式2: 多按钮（带空格）
选择颜色：?[%{{ color }} 红色 | 蓝色 | 绿色 ]

### 格式3: 单按钮（带空格）
确认提交：?[%{{ submit }} 确认 ]

### 格式4: 占位符（带空格）
输入用户名：?[%{{ username }} ... 请输入用户名 ]

### 混合格式
1. 无空格：?[%{{quick}}按钮1|按钮2]
2. 有空格：?[%{{ variable }} 选项A | 选项B | ... 自定义选项]
3. 复杂组合：?[%{{ complex }} 第一步 | 第二步 | 第三步 | ... 其他步骤]

## 分隔线
---

## HTML 嵌入
<p style="color: blue;">这是HTML段落</p>

## 任务列表
- [x] 已完成任务
- [ ] 未完成任务

## 脚注
这是一个带脚注的文本[^1]
[^1]: 脚注内容

## 表情符号
:smile: :heart: :+1:

## 转义字符
\*不是斜体\*、\[不是链接\]

## 数学公式（部分Markdown支持）
$$
a^2 + b^2 = c^2
$$

## 结束语
以上展示了各种Markdown语法元素，包括自定义变量语法。`,
  },
};

export const ContentRenderStory4: Story = {
  args: {
    disableTyping: true,
    content: `# Markdown 语法示例 \n\n ## 基础文本样式
**粗体文本**、*斜体文本*、~~删除线文本~~、\`行内代码\` 

?[%{{ sys_user_style }}幽默|大气|二次元｜...能否详细说明你偏好的风格特征]

## 列表
### 无序列表
- 列表项1
- 列表项2
  - 嵌套列表项
- 列表项3

### 有序列表
1. 第一项
2. 第二项
   1. 嵌套项
3. 第三项

## 链接与图片
[普通链接](https://example.com)
![图片描述](http://gips3.baidu.com/it/u=1821127123,1149655687&fm=3028&app=3028&f=JPEG&fmt=auto?w=720&h=1280)

## 引用块
> 这是一个引用块
> 第二行引用

## 代码块
\`\`\`javascript
// JavaScript 代码块
function hello() {
  console.log("Hello World!");
}
\`\`\`

## 表格
| 表头1 | 表头2 |
|-------|-------|
| 单元格1 | 单元格2 |
| 单元格3 | 单元格4 |

## 自定义变量语法示例

### 格式1: 多按钮+占位符
选择你的职业：?[%{{occupation}}战士|法师|盗贼|... 其他职业]

### 格式2: 多按钮（带空格）
选择颜色：?[%{{ color }} 红色 | 蓝色 | 绿色 ]

### 格式3: 单按钮（带空格）
确认提交：?[%{{ submit }} 确认 ]

### 格式4: 占位符（带空格）
输入用户名：?[%{{ username }} ... 请输入用户名 ]

### 混合格式
1. 无空格：?[%{{quick}}按钮1|按钮2]
2. 有空格：?[%{{ variable }} 选项A | 选项B | ... 自定义选项]
3. 复杂组合：?[%{{ complex }} 第一步 | 第二步 | 第三步 | ... 其他步骤]

## 分隔线
---

## HTML 嵌入
<p style="color: blue;">这是HTML段落</p>

## 任务列表
- [x] 已完成任务
- [ ] 未完成任务

## 脚注
这是一个带脚注的文本[^1]
[^1]: 脚注内容

## 表情符号
:smile: :heart: :+1:

## 转义字符
\*不是斜体\*、\[不是链接\]

## 数学公式（部分Markdown支持）
$$
a^2 + b^2 = c^2
$$

## 结束语
以上展示了各种Markdown语法元素，包括自定义变量语法。`,
  },
};

export const ContentRenderMarkdownStyleShow: Story = {
  args: {
    disableTyping: true,
    content: `# 完整Markdown语法测试

## 标题测试
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题

## 文本样式
**粗体文本**、*斜体文本*、~~删除线文本~~、\`行内代码\`

## 列表测试

### 无序列表
- 第一项
- 第二项
  - 嵌套项1
  - 嵌套项2
    - 深层嵌套
- 第三项

### 有序列表
1. 第一项
2. 第二项
   1. 嵌套项1
   2. 嵌套项2
      1. 深层嵌套
3. 第三项

## 链接与图片
[普通链接](https://example.com)
![图片描述](https://via.placeholder.com/150)

## 引用块
> 这是一个引用块
> 第二行引用
> > 嵌套引用块

## 代码块
\`\`\`javascript
// JavaScript 代码块
function hello() {
  console.log("Hello World!");
}
\`\`\`

\`\`\`python
# Python 代码块
def hello():
    print("Hello World!")
\`\`\`

## 表格
| 表头1 | 表头2 | 表头3 |
|-------|-------|-------|
| 单元格1 | 单元格2 | 单元格3 |
| 单元格4 | 单元格5 | 单元格6 |

## 分隔线
---

## 任务列表
- [x] 已完成任务
- [ ] 未完成任务
- [ ] 另一个未完成任务
`,
  },
};
