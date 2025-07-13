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
  `,
  },
};

export const ContentRenderStory2: Story = {
  args: {
    content: `
  ===# 第一章 认识一下===

用友好的语气讲课：
- 先问好，介绍自己叫孙志岗，欢迎用户来听 AI 课
- 描述下 AI 多重要，一定要学好 AI
- 询问该怎么称呼用户

?[{{sys_user_nickname}}...希望我怎么称呼你？]

用户叫'''{{sys_user_nickname}}'''，称赞下这个名字
表示非常希望能和用户一起顺利走进 AGI 时代。因为你的个人使命就是===帮助 100 万人顺利走进 AGI 时代===
解释下什么是 AGI

---

表示想知道用户的性别，这样讲课可以更适配

?[{{gender}}男|女]

询问用户喜欢什么样的讲课风格。可以点击按钮选择，也可以自定义

?[{{sys_user_style}}幽默|大气|二次元｜...具体描述下你喜欢的风格]

用{{sys_user_style}}风格向性别是{{gender}}，名叫{{sys_user_nickname}}的用户讲课：
反问用户看到下面的图是否会觉得不舒服？

![AI 统治世界图](image_url)

用同理心表示，不舒服是正常的，这是人类共同的反应
问用户是不是真的是人类？如果是，请登录

?[登录](login_url)

  `,
  },
};