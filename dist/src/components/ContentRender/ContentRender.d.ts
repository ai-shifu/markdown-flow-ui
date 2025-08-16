import { default as React } from 'react';
import { OnSendContentParams, CustomRenderBarProps } from '../types';
export interface ContentRenderProps {
    content: string;
    customRenderBar?: CustomRenderBarProps;
    onSend?: (content: OnSendContentParams) => void;
    typingSpeed?: number;
    disableTyping?: boolean;
    defaultButtonText?: string;
    defaultInputText?: string;
    readonly?: boolean;
    onTypeFinished?: () => void;
    tooltipMinLength?: number;
}
declare const ContentRender: React.FC<ContentRenderProps>;
export default ContentRender;
