
type OnSendContentParams = {
  buttonText?: string // 用户点击按钮时的文本
  variableName?: string // 用户设置变量的名称
  inputText?: string // 用户输入的文本
}

type CustomRenderBarProps = React.ComponentType<{
    content: string
    onSend?: (content: OnSendContentParams) => void
    displayContent: string
  }>

export type { OnSendContentParams, CustomRenderBarProps }
