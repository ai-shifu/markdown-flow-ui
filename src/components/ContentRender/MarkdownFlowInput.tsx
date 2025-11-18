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
  sendButtonDisabled?: boolean;
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
  sendButtonDisabled,
}) => {
  const isSendDisabled = disabled || sendButtonDisabled;
  const groupClassName = className
    ? `text-sm input-container has-[textarea]:items-stretch ${className}`
    : "text-sm input-container has-[textarea]:items-stretch";

  return (
    <InputGroup data-disabled={disabled} className={groupClassName}>
      <InputGroupTextarea
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className={`text-sm${textareaClassName ? ` ${textareaClassName}` : ""}`}
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
        className="size-4 group"
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
