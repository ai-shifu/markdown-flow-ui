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

// Multi select section( with checkboxes and input)
interface MultiSelectSectionProps {
  node: CustomVariableNode;
  readonly?: boolean;
  selectedValues: string[];
  inputValue: string;
  confirmButtonText: string;
  handleCheckboxChange: (value: string, checked: boolean) => void;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleConfirmClick: () => void;
}

const MultiSelectSection = ({
  node,
  readonly,
  selectedValues,
  inputValue,
  confirmButtonText,
  handleCheckboxChange,
  handleInputChange,
  handleKeyDown,
  handleConfirmClick,
}: MultiSelectSectionProps) => {
  const placeholder = node.properties?.placeholder;
  const confirmDisabled =
    readonly || (selectedValues.length === 0 && !inputValue?.trim());

  const renderConfirmButton = (extraWrapperClassName?: string) => (
    <span
      className={cn(
        "multi-select-confirm-wrapper flex flex-col items-center",
        confirmDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        extraWrapperClassName
      )}
    >
      <button
        type="button"
        className="multi-select-confirm-button text-sm font-medium text-primary"
        disabled={confirmDisabled}
        onClick={handleConfirmClick}
      >
        {confirmButtonText}
      </button>
    </span>
  );

  return (
    <span className="multi-select-container flex w-full flex-col">
      <span className="flex flex-wrap gap-y-[9px] gap-x-6">
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
      {placeholder ? (
        <span className="block mb-1 w-full max-w-[500px]">
          <span className="multi-select-input-row flex w-full items-end gap-3">
            <InputGroup data-disabled={readonly} className="flex-1">
              <InputGroupTextarea
                disabled={readonly}
                placeholder={placeholder}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="text-sm px-3"
                title={placeholder}
              />
            </InputGroup>
            {renderConfirmButton("shrink-0")}
          </span>
        </span>
      ) : (
        renderConfirmButton("self-start multi-select-confirm-wrapper--stacked")
      )}
    </span>
  );
};

// Single select section( with buttons and input)
interface SingleSelectSectionProps {
  node: CustomVariableNode;
  readonly?: boolean;
  resolvedDefaultButtonText?: string;
  handleButtonClick: (value: string) => void;
  inputValue: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSendClick: () => void;
}

const SingleSelectSection = ({
  node,
  readonly,
  resolvedDefaultButtonText,
  handleButtonClick,
  inputValue,
  handleInputChange,
  handleSendClick,
}: SingleSelectSectionProps) => (
  <span className="single-select-container inline-flex w-full flex-col">
    <span className="flex flex-wrap gap-y-[9px] gap-x-2">
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
    {node.properties?.placeholder && (
      <span className="mt-[9px] mb-1">
        <MarkdownFlowInput
          disabled={readonly}
          placeholder={node.properties.placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onSend={handleSendClick}
          title={node.properties.placeholder}
        />
      </span>
    )}
  </span>
);

// Pure input
interface InputSectionProps {
  readonly?: boolean;
  placeholder?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
}

const InputSection = ({
  readonly,
  placeholder,
  value,
  onChange,
  onSend,
}: InputSectionProps) => {
  if (!placeholder) {
    return null;
  }

  return (
    <MarkdownFlowInput
      disabled={readonly}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onSend={onSend}
      title={placeholder}
    />
  );
};

// Define custom variable component
const CustomButtonInputVariable = ({
  node,
  readonly,
  defaultButtonText,
  defaultInputText,
  defaultSelectedValues,
  onSend,
  confirmButtonText = "Submit", // Default to English, can be overridden
  beforeSend = () => true,
}: CustomVariableProps) => {
  const [inputValue, setInputValue] = React.useState(defaultInputText || "");
  const [selectedValues, setSelectedValues] = React.useState<string[]>(
    defaultSelectedValues || []
  );
  const isMultiSelect = node.properties?.isMultiSelect ?? false;
  const baseButtonTexts = node.properties?.buttonTexts || [];
  const shouldUseFallbackButton =
    !isMultiSelect &&
    baseButtonTexts.length === 0 &&
    !node.properties?.placeholder;
  const fallbackButtonLabel =
    node.properties?.variableName?.trim() || defaultButtonText || "Submit";

  const singleSelectNode = React.useMemo<CustomVariableNode>(() => {
    if (!shouldUseFallbackButton) {
      return node;
    }
    return {
      ...node,
      properties: {
        ...(node.properties || {}),
        buttonTexts: [fallbackButtonLabel],
        buttonValues: [fallbackButtonLabel],
      },
    };
  }, [fallbackButtonLabel, node, shouldUseFallbackButton]);

  const singleSelectButtonTexts =
    singleSelectNode.properties?.buttonTexts || [];
  const singleSelectButtonValues =
    singleSelectNode.properties?.buttonValues || [];
  const isSingleSelect = !isMultiSelect && singleSelectButtonTexts.length > 0;

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
    if (e.nativeEvent.isComposing || e.keyCode === 229) {
      return;
    }
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
    const valueIndex = singleSelectButtonValues.indexOf(defaultButtonText);
    if (valueIndex > -1) {
      return singleSelectButtonTexts[valueIndex] ?? defaultButtonText;
    }
    const textIndex = singleSelectButtonTexts.indexOf(defaultButtonText);
    if (textIndex > -1) {
      return singleSelectButtonTexts[textIndex];
    }
    return undefined;
  }, [defaultButtonText, singleSelectButtonTexts, singleSelectButtonValues]);

  return (
    <span className="custom-variable-container inline-flex items-center flex-wrap">
      {isMultiSelect && (
        <MultiSelectSection
          node={node}
          readonly={readonly}
          selectedValues={selectedValues}
          inputValue={inputValue}
          confirmButtonText={confirmButtonText}
          handleCheckboxChange={handleCheckboxChange}
          handleInputChange={handleInputChange}
          handleKeyDown={handleKeyDown}
          handleConfirmClick={handleConfirmClick}
        />
      )}

      {!isMultiSelect && isSingleSelect && (
        <SingleSelectSection
          node={singleSelectNode}
          readonly={readonly}
          resolvedDefaultButtonText={resolvedDefaultButtonText}
          handleButtonClick={handleButtonClick}
          inputValue={inputValue}
          handleInputChange={handleInputChange}
          handleSendClick={handleSendClick}
        />
      )}

      {!isMultiSelect && !isSingleSelect && node.properties?.placeholder && (
        <InputSection
          readonly={readonly}
          placeholder={node.properties.placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onSend={handleSendClick}
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
