import { default as React } from 'react';
type PlaygroundComponentProps = {
    defaultContent: string;
    defaultVariables?: {
        [key: string]: any;
    };
    defaultDocumentPrompt?: string;
    styles?: React.CSSProperties;
    sseUrl?: string;
    sessionId?: string;
    disableTyping?: boolean;
};
declare const PlaygroundComponent: React.FC<PlaygroundComponentProps>;
export default PlaygroundComponent;
