import { default as React } from 'react';
export interface MarkdownFlowEditorProps {
    value?: string;
    onChange?: (value: string) => void;
    className?: string;
    readOnly?: boolean;
    maxWidth?: string;
}
declare const MarkdownFlowEditor: React.FC<MarkdownFlowEditorProps>;
export default MarkdownFlowEditor;
