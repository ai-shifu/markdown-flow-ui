import React from "react";
import { Button } from "../../ui/button";
import type { Components } from "react-markdown";
import { OnSendContentParams } from "../../types";

// 定义自定义按钮节点的类型
interface CustomButtonNode {
  type: "element";
  tagName: "custom-button";
  properties?: {
    buttonText?: string;
  };
}

type CustomButtonProps = {
  node: CustomButtonNode;
  readonly?: boolean;
  defaultButtonText?: string;
  onSend?: (content: OnSendContentParams) => void;
};

interface ComponentsWithCustomButton extends Components {
  "custom-button"?: React.ComponentType<CustomButtonProps>;
}

// 定义自定义按钮组件
const CustomButton = ({
  node,
  readonly,
  defaultButtonText,
  onSend,
}: CustomButtonProps) => {
  const { buttonText, ...restProps } = node.properties || {};

  const handleButtonClick = () => {
    onSend?.({ buttonText: buttonText || "" });
  };

  return (
    <Button
      variant="outline"
      disabled={readonly}
      size="sm"
      onClick={handleButtonClick}
      className={`cursor-pointer h-6 text-sm hover:bg-gray-200`}
      style={{
        backgroundColor:
          defaultButtonText === buttonText
            ? "var(--primary, #2563eb)"
            : undefined,
        color:
          defaultButtonText === buttonText
            ? "var(--primary-foreground, white)"
            : undefined,
      }}
      {...restProps}
    >
      {buttonText}
    </Button>
  );
};

export default CustomButton;
export type { CustomButtonProps, CustomButtonNode, ComponentsWithCustomButton };
