import React from 'react'
import { Button } from "@/components/ui/button"
import type { Components } from 'react-markdown'
import { OnSendContentParams } from '@/components/types'

// 定义自定义按钮节点的类型
interface CustomButtonNode {
  type: 'element'
  tagName: 'custom-button'
  properties?: {
    className?: string
    value?: string
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
  }
}

type CustomButtonProps = {
  node: CustomButtonNode
  onSend?: (content: OnSendContentParams) => void
}

interface ComponentsWithCustomButton extends Components {
  'custom-button': React.ComponentType<CustomButtonProps>
}

// 定义自定义按钮组件
const CustomButton = ({ node, onSend }: CustomButtonProps) => {
  const { value, className, variant, size, ...restProps } = node.properties || {}
  
  return (
    <Button
      variant={variant || 'default'}
      size={size || 'sm'}
      onClick={() => {
        onSend?.({ buttonText: value || '' })
        console.log('CustomButton clicked', value)
      }}
      className={className}
      {...restProps}
    >
      {value}
    </Button>
  )
}

export default CustomButton
export type { CustomButtonProps, CustomButtonNode, ComponentsWithCustomButton }