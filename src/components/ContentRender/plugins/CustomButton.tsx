import React from 'react'
import { createElement } from 'react'
import type { Components } from 'react-markdown';

// 定义自定义按钮节点的类型
interface CustomButtonNode {
  type: 'customButton'
  buttonText: string
  data?: {
    hName?: string
    hProperties?: Record<string, any>
    hChildren?: Array<{ type: string; value: string }>
  }
}

// 定义自定义按钮组件的 Props 类型
interface CustomButtonProps {
  node: CustomButtonNode
}

interface ComponentsWithCustomButton extends Components {
  customButton?: React.ComponentType<CustomButtonProps>;
}

// 定义自定义按钮组件
const CustomButton: React.FC<CustomButtonProps> = ({ node }) => {
  return createElement(
    'button',
    {
      className: 'custom-button',
      onClick: () => alert(`Clicked: ${node.buttonText}`)
    },
    node.buttonText
  )
}

export default CustomButton
export type { CustomButtonProps, CustomButtonNode, ComponentsWithCustomButton }
