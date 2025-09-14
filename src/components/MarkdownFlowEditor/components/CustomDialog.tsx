import React, { useContext, forwardRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "../../ui/dialog";
import EditorContext from "../editor-context";
import { cn } from "../../../lib/utils";

type CustomDialogProps = {
  children?: React.ReactNode;
};

export interface CustomDialogLabels {
  title?: string;
}
export interface CustomDialogAllProps extends CustomDialogProps {
  className?: string;
  labels?: CustomDialogLabels;
}

const CustomDialog = forwardRef<HTMLDivElement, CustomDialogAllProps>(
  ({ children, className, labels }, ref) => {
    const { dialogOpen, setDialogOpen } = useContext(EditorContext);
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal>
        <DialogContent
          ref={ref}
          className={cn("min-w-[400px]", className)}
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
          <div className="space-y-4">{children}</div>
        </DialogContent>
      </Dialog>
    );
  }
);

CustomDialog.displayName = "CustomDialog";

export default CustomDialog;
