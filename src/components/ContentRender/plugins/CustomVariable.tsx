import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Components } from 'react-markdown'
import { OnSendContentParams } from '@/components/types'
import { SendIcon } from 'lucide-react'

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
  defaultButtonText?: string
  defaultInputText?: string
  onSend?: (content: OnSendContentParams) => void
}

interface ComponentsWithCustomVariable extends Components {
  'custom-variable': React.ComponentType<CustomVariableProps>
}

// 定义自定义变量组件
const CustomButtonInputVariable = ({
  node,
  defaultButtonText,
  defaultInputText,
  onSend
}: CustomVariableProps) => {
  const [inputValue, setInputValue] = React.useState(defaultInputText || '')

  const handleButtonClick = (value: string) => {
    onSend?.({
      variableName: node.properties?.variableName || '',
      buttonText: value
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendClick()
    }
  }
  const handleSendClick = () => {
    onSend?.({
      variableName: node.properties?.variableName || '',
      inputText: inputValue
    })
  }

  return (
    <span className='custom-variable-container inline-flex items-center gap-2 flex-wrap'>
      {node.properties?.buttonTexts?.map((text, index) => (
        <Button
          key={index}
          disabled={
            defaultButtonText !== undefined || defaultInputText !== undefined
          }
          variant='outline'
          type='button'
          size='sm'
          onClick={() => handleButtonClick(text)}
          className={`cursor-pointer h-6 text-sm ${
            defaultButtonText === text ? 'bg-black text-white' : ''
          }`}
        >
          {text}
        </Button>
      ))}
      {node.properties?.placeholder && (
        <span className='text-sm flex rounded-md border'>
          <Input
            type='text'
            disabled={defaultInputText !== undefined}
            placeholder={node.properties?.placeholder}
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className='custom-variable-input w-40 h-6 text-sm border-0 shadow-none outline-none ring-0'
            style={{
              border: 'none',
              outline: 'none',
              boxShadow: 'none'
            }}
          />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={handleSendClick}
            className='h-6 w-6 mr-1 hover:bg-gray-200'
          >
            <SendIcon className='h-4 w-4' />
          </Button>
        </span>
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
