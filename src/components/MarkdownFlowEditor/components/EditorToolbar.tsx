import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Braces, Image, SquarePlay, ChevronDown } from "lucide-react";
import { SelectedOption } from "../types";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";

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
const EditorToolbar: React.FC<EditorToolbarProps> = ({
  disabled = false,
  labels,
  onSelect,
  onInsertVariablePlaceholder,
  onVariableSearchToggle,
  onVariableSearchClose,
  variableSearchActive = false,
}) => {
  const [variableMenuOpen, setVariableMenuOpen] = useState(false);
  const variableButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (disabled) {
      setVariableMenuOpen(false);
    }
  }, [disabled]);

  const handleVariableMenu = useCallback(
    (open: boolean) => {
      if (disabled) {
        return;
      }
      setVariableMenuOpen(open);
    },
    [disabled]
  );

  const handleVariableAction = useCallback(
    (action: "insert" | "search") => {
      if (action === "insert") {
        onInsertVariablePlaceholder?.();
      } else if (
        action === "search" &&
        variableButtonRef.current &&
        onVariableSearchToggle
      ) {
        onVariableSearchToggle(variableButtonRef.current);
      }
      setVariableMenuOpen(false);
    },
    [onInsertVariablePlaceholder, onVariableSearchToggle]
  );

  const triggerActive = useMemo(
    () => variableMenuOpen || variableSearchActive,
    [variableMenuOpen, variableSearchActive]
  );

  return (
    <div className="markdown-flow-editor-toolbar" aria-disabled={disabled}>
      <Popover
        open={variableMenuOpen}
        onOpenChange={(next) => {
          if (next) {
            onVariableSearchClose?.();
          }
          handleVariableMenu(next);
        }}
      >
        <PopoverTrigger asChild>
          <button
            ref={variableButtonRef}
            type="button"
            disabled={disabled}
            aria-expanded={variableMenuOpen}
            aria-haspopup="menu"
            aria-label={labels.variable}
            className="toolbar-variable-trigger"
            data-active={triggerActive ? "true" : undefined}
          >
            <Braces strokeWidth={1.75} size={18} />
            <ChevronDown size={14} strokeWidth={1.5} />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={8}
          className="toolbar-variable-popover"
        >
          <div className="toolbar-variable-menu" role="menu">
            <button
              type="button"
              onClick={() => handleVariableAction("insert")}
              className="toolbar-variable-menu-item"
            >
              {labels.addVariable}
            </button>
            <button
              type="button"
              onClick={() => handleVariableAction("search")}
              className="toolbar-variable-menu-item"
            >
              {labels.search}
            </button>
          </div>
        </PopoverContent>
      </Popover>
      {toolbarButtons.map(({ option, Icon, key }) => (
        <button
          key={option}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(option)}
          aria-label={labels[key]}
          title={labels[key]}
        >
          <Icon strokeWidth={1.75} size={18} />
        </button>
      ))}
    </div>
  );
};

export default memo(EditorToolbar);
