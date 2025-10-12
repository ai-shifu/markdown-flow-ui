enum SelectedOption {
  Video = "video",
  Image = "Image",
  Variable = "variable",
  Empty = "",
}
interface IEditorContext {
  selectedOption: SelectedOption;
  setSelectedOption: (selectedOption: SelectedOption) => void;
  dialogOpen: boolean;
  setDialogOpen: (dialogOpen: boolean) => void;
}

interface Variable {
  name: string;
}

export { SelectedOption };
export type { IEditorContext, Variable };
