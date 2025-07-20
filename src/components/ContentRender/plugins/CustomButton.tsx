import React from 'react'
import { createElement } from 'react'
import type { Components } from 'react-markdown'

// 定义自定义按钮节点的类型
interface CustomButtonNode {
  type: 'element'
  tagName: 'custom-button'
  properties?: {
    className?: string
    value?: string
  }
}

type CustomButtonProps = {
  node: CustomButtonNode
  onClick?: (value: string) => void
}

interface ComponentsWithCustomButton extends Components {
  'custom-button': React.ComponentType<CustomButtonProps>
}

// 定义自定义按钮组件
const CustomButton = ({ node, onClick }: CustomButtonProps) => {
  return createElement(
    'button',
    {
      className: 'custom-button',
      onClick: () => {
        onClick?.(node.properties?.value || '')
        console.log('CustomButton clicked', node.properties?.value)
      }
    },
    `${node.properties?.value}`
  )
}

export default CustomButton
export type { CustomButtonProps, CustomButtonNode, ComponentsWithCustomButton }
