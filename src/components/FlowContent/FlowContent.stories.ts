import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { fn } from 'storybook/test';

import FlowContent from './FlowContent';

const meta = {
  title: 'MarkdownFlow/FlowContent',
  component: FlowContent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: { content: 'This is a test content.' },
} satisfies Meta<typeof FlowContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
  },
};

