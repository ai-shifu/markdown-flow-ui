import React from 'react'
import { createElement } from 'react'
import type { Components } from 'react-markdown'

// 定义自定义按钮节点的类型
interface CustomVariableNode {
  tagName: 'custom-variable'
  properties?: {
    variableName?: string
    buttonTexts?: string[]
    placeholder?: string
  }
}

// 定义自定义按钮组件的 Props 类型
interface CustomVariableProps {
  node: CustomVariableNode
  onVariableSet?: (variable: string, value: string) => void
}

interface ComponentsWithCustomVariable extends Components {
  'custom-variable': React.ComponentType<CustomVariableProps>
}

// 定义自定义按钮组件
const CustomButtonInputVariable = ({
  node,
  onVariableSet
}: CustomVariableProps) => {
  const [inputValue, setInputValue] = React.useState('')
  const handleButtonClick = (value: string) => {
    onVariableSet?.(node.properties?.variableName || '', value)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputBlur = () => {
    onVariableSet?.(node.properties?.variableName || '', inputValue)
  }

  return createElement(
    'span',
    { className: 'custom-variable-container' },
    <>
      {node.properties?.buttonTexts?.map((text, index) =>
        createElement(
          'button',
          {
            key: index,
            className: 'custom-variable-button',
            onClick: () => handleButtonClick(text)
          },
          text
        )
      )}
      {node.properties?.placeholder && (
        <input
          type='text'
          placeholder={node.properties?.placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className='custom-variable-input'
        />
      )}
    </>
  )
}

export default CustomButtonInputVariable
export type {
  CustomVariableProps,
  CustomVariableNode,
  ComponentsWithCustomVariable
}
