import React, { useContext } from "react";
import { Popover, PopoverContent, PopoverAnchor } from "../../ui/popover";
import EditorContext from "../editor-context";
import type { MarkdownFlowDirection } from "../../../lib/locale";
import { cn } from "../../../lib/utils";

type CustomPopoverProps = {
  children?: React.ReactNode;
};

export interface CustomPopoverAllProps extends CustomPopoverProps {
  className?: string;
  dir?: MarkdownFlowDirection;
}

const CustomPopover: React.FC<CustomPopoverAllProps> = ({
  children,
  className,
  dir,
}) => {
  const { popoverOpen, setPopoverOpen, popoverPosition } =
    useContext(EditorContext);

  if (!popoverOpen || !popoverPosition) {
    return null;
  }

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverAnchor
        style={{
          position: "fixed",
          left: `${popoverPosition.x}px`,
          top: `${popoverPosition.y}px`,
          width: 0,
          height: 0,
        }}
      />
      <PopoverContent
        className={cn(
          "p-0 border-0 shadow-none bg-transparent w-auto",
          className
        )}
        align="start"
        dir={dir}
        sideOffset={5}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
};

CustomPopover.displayName = "CustomPopover";

export default CustomPopover;
