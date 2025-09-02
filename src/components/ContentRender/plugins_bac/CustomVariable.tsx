import React from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import type { Components } from "react-markdown";
import { OnSendContentParams } from "../../types";
import { SendIcon } from "lucide-react";

// 定义自定义变量节点的类型
interface CustomVariableNode {
  tagName: "custom-variable";
  properties?: {
    variableName?: string;
    buttonTexts?: string[];
    buttonValues?: string[];
    placeholder?: string;
  };
}

// 定义自定义变量组件的 Props 类型
interface CustomVariableProps {
  node: CustomVariableNode;
  defaultButtonText?: string;
  defaultInputText?: string;
  readonly?: boolean;
  onSend?: (content: OnSendContentParams) => void;
  tooltipMinLength?: number; // 控制tooltip显示的最小字符长度，默认10
}

interface ComponentsWithCustomVariable extends Components {
  "custom-variable"?: React.ComponentType<CustomVariableProps>;
}

// 定义自定义变量组件
const CustomButtonInputVariable = ({
  node,
  readonly,
  defaultButtonText,
  defaultInputText,
  onSend,
  tooltipMinLength = 10,
}: CustomVariableProps) => {
  const [inputValue, setInputValue] = React.useState(defaultInputText || "");

  const handleButtonClick = (value: string) => {
    onSend?.({
      variableName: node.properties?.variableName || "",
      buttonText: value,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendClick();
    }
  };
  const handleSendClick = () => {
    onSend?.({
      variableName: node.properties?.variableName || "",
      inputText: inputValue,
    });
  };

  return (
    <span className="custom-variable-container inline-flex items-center gap-2 flex-wrap">
      {node.properties?.buttonTexts?.map((text, index) => (
        <Button
          key={index}
          disabled={readonly}
          variant="outline"
          type="button"
          size="sm"
          onClick={() => handleButtonClick(text)}
          className={`cursor-pointer h-6 text-sm hover:bg-gray-200`}
          style={{
            backgroundColor:
              defaultButtonText === text
                ? "var(--primary, #2563eb)"
                : undefined,
            color:
              defaultButtonText === text
                ? "var(--primary-foreground, white)"
                : undefined,
          }}
        >
          {text}
        </Button>
      ))}
      {node.properties?.placeholder && (
        <span className="text-sm flex rounded-md border relative group">
          <Input
            type="text"
            disabled={readonly}
            placeholder={node.properties?.placeholder}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="w-40 h-6 text-sm border-0 shadow-none outline-none ring-0"
            style={{
              border: "none",
              outline: "none",
              boxShadow: "none",
            }}
            title={node.properties.placeholder}
          />
          {/* Tooltip */}
          {/* {node.properties.placeholder.length > tooltipMinLength && (
            <div
              className='absolute bottom-full left-0 mb-2 px-2 py-1 text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap max-w-xs'
              style={{
                backgroundColor: 'var(--tooltip-bg, #374151)',
                color: 'var(--tooltip-text, white)'
              }}
            >
              {node.properties.placeholder}
            </div>
          )} */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleSendClick}
            disabled={readonly}
            className="h-6 w-6 mr-1 hover:bg-gray-200"
          >
            <SendIcon className="h-4 w-4" />
          </Button>
        </span>
      )}
    </span>
  );
};

export default CustomButtonInputVariable;
export type {
  CustomVariableProps,
  CustomVariableNode,
  ComponentsWithCustomVariable,
};
