import React from "react";

enum SelectedOption {
  FixedText = "fixedText",
  Divider = "divider",
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
  label?: string;
  isHidden?: boolean;
  isSystem?: boolean;
}

type EditorAction =
  | {
      key: string;
      label: string;
      icon?: React.ReactNode;
      disabled?: boolean;
      onClick?: (api: EditorApi) => void;
      tooltip?: string;
    }
  | {
      key: string;
      render: (api: EditorApi) => React.ReactNode;
      disabled?: boolean;
    };

interface EditorApi {
  insertTextAtCursor: (text: string) => void;
  replaceSelection: (text: string) => void;
  focus: () => void;
  getContent: () => string;
  setContent: (text: string) => void;
}

export { SelectedOption };
export type {
  SelectContentInfo,
  IEditorContext,
  Variable,
  PopoverPosition,
  EditorAction,
  EditorApi,
};
