enum SelectedOption {
  Video = "video",
  Image = "Image",
  Variable = "variable",
  Empty = "",
}

interface SelectContentInfo {
  type: SelectedOption;
  value: {
    resourceTitle?: string;
    resourceUrl?: string;
    variableName?: string;
  };
  from: number;
  to: number;
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
export type { SelectContentInfo, IEditorContext, Variable };
