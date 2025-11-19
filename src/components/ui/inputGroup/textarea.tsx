import * as React from "react";

import RcTextArea, { TextAreaProps as RcTextAreaProps } from "rc-textarea";

import { cn } from "../../../lib/utils";

type TextareaProps = RcTextAreaProps;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoSize = { minRows: 1 }, style, ...props }, ref) => {
    return (
      <RcTextArea
        ref={ref}
        autoSize={autoSize}
        className={cn(
          "border-input placeholder:text-muted-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 w-full rounded-md border bg-transparent pl-3 py-1.5 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50",
          "resize-none",
          className
        )}
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          ...style,
        }}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
