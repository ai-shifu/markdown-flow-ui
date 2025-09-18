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
    const [isChecked, setIsChecked] = React.useState(
      checked ?? defaultChecked ?? false
    );

    // Update internal state when checked prop changes
    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked);
      }
    }, [checked]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = event.target.checked;
      setIsChecked(newChecked);
      onCheckedChange?.(newChecked);
      onChange?.(event);
    };

    return (
      <label
        className={cn(
          "inline-flex items-center gap-2 cursor-pointer text-sm",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            checked={isChecked}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only"
            {...props}
          />
          <div
            className={cn(
              "h-4 w-4 rounded border border-input bg-background ring-offset-background transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              isChecked && "bg-primary border-primary text-primary-foreground",
              !disabled && "hover:border-primary/50"
            )}
          >
            {isChecked && (
              <CheckIcon className="h-3 w-3 text-primary-foreground absolute top-0.5 left-0.5" />
            )}
          </div>
        </div>
        {label && (
          <span
            className={cn("select-none", disabled && "text-muted-foreground")}
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
