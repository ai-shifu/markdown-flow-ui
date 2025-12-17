import { memo } from "react";
import { Braces, Image, SquarePlay } from "lucide-react";
import { SelectedOption } from "../types";

type ToolbarLabels = {
  variable: string;
  image: string;
  video: string;
};

interface EditorToolbarProps {
  disabled?: boolean;
  labels: ToolbarLabels;
  onSelect: (selectedOption: SelectedOption) => void;
}

const toolbarButtons: Array<{
  option: SelectedOption;
  Icon: typeof Braces;
  key: keyof ToolbarLabels;
}> = [
  { option: SelectedOption.Variable, Icon: Braces, key: "variable" },
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
}) => {
  return (
    <div className="markdown-flow-editor-toolbar" aria-disabled={disabled}>
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
