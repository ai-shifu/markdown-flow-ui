import { StoryObj } from '@storybook/nextjs-vite';
import { MarkdownFlowEditorProps } from './MarkdownFlowEditor';
declare const meta: {
    title: string;
    component: import('react').FC<MarkdownFlowEditorProps>;
    parameters: {
        layout: string;
    };
    tags: string[];
    argTypes: {
        value: {
            control: "text";
            description: string;
        };
        onChange: {
            action: string;
            description: string;
        };
        className: {
            control: "text";
            description: string;
        };
        readOnly: {
            control: "boolean";
            description: string;
        };
    };
    args: {
        value: string;
        onChange: (value: string) => void;
        className: string;
        readOnly: false;
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const MarkdownFlowEditorStory: Story;
