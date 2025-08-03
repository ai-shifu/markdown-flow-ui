import { StoryObj } from '@storybook/nextjs-vite';
declare const meta: {
    title: string;
    component: import('react').FC<import('./ContentRender').ContentRenderProps>;
    parameters: {
        layout: string;
    };
    tags: string[];
    argTypes: {
        content: {
            control: "text";
            description: string;
        };
    };
    args: {
        content: string;
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const ContentRenderStory1: Story;
export declare const ContentRenderStory2: Story;
export declare const ContentRenderStory3: Story;
export declare const ContentRenderStory4: Story;
export declare const ContentRenderStory5: Story;
