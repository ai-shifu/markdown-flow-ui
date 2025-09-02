import { visit } from "unist-util-visit";
import type { Node, Parent, Literal } from "unist";

interface CustomVariableNode extends Node {
  data: {
    hName: string;
    hProperties: {
      variableName?: string;
      buttonTexts?: string[];
      placeholder?: string;
    };
  };
}

// Define format type enum
enum FormatType {
  BUTTONS_WITH_PLACEHOLDER = 0, // Buttons with placeholder
  BUTTONS_ONLY = 1, // Only buttons
  SINGLE_BUTTON = 2, // Single button
  PLACEHOLDER_ONLY = 3, // Only placeholder
}

// Define matching rule interface
interface MatchRule {
  regex: RegExp;
  type: FormatType;
}

// Define separator (supports English | and Chinese ｜)
const SEPARATOR = "[|｜]"; // Match English | or Chinese ｜
const SEPARATOR_GLOBAL = new RegExp(SEPARATOR, "g");

// Configurable matching rules (adjust order and logic, use a unified separator)
const MATCH_RULES: MatchRule[] = [
  {
    // Format 1: ?[%{{variable}} button1 | button2 | ... placeholder] (buttons with placeholder, highest priority)
    regex: new RegExp(
      `\\?\\[\\%\\{\\{\\s*(\\w+)\\s*\\}\\}\\s*([^\\]\\|｜]+(?:\\s*${SEPARATOR}\\s*[^\\]\\|｜]+)*)\\s*${SEPARATOR}\\s*\\.\\.\\.\\s*([^\\]]+)\\]`,
    ),
    type: FormatType.BUTTONS_WITH_PLACEHOLDER,
  },
  {
    // Format 4: ?[%{{variable}} ... placeholder] (only placeholder, higher priority)
    regex: /\?\[\%\{\{\s*(\w+)\s*\}\}\s*\.\.\.\s*([^\]]+)\]/,
    type: FormatType.PLACEHOLDER_ONLY,
  },
  {
    // Format 2: ?[%{{variable}} button1 | button2]
    regex: new RegExp(
      `\\?\\[\\%\\{\\{\\s*(\\w+)\\s*\\}\\}\\s*([^\\]\\|｜]+(?:\\s*${SEPARATOR}\\s*[^\\]\\|｜]+)+)\\s*\\]`,
    ),
    type: FormatType.BUTTONS_ONLY,
  },
  {
    // Format 3: ?[%{{variable}} button]
    regex: /\?\[\%\{\{\s*(\w+)\s*\}\}\s*([^\|\]｜]+)\s*\]/,
    type: FormatType.SINGLE_BUTTON,
  },
];

// Parsed result interface
interface ParsedResult {
  variableName: string;
  buttonTexts: string[];
  placeholder?: string;
}

/**
 * Parse different formats of content
 */
function parseContentByType(
  match: RegExpExecArray,
  formatType: FormatType,
): ParsedResult {
  const variableName = match[1].trim();

  switch (formatType) {
    case FormatType.BUTTONS_WITH_PLACEHOLDER:
      // ?[%{{variable}} button1 | button2 | ... placeholder]
      return {
        variableName,
        buttonTexts: match[2]
          .split(SEPARATOR_GLOBAL)
          .map((text) => text.trim())
          .filter((text) => text.length > 0),
        placeholder: match[3].trim(),
      };

    case FormatType.BUTTONS_ONLY:
      // ?[%{{variable}} button1 | button2]
      return {
        variableName,
        buttonTexts: match[2]
          .split(SEPARATOR_GLOBAL)
          .map((text) => text.trim())
          .filter((text) => text.length > 0),
        placeholder: undefined,
      };

    case FormatType.SINGLE_BUTTON:
      // ?[%{{variable}} button]
      const buttonText = match[2].trim();
      return {
        variableName,
        buttonTexts: buttonText ? [buttonText] : [],
        placeholder: undefined,
      };

    case FormatType.PLACEHOLDER_ONLY:
      // ?[%{{variable}} ... placeholder]
      return {
        variableName,
        buttonTexts: [],
        placeholder: match[2].trim(),
      };

    default:
      throw new Error(`Unsupported format type: ${formatType}`);
  }
}

/**
 * Find the first matching rule
 */
function findFirstMatch(
  value: string,
): { match: RegExpExecArray; rule: MatchRule } | null {
  for (const rule of MATCH_RULES) {
    rule.regex.lastIndex = 0;
    const match = rule.regex.exec(value);
    if (match) {
      return { match, rule };
    }
  }
  return null;
}

/**
 * Create AST node fragment
 */
function createSegments(
  value: string,
  startIndex: number,
  endIndex: number,
  parsedResult: ParsedResult,
): Array<Literal | CustomVariableNode> {
  return [
    {
      type: "text",
      value: value.substring(0, startIndex),
    } as Literal,
    {
      type: "element",
      data: {
        hName: "custom-variable",
        hProperties: parsedResult,
      },
    } as CustomVariableNode,
    {
      type: "text",
      value: value.substring(endIndex),
    } as Literal,
  ];
}

export default function remarkCustomButtonInputVariable() {
  return (tree: Node) => {
    visit(
      tree,
      "text",
      (node: Literal, index: number | null, parent: Parent | null) => {
        // Input validation
        if (index === null || parent === null) return;

        const value = node.value as string;
        const matchResult = findFirstMatch(value);

        if (!matchResult) return;

        const { match, rule } = matchResult;
        const startIndex = match.index;
        const endIndex = startIndex + match[0].length;

        try {
          // Parse matching result
          const parsedResult = parseContentByType(match, rule.type);

          // Create new node fragment
          const segments = createSegments(
            value,
            startIndex,
            endIndex,
            parsedResult,
          );

          // Replace the original node
          parent.children.splice(index, 1, ...segments);
        } catch (error) {
          console.warn("Failed to parse custom variable syntax:", error);
          // If parsing fails, keep the original content
          return;
        }
      },
    );
  };
}
