import { memo, useCallback } from "react";
import { Braces, FileType, Image, SquarePlay } from "lucide-react";
import { SelectedOption } from "../types";
import SearchBracesIcon from "./icons/SearchBracesIcon";

type ToolbarLabels = {
  variable: string;
  image: string;
  video: string;
  addVariable: string;
  search: string;
};

interface EditorToolbarProps {
  disabled?: boolean;
  labels: ToolbarLabels;
  onSelect: (selectedOption: SelectedOption) => void;
  onInsertVariablePlaceholder?: () => void;
  onVariableSearchToggle?: (button: HTMLButtonElement) => void;
  onVariableSearchClose?: () => void;
  onInsertConfirmOutput?: () => void;
  variableSearchActive?: boolean;
}

const toolbarButtons: Array<{
  option: SelectedOption;
  Icon: typeof Braces;
  key: keyof ToolbarLabels;
}> = [
  { option: SelectedOption.Image, Icon: Image, key: "image" },
  { option: SelectedOption.Video, Icon: SquarePlay, key: "video" },
];

/**
 * EditorToolbar renders quick action buttons that mirror the slash commands.
 */
const ICON_SIZE = 18;

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  disabled = false,
  labels,
  onSelect,
  onInsertVariablePlaceholder,
  onVariableSearchToggle,
  onVariableSearchClose,
  onInsertConfirmOutput,
  variableSearchActive = false,
}) => {
  const handleAddVariable = useCallback(() => {
    if (disabled) {
      return;
    }
    onVariableSearchClose?.();
    onInsertVariablePlaceholder?.();
  }, [disabled, onInsertVariablePlaceholder, onVariableSearchClose]);

  const handleSearchToggle = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) {
        return;
      }
      onVariableSearchToggle?.(event.currentTarget);
    },
    [disabled, onVariableSearchToggle]
  );

  const handleConfirmOutput = useCallback(() => {
    if (disabled) {
      return;
    }
    onInsertConfirmOutput?.();
  }, [disabled, onInsertConfirmOutput]);

  return (
    <div className="markdown-flow-editor-toolbar" aria-disabled={disabled}>
      <button
        type="button"
        disabled={disabled}
        onClick={handleAddVariable}
        aria-label={labels.addVariable}
        title={labels.addVariable}
      >
        <Braces strokeWidth={1.75} size={ICON_SIZE} />
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={handleSearchToggle}
        data-active={!disabled && variableSearchActive ? "true" : undefined}
        aria-label={labels.search}
        title={labels.search}
      >
        <SearchBracesIcon strokeWidth={1.75} size={ICON_SIZE} />
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={handleConfirmOutput}
        aria-label={labels.confirmOutput}
        title={labels.confirmOutput}
      >
        <FileType strokeWidth={1.75} size={ICON_SIZE} />
      </button>
      {toolbarButtons.map(({ option, Icon, key }) => (
        <button
          key={option}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(option)}
          aria-label={labels[key]}
          title={labels[key]}
        >
          <Icon strokeWidth={1.75} size={ICON_SIZE} />
        </button>
      ))}
    </div>
  );
};

export default memo(EditorToolbar);
