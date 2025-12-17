import { memo, useCallback } from "react";
import {
  Braces,
  FileType,
  Image,
  TextCursorInput,
  Link,
  SquareCheck,
  SquarePlay,
  CircleCheck,
} from "lucide-react";
import { SelectedOption } from "../types";
import SearchBracesIcon from "./icons/SearchBracesIcon";
import ButtonIcon from "./icons/ButtonIcon";

type ToolbarLabels = {
  confirmOutput: string | undefined;
  insertLink: string | undefined;
  insertButton: string | undefined;
  insertSingleChoice: string | undefined;
  insertMultiChoice: string | undefined;
  insertInput: string | undefined;
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
  onInsertLink?: () => void;
  onInsertButton?: () => void;
  onInsertSingleChoice?: () => void;
  onInsertMultiChoice?: () => void;
  onInsertInputField?: () => void;
  variableSearchActive?: boolean;
}

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
  onInsertLink,
  onInsertButton,
  onInsertSingleChoice,
  onInsertMultiChoice,
  onInsertInputField,
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

  const handleInsertLink = useCallback(() => {
    if (disabled) {
      return;
    }
    onInsertLink?.();
  }, [disabled, onInsertLink]);

  const handleInsertButton = useCallback(() => {
    if (disabled) {
      return;
    }
    onInsertButton?.();
  }, [disabled, onInsertButton]);

  const handleInsertSingleChoice = useCallback(() => {
    if (disabled) {
      return;
    }
    onInsertSingleChoice?.();
  }, [disabled, onInsertSingleChoice]);

  const handleInsertMultiChoice = useCallback(() => {
    if (disabled) {
      return;
    }
    onInsertMultiChoice?.();
  }, [disabled, onInsertMultiChoice]);

  const handleInsertInputField = useCallback(() => {
    if (disabled) {
      return;
    }
    onInsertInputField?.();
  }, [disabled, onInsertInputField]);

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
      <button
        type="button"
        disabled={disabled}
        onClick={handleInsertButton}
        aria-label={labels.insertButton}
        title={labels.insertButton}
      >
        <ButtonIcon strokeWidth={1.75} size={ICON_SIZE} />
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={handleInsertSingleChoice}
        aria-label={labels.insertSingleChoice}
        title={labels.insertSingleChoice}
      >
        <CircleCheck strokeWidth={1.75} size={ICON_SIZE} />
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={handleInsertMultiChoice}
        aria-label={labels.insertMultiChoice}
        title={labels.insertMultiChoice}
      >
        <SquareCheck strokeWidth={1.75} size={ICON_SIZE} />
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={handleInsertInputField}
        aria-label={labels.insertInput}
        title={labels.insertInput}
      >
        <TextCursorInput strokeWidth={1.75} size={ICON_SIZE} />
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect(SelectedOption.Image)}
        aria-label={labels.image}
        title={labels.image}
      >
        <Image strokeWidth={1.75} size={ICON_SIZE} />
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect(SelectedOption.Video)}
        aria-label={labels.video}
        title={labels.video}
      >
        <SquarePlay strokeWidth={1.75} size={ICON_SIZE} />
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={handleInsertLink}
        aria-label={labels.insertLink}
        title={labels.insertLink}
      >
        <Link strokeWidth={1.75} size={ICON_SIZE} />
      </button>
    </div>
  );
};

export default memo(EditorToolbar);
