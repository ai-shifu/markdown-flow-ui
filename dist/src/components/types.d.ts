type OnSendContentParams = {
    buttonText?: string;
    variableName?: string;
    inputText?: string;
};
type CustomRenderBarProps = React.ComponentType<{
    content?: string;
    onSend?: (content: OnSendContentParams) => void;
    displayContent: string;
}>;
export type { OnSendContentParams, CustomRenderBarProps };
