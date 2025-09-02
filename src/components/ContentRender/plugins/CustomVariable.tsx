import { SendIcon } from "lucide-react";
import React from "react";
import type { Components } from "react-markdown";
import { OnSendContentParams } from "../../types";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

// Define custom variable node type
interface CustomVariableNode {
  tagName: "custom-variable";
  properties?: {
    variableName?: string;
    buttonTexts?: string[];
    buttonValues?: string[];
    placeholder?: string;
  };
}

// Define custom variable component Props type
interface CustomVariableProps {
  node: CustomVariableNode;
  defaultButtonText?: string;
  defaultInputText?: string;
  readonly?: boolean;
  onSend?: (content: OnSendContentParams) => void;
  tooltipMinLength?: number; // Control minimum character length for tooltip display, default 10
}

interface ComponentsWithCustomVariable extends Components {
  "custom-variable"?: React.ComponentType<CustomVariableProps>;
}

// Define custom variable component
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
      {node.properties?.buttonTexts?.map((text, index) => {
        const value = node.properties?.buttonValues?.[index];
        const buttonValue = value !== undefined ? value : text;
        return (
          <Button
            key={index}
            disabled={readonly}
            variant="outline"
            type="button"
            size="sm"
            onClick={() => handleButtonClick(buttonValue)}
            className={`cursor-pointer h-8 text-sm hover:bg-gray-200`}
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
        );
      })}
      {node.properties?.placeholder && (
        <span className="text-sm flex rounded-md border relative group">
          <Input
            type="text"
            disabled={readonly}
            placeholder={node.properties?.placeholder}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="w-50 h-8 text-sm border-0 shadow-none outline-none ring-0"
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
            className="h-8 w-8 mr-1  "
          >
            <SendIcon className="h-8 w-8 " />
          </Button>
        </span>
      )}
    </span>
  );
};

export default CustomButtonInputVariable;
export type {
  ComponentsWithCustomVariable,
  CustomVariableNode,
  CustomVariableProps,
};
