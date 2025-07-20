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
  },
  args: { contents: [] },
} satisfies Meta<typeof MarkdownFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MarkdownFlowStory1: Story = {
  args: {
    contents: ['## 欢迎使用自定义按钮','dfddfdfdf','dfdfdfddfdf','## 欢迎使用自定义按钮','点击继续: ?[Continue]','或者尝试: ?[确认提交]','或者尝试: ?[{{inputVariable}}确认提交]'],
  },
};
