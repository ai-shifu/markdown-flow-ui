import React from "react";

import sendIconDisable from "@/assets/icons/send_disable.svg";
import sendIconEnable from "@/assets/icons/send_enable.svg";

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
  autoFocus?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSend?: () => void;
  className?: string;
  textareaClassName?: string;
}

const resolveAssetSrc = (asset: string | { src: string }) =>
  typeof asset === "string" ? asset : asset.src;

const MarkdownFlowInput: React.FC<MarkdownFlowInputProps> = ({
  disabled,
  placeholder,
  value,
  title,
  autoFocus = true,
  onChange,
  onSend,
  className,
  textareaClassName,
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const shouldAutoFocus = autoFocus && !value?.trim();
  const isSendDisabled = disabled || !value?.trim();
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!onSend) {
      return;
    }
    if (e.nativeEvent.isComposing || e.keyCode === 229) {
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isSendDisabled) {
        onSend();
      }
    }
  };

  React.useEffect(() => {
    if (disabled || !shouldAutoFocus) {
      return;
    }
    textareaRef.current?.focus();
  }, [disabled, shouldAutoFocus]);

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
        onKeyDown={handleKeyDown}
        autoFocus={shouldAutoFocus}
        ref={textareaRef}
        className={`text-[16px] leading-5 font-normal text-[#0A0A0A] placeholder:text-[rgba(99,114,128,1)] bg-transparent border-0 shadow-none pl-3 pr-0 py-1.5 min-h-[32px] ${textareaClassName || ""}`}
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
          margin: "0px 7px 4px 7px",
          cursor: isSendDisabled ? "not-allowed" : "pointer",
        }}
        className="size-6 group self-end mb-[2px]"
      >
        <img
          src={resolveAssetSrc(
            isSendDisabled ? sendIconDisable : sendIconEnable
          )}
          alt="send"
          className="size-6"
        />
      </InputGroupButton>
    </InputGroup>
  );
};

export type { MarkdownFlowInputProps };
export default MarkdownFlowInput;
