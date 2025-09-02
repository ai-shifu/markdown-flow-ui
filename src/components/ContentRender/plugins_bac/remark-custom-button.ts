import { visit } from "unist-util-visit";
import type { Node, Parent, Literal } from "unist";

// Define custom button node type
interface CustomButtonNode extends Node {
  type: "element";
  data?: {
    hName?: string;
    hProperties?: Record<string, any>;
    hChildren?: Array<{ type: string; value: string }>;
  };
}

// Regex matching ?[button text]
const BUTTON_REGEX = /\?\[([^\]]+)\]/;

export default function remarkCustomButton() {
  return (tree: Node) => {
    visit(
      tree,
      "text",
      (node: Literal, index: number | null, parent: Parent | null) => {
        const value = node.value as string;
        const match = BUTTON_REGEX.exec(value);

        // If there is no match or the parent node/index is missing, exit
        if (!match || index === null || parent === null) return;

        const startIndex = match.index;
        const endIndex = startIndex + match[0].length;

        // Explicitly define the union type of paragraphs
        type Segment = Literal | CustomButtonNode;

        // Build replacement segments (explicit type declaration)
        const segments: Segment[] = [
          {
            type: "text",
            value: value.substring(0, startIndex),
          } as Literal,
          {
            type: "element",
            data: {
              hName: "custom-button",
              hProperties: { buttonText: match[1] },
            },
          } as CustomButtonNode,
          {
            type: "text",
            value: value.substring(endIndex),
          } as Literal,
        ];

        // Replace the original node
        parent.children.splice(index, 1, ...segments);
      },
    );
  };
}
