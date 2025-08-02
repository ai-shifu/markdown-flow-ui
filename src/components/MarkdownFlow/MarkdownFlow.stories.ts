import type { Meta, StoryObj } from '@storybook/nextjs-vite';

// import { fn } from 'storybook/test';

import MarkdownFlow from './MarkdownFlow';

const meta = {
  title: 'MarkdownFlow/MarkdownFlow',
  component: MarkdownFlow,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    initialContentList: {
      description: 'MarkdownFlow 内容列表',
      table: {
        type: { summary: '{ content: string; inputText?: string; buttonText?: string; variableName?: string; }[]' },
      },
    },
  },
  args: { initialContentList: [] },
} satisfies Meta<typeof MarkdownFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MarkdownFlowStory: Story = {
  args: {
    initialContentList: [
      {
        content: `你好呀！👋 我是孙志岗，很高兴能和你一起探索AI的奇妙世界~ \n\n在开始之前，我想先和你聊聊为什么学习AI这么重要🌟：\n\n- AI正在改变我们的生活、工作和学习方式\n\n- 掌握AI技能可以让你在未来更有竞争力\n\n- 学习AI不仅能解决实际问题，还能培养创新思维\n\n说了这么多，还不知道该怎么称呼你呢？😊 可以告诉我你的名字或你喜欢的称呼吗？`
      },
      {
        content: '?[%{{ sys_user_nickname }}...希望我怎么称呼你？]',
        defaultInputText: 'amy',
        readonly: true,
      },
      {
        content: `Amy 是一个美丽又充满力量的名字，让我想到：\n\n- Ambitious（有抱负的）— 充满追求和上进心\n\n- Magnetic（有魅力的）— 像磁铁一样吸引人\n\n- Youthful（年轻的）— 永远保持年轻的心态`,
      },
      {
        content: `?[继续]`,
        defaultButtonText: '继续',
        readonly: true,
      },
      {
        content: `Amy，为了更好地适配讲课内容，我可以了解一下你的性别吗？（这样我能用更合适的称呼方式~）`,
      },
      {
        content: `?[%{{ gender }}男|女]`,
        defaultButtonText: '男',
        readonly: true,
      },
      {
        content: `（比如："想要《甄嬛传》宫斗式教学" 或 "用美妆步骤比喻机器学习流程"💄）\n\n期待为你打造独一无二的学习体验！🎯`,
      },
      {
        content: `?[%{{ sys_user_style }}幽默|大气|二次元｜...具体描述下你喜欢的风格]`,
        defaultButtonText: '幽默',
        readonly: true,
      },
    ],
  },
};