import React, { useContext, forwardRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "../../ui/dialog";
import EditorContext from "../editor-context";
import type { MarkdownFlowDirection } from "../../../lib/locale";
import { cn } from "../../../lib/utils";

type CustomDialogProps = {
  children?: React.ReactNode;
};

export interface CustomDialogLabels {
  title?: string;
}
export interface CustomDialogAllProps extends CustomDialogProps {
  className?: string;
  /**
   * Sets "ltr" or "rtl" on the dialog content, including its reading and layout direction.
   * When omitted, the content inherits direction from its portal container, not the trigger.
   */
  dir?: MarkdownFlowDirection;
  labels?: CustomDialogLabels;
}

const CustomDialog = forwardRef<HTMLDivElement, CustomDialogAllProps>(
  ({ children, className, dir, labels }, ref) => {
    const { dialogOpen, setDialogOpen } = useContext(EditorContext);
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal>
        <DialogContent
          ref={ref}
          className={cn("min-w-[300px]", className)}
          dir={dir}
          onPointerDownOutside={(e) => {
            e.preventDefault();
          }}
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogTitle className="font-medium mb-4">
            {labels?.title ?? "Settings"}
          </DialogTitle>
          <div>{children}</div>
        </DialogContent>
      </Dialog>
    );
  }
);

CustomDialog.displayName = "CustomDialog";

export default CustomDialog;
