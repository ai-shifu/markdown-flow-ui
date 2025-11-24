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
import { cn } from "../../../lib/utils";

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
  const isSingleSelect = node.properties?.buttonTexts?.length;

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
        <span className="multi-select-container flex flex-row w-full items-center">
          <div className="flex flex-1 flex-col">
            <span className="flex flex-wrap gap-y-[9px]">
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
            {node.properties?.placeholder && (
              <div className="mt-[9px] mb-1 w-[500px]">
                <InputGroup data-disabled={readonly}>
                  <InputGroupTextarea
                    disabled={readonly}
                    placeholder={node.properties?.placeholder}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="text-sm px-3"
                    title={node.properties.placeholder}
                  />
                </InputGroup>
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex flex-col items-center pl-4",
              readonly || (selectedValues.length === 0 && !inputValue?.trim())
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            )}
            onClick={handleConfirmClick}
          >
            <span className="text-sm text-primary font-medium">
              {confirmButtonText}
            </span>
          </div>
        </span>
      ) : (
        <span className="single-select-container gap-y-[9px] flex flex-wrap">
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
        <div className={cn(isSingleSelect ? "mt-[9px] mb-1 w-[500px]" : "")}>
          <MarkdownFlowInput
            disabled={readonly}
            placeholder={node.properties?.placeholder}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onSend={handleSendClick}
            title={node.properties.placeholder}
          />
        </div>
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
