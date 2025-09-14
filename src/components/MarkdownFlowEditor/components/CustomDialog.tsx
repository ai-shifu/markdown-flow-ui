import React, { useContext } from "react";
import { Dialog, DialogContent, DialogTitle } from "../../ui/dialog";
import EditorContext from "../editor-context";

type CustomDialogProps = {
  children?: React.ReactNode;
};

const CustomDialog: React.FC<CustomDialogProps> = ({ children }) => {
  const { dialogOpen, setDialogOpen } = useContext(EditorContext);
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal>
      <DialogContent
        className="min-w-[400px]"
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogTitle className="font-medium mb-4">Please set</DialogTitle>
        <div className="space-y-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomDialog;
