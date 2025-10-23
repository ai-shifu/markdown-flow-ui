import { createContext } from "react";
import { IEditorContext, SelectedOption } from "./types";

const EditorContext = createContext<IEditorContext>({
  selectedOption: SelectedOption.Empty,
  setSelectedOption: () => {},
  dialogOpen: false,
  setDialogOpen: () => {},
  popoverOpen: false,
  setPopoverOpen: () => {},
  popoverPosition: null,
  setPopoverPosition: () => {},
});
export default EditorContext;
