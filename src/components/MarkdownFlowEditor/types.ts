enum SelectedOption {
  Video = "video",
  Image = "Image",
  Empty = "",
}
interface IEditorContext {
  selectedOption: SelectedOption;
  setSelectedOption: (selectedOption: SelectedOption) => void;
  dialogOpen: boolean;
  setDialogOpen: (dialogOpen: boolean) => void;
}

export { SelectedOption };
export type { IEditorContext };
