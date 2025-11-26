import * as React from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "../../lib/utils";

export interface CheckboxProps extends React.ComponentProps<"input"> {
  /** Whether the checkbox is checked */
  checked?: boolean;
  /** Default checked state */
  defaultChecked?: boolean;
  /** Called when the checked state changes */
  onCheckedChange?: (checked: boolean) => void;
  /** Checkbox label */
  label?: string;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked,
      defaultChecked,
      onCheckedChange,
      label,
      disabled = false,
      className,
      onChange,
      ...props
    },
    ref
  ) => {
    const [internalIsChecked, setInternalIsChecked] = React.useState(
      defaultChecked ?? false
    );

    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalIsChecked;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = event.target.checked;
      if (!isControlled) {
        setInternalIsChecked(newChecked);
      }
      onCheckedChange?.(newChecked);
      onChange?.(event);
    };

    return (
      <label
        className={cn(
          "inline-flex items-center cursor-pointer text-sm",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <span className="relative inline-flex items-center justify-center">
          <input
            ref={ref}
            type="checkbox"
            checked={isChecked}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only"
            {...props}
          />
          <span
            className={cn(
              "inline-flex items-center justify-center h-4 w-4 rounded border bg-background transition-colors relative",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              // 使用具体的颜色值而不是CSS变量，避免被全局样式覆盖
              isChecked
                ? "bg-blue-600 border-blue-600 text-white"
                : "border-gray-300 hover:border-blue-500",
              !disabled && !isChecked && "hover:border-blue-500"
            )}
            style={{
              // 确保边框和背景色不被全局样式覆盖
              borderColor: isChecked ? "#2563eb" : "#d1d5db",
              backgroundColor: isChecked ? "#2563eb" : "#ffffff",
            }}
          >
            {isChecked && (
              <CheckIcon className="h-3 w-3 text-white relative z-10" />
            )}
          </span>
        </span>
        {label && (
          <span
            className={cn(
              "ml-2 select-none",
              disabled && "text-muted-foreground"
            )}
          >
            {label}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
