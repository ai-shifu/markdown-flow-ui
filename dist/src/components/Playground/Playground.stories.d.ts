import { StoryObj } from '@storybook/nextjs-vite';
declare const meta: {
    title: string;
    component: import('react').FC<{
        defaultContent: string;
        defaultVariables?: {
            [key: string]: any;
        };
        defaultDocumentPrompt?: string;
        styles?: React.CSSProperties;
        sseUrl?: string;
        sessionId?: string;
    }>;
    parameters: {
        layout: string;
    };
    tags: string[];
    argTypes: {
        defaultContent: {
            control: "text";
            description: string;
        };
        sessionId: {
            control: "text";
            description: string;
        };
    };
    args: {
        defaultContent: string;
        sessionId: string;
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const PlaygroundStory1: Story;
