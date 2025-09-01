type OnSendContentParams = {
  buttonText?: string; // Text displayed when user clicks button
  variableName?: string; // Name of the variable being set by user
  inputText?: string; // Text input by user
};

type CustomRenderBarProps = React.ComponentType<{
  content?: string;
  onSend?: (content: OnSendContentParams) => void;
  displayContent: string;
}>;

export type { OnSendContentParams, CustomRenderBarProps };
