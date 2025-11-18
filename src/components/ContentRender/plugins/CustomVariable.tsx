import React from "react";
import type { Components } from "react-markdown";
import { OnSendContentParams } from "../../types";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import MarkdownFlowInput from "../MarkdownFlowInput";
import {
  InputGroup,
  InputGroupTextarea,
} from "../../ui/inputGroup/input-group";

// Define custom variable node type
interface CustomVariableNode {
  tagName: "custom-variable";
  properties?: {
    variableName?: string;
    buttonTexts?: string[];
    buttonValues?: string[];
    placeholder?: string;
    isMultiSelect?: boolean;
  };
}

// Define custom variable component Props type
interface CustomVariableProps {
  node: CustomVariableNode;
  defaultButtonText?: string;
  defaultInputText?: string;
  defaultSelectedValues?: string[];
  readonly?: boolean;
  onSend?: (content: OnSendContentParams) => void;
  // Multi-select confirm button text (i18n support)
  confirmButtonText?: string;
  beforeSend?: (param: OnSendContentParams) => boolean;
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
  defaultSelectedValues,
  onSend,
  confirmButtonText = "Confirm", // Default to English, can be overridden
  beforeSend = () => true,
}: CustomVariableProps) => {
  const [inputValue, setInputValue] = React.useState(defaultInputText || "");
  const [selectedValues, setSelectedValues] = React.useState<string[]>(
    defaultSelectedValues || []
  );
  const isMultiSelect = node.properties?.isMultiSelect ?? false;

  const handleButtonClick = (value: string) => {
    const param = {
      variableName: node.properties?.variableName || "",
      buttonText: value,
    };
    if (!beforeSend?.(param)) return;
    onSend?.(param);
  };

  const handleCheckboxChange = (value: string, checked: boolean) => {
    setSelectedValues((prev) => {
      if (checked) {
        return [...prev, value];
      } else {
        return prev.filter((v) => v !== value);
      }
    });
  };

  const handleConfirmClick = () => {
    const noSelection = selectedValues.length === 0 && !inputValue?.trim();
    const param = {
      variableName: node.properties?.variableName || "",
      selectedValues,
      inputText: inputValue?.trim() || undefined,
    };
    if (readonly || noSelection) return;
    if (!beforeSend?.(param)) return;
    onSend?.(param);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isMultiSelect) {
        const noSelection = selectedValues.length === 0 && !inputValue.trim();
        if (!noSelection) handleConfirmClick();
      } else {
        handleSendClick();
      }
    }
  };
  const handleSendClick = () => {
    const param = {
      variableName: node.properties?.variableName || "",
      inputText: inputValue,
    };
    if (!beforeSend?.(param)) return;
    onSend?.(param);
  };

  const resolvedDefaultButtonText = React.useMemo(() => {
    if (!defaultButtonText) {
      return undefined;
    }
    const buttonTexts = node.properties?.buttonTexts || [];
    const buttonValues = node.properties?.buttonValues || [];
    const valueIndex = buttonValues.indexOf(defaultButtonText);
    if (valueIndex > -1) {
      return buttonTexts[valueIndex] ?? defaultButtonText;
    }
    const textIndex = buttonTexts.indexOf(defaultButtonText);
    if (textIndex > -1) {
      return buttonTexts[textIndex];
    }
    return undefined;
  }, [
    defaultButtonText,
    node.properties?.buttonTexts,
    node.properties?.buttonValues,
  ]);

  return (
    <span className="custom-variable-container inline-flex items-center flex-wrap">
      {isMultiSelect ? (
        // Multi-select mode: render checkboxes
        <span className="multi-select-container inline-flex flex-col gap-2 w-full">
          <span className="flex flex-wrap gap-2">
            {node.properties?.buttonTexts?.map((text, index) => {
              const value = node.properties?.buttonValues?.[index];
              const buttonValue = value !== undefined ? value : text;
              return (
                <Checkbox
                  key={index}
                  label={text}
                  disabled={readonly}
                  checked={selectedValues.includes(buttonValue)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(buttonValue, checked)
                  }
                  className="text-sm"
                />
              );
            })}
          </span>
          {/* Input field for multi-select + text */}
          {node.properties?.placeholder && (
            <InputGroup data-disabled={readonly}>
              <InputGroupTextarea
                disabled={readonly}
                placeholder={node.properties?.placeholder}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="text-sm"
                title={node.properties.placeholder}
              />
            </InputGroup>
          )}
          {/* Confirm button for multi-select */}
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleConfirmClick}
            disabled={
              readonly || (selectedValues.length === 0 && !inputValue?.trim())
            }
            className="self-start"
          >
            {confirmButtonText}
          </Button>
        </span>
      ) : (
        <span className="single-select-container">
          {/* Single-select mode: render buttons (existing logic) */}
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
                className={`cursor-pointer h-8 text-sm hover:bg-gray-200 ${resolvedDefaultButtonText === text ? "select" : ""}`}
              >
                {text}
              </Button>
            );
          })}
        </span>
      )}
      {/* Single-select mode with text input */}
      {!isMultiSelect && node.properties?.placeholder && (
        <MarkdownFlowInput
          disabled={readonly}
          placeholder={node.properties?.placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onSend={handleSendClick}
          sendButtonDisabled={readonly || !inputValue?.trim()}
          title={node.properties.placeholder}
        />
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
