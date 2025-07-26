import React from 'react'
import { Button } from '@/components/ui/button'
import type { Components } from 'react-markdown'
import { OnSendContentParams } from '@/components/types'

// 定义自定义按钮节点的类型
interface CustomButtonNode {
  type: 'element'
  tagName: 'custom-button'
  properties?: {
    buttonText?: string
  }
}

type CustomButtonProps = {
  node: CustomButtonNode
  defaultButtonText?: string
  onSend?: (content: OnSendContentParams) => void
}

interface ComponentsWithCustomButton extends Components {
  'custom-button': React.ComponentType<CustomButtonProps>
}

// 定义自定义按钮组件
const CustomButton = ({ node, defaultButtonText ,onSend }: CustomButtonProps) => {
  const { buttonText, ...restProps } = node.properties || {}

  const handleButtonClick = () => {
    onSend?.({ buttonText: buttonText || '' })
  }

  return (
    <Button
      variant='outline'
      disabled={defaultButtonText !== undefined}
      size='sm'
      onClick={handleButtonClick}
      className="cursor-pointer h-6 text-sm"
      {...restProps}
    >
      {buttonText}
    </Button>
  )
}

export default CustomButton
export type { CustomButtonProps, CustomButtonNode, ComponentsWithCustomButton }
