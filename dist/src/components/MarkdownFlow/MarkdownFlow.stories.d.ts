import { StoryObj } from '@storybook/nextjs-vite';
declare const meta: {
    title: string;
    component: import('react').FC<import('./MarkdownFlow').MarkdownFlowProps>;
    parameters: {
        layout: string;
    };
    tags: string[];
    argTypes: {
        initialContentList: {
            description: string;
            table: {
                type: {
                    summary: string;
                };
            };
        };
    };
    args: {
        initialContentList: never[];
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const MarkdownFlowStory: Story;
