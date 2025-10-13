enum SelectedOption {
  FixedText = "fixedText",
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
    scalePercent?: number;
    variableName?: string;
  };
  from: number;
  to: number;
}

interface PopoverPosition {
  x: number;
  y: number;
}

interface IEditorContext {
  selectedOption: SelectedOption;
  setSelectedOption: (selectedOption: SelectedOption) => void;
  dialogOpen: boolean;
  setDialogOpen: (dialogOpen: boolean) => void;
  popoverOpen: boolean;
  setPopoverOpen: (popoverOpen: boolean) => void;
  popoverPosition: PopoverPosition | null;
  setPopoverPosition: (position: PopoverPosition | null) => void;
}

interface Variable {
  name: string;
}

export { SelectedOption };
export type { SelectContentInfo, IEditorContext, Variable, PopoverPosition };
