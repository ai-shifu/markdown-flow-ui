import { SendIcon } from "lucide-react";
import React from "react";

import {
  InputGroup,
  InputGroupButton,
  InputGroupTextarea,
} from "../ui/inputGroup/input-group";

interface MarkdownFlowInputProps {
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  title?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend?: () => void;
  className?: string;
  textareaClassName?: string;
}

const MarkdownFlowInput: React.FC<MarkdownFlowInputProps> = ({
  disabled,
  placeholder,
  value,
  title,
  onChange,
  onKeyDown,
  onSend,
  className,
  textareaClassName,
}) => {
  const isSendDisabled = disabled || !value?.trim();

  return (
    <InputGroup
      data-disabled={disabled}
      className={`input-container h-auto items-end bg-white border-[#e5e5e5] shadow-[0_1px_2px_rgba(0,0,0,0.05)] ${className || ""}`}
    >
      <InputGroupTextarea
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className={`text-[16px] leading-5 font-normal text-[#0A0A0A] placeholder:text-[rgba(99,114,128,1)] bg-transparent border-0 shadow-none px-3 py-1.5 min-h-[32px] ${textareaClassName || ""}`}
        title={title}
      />
      <InputGroupButton
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onSend}
        disabled={isSendDisabled}
        aria-label="send"
        style={{
          margin: "0 10px 7px 7px",
          cursor: isSendDisabled ? "not-allowed" : "pointer",
        }}
        className="size-4 group self-end mb-[2px]"
      >
        <SendIcon
          size={16}
          className={`send-icon transition-colors ${
            isSendDisabled
              ? "text-[rgba(85,87,94,0.45)]"
              : "group-hover:text-[rgba(85,87,94,0.85)]"
          }`}
        />
      </InputGroupButton>
    </InputGroup>
  );
};

export type { MarkdownFlowInputProps };
export default MarkdownFlowInput;
