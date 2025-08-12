import { default as React } from 'react';
import { OnSendContentParams, CustomRenderBarProps } from '../types';
export interface MarkdownFlowProps {
    initialContentList?: {
        content: string;
        isFinished?: boolean;
        defaultInputText?: string;
        defaultButtonText?: string;
        readonly?: boolean;
        customRenderBar?: CustomRenderBarProps;
    }[];
    customRenderBar?: CustomRenderBarProps;
    onSend?: (content: OnSendContentParams) => void;
    typingSpeed?: number;
    disableTyping?: boolean;
    onBlockComplete?: (blockIndex: number) => void;
}
declare const MarkdownFlow: React.FC<MarkdownFlowProps>;
export default MarkdownFlow;
