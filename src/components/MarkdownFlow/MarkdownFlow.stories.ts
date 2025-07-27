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

export const MarkdownFlowStory: Story = {
  args: {
  },
};

export const MarkdownFlowWithHistoryMessageList: Story = {
  args: {
  },
};
