import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export interface MarkdownFlowEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  readOnly?: boolean;
  maxWidth?: string;
}

const MarkdownFlowEditor: React.FC<MarkdownFlowEditorProps> = ({
  value = "",
  onChange,
  className = "",
  readOnly = false,
  maxWidth = "100%", // Default max width is 100%
}) => {
  const [markdownContent, setMarkdownContent] = useState(value);

  const handleChange = (value: string) => {
    setMarkdownContent(value);
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <Card
      className={`w-full h-full flex flex-col ${className}`}
      style={{ maxWidth }}
    >
      <CardHeader className="flex-shrink-0">
        <CardTitle>Markdown Flow Editor</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 px-6">
        <CodeMirror
          value={markdownContent}
          height="100%"
          extensions={[markdown()]}
          onChange={handleChange}
          editable={!readOnly}
          basicSetup={{
            lineNumbers: false,
            highlightActiveLine: false,
            highlightSelectionMatches: true,
            foldGutter: false,
          }}
          style={{
            height: "100%",
            width: "100%",
            overflowWrap: "break-word", // Auto line wrapping
          }}
        />
      </CardContent>
    </Card>
  );
};

export default MarkdownFlowEditor;
