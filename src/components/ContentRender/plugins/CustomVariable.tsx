import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Components } from 'react-markdown'

// 定义自定义变量节点的类型
interface CustomVariableNode {
  tagName: 'custom-variable'
  properties?: {
    variableName?: string
    buttonTexts?: string[]
    placeholder?: string
  }
}

// 定义自定义变量组件的 Props 类型
interface CustomVariableProps {
  node: CustomVariableNode
  onVariableSet?: (variable: string, value: string) => void
}

interface ComponentsWithCustomVariable extends Components {
  'custom-variable': React.ComponentType<CustomVariableProps>
}

// 定义自定义变量组件
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur()
    }
  }

  return (
    <span className="custom-variable-container inline-flex items-center gap-2 flex-wrap">
      {node.properties?.buttonTexts?.map((text, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => handleButtonClick(text)}
          className="custom-variable-button"
        >
          {text}
        </Button>
      ))}
      {node.properties?.placeholder && (
        <Input
          type="text"
          placeholder={node.properties?.placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyPress={handleKeyPress}
          className="custom-variable-input w-40"
        />
      )}
    </span>
  )
}

export default CustomButtonInputVariable
export type {
  CustomVariableProps,
  CustomVariableNode,
  ComponentsWithCustomVariable
}