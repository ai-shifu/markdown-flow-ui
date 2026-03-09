import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Slide from "./Slide";
import type { Element } from "./Slide";

const meta = {
  title: "MarkdownFlow/Slide",
  component: Slide,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    elementList: {
      description: "Slide element data list",
      table: {
        type: {
          summary:
            "{ content: string; type: string; is_show?: boolean; operation?: string; is_checkpoint?: boolean; serial_number?: number; is_read?: boolean; audio_url?: string; audio_segments?: string[]; }[]",
        },
      },
    },
  },
  args: {
    elementList: [],
  },
} satisfies Meta<typeof Slide>;

export default meta;

type Story = StoryObj<typeof meta>;

const exampleElementList: Element[] = [
  {
    content: "# Slide Title\n\nThis is a simple markdown content block.",
    type: "title",
    is_show: true,
    operation: "new",
    is_checkpoint: true,
    serial_number: 1,
    is_read: true,
    audio_url: "https://cdn.ai-shifu.example/audio/chapter-1.mp3",
    audio_segments: ["UklGRkAAAABXQVZF", "QVVESU9TRUdNRU5U"],
  },
  {
    content: "```javascript\nconsole.log('render code content');\n```",
    type: "code",
    is_show: true,
    operation: "append",
    is_checkpoint: false,
    serial_number: 2,
    is_read: false,
    audio_url: "",
    audio_segments: ["QVBQRU5EX1NFR01FTlQ="],
  },
  {
    content: '<div class="rounded-lg border p-4">Render html content</div>',
    type: "html",
    is_show: false,
    operation: "append",
    is_checkpoint: false,
    serial_number: 3,
    is_read: true,
    audio_url: "https://cdn.ai-shifu.example/audio/chapter-3.mp3",
    audio_segments: [],
  },
];

export const Default: Story = {
  args: {
    elementList: exampleElementList,
  },
};
