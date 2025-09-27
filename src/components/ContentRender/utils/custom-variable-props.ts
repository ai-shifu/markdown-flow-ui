import type { Root } from "hast";
import { visit } from "unist-util-visit";

const DATA_BUTTON_TEXTS = "data-button-texts";
const DATA_BUTTON_VALUES = "data-button-values";

const preserveArrayProperty = (
  properties: Record<string, unknown>,
  sourceKey: string,
  targetKey: string
) => {
  const value = properties[sourceKey];
  if (Array.isArray(value)) {
    properties[targetKey] = JSON.stringify(value);
  }
};

const readJsonArray = (value: unknown): string[] | null => {
  if (typeof value !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map((item) => String(item)) : null;
  } catch (error) {
    console.error("[markdown-flow-ui] Error parsing JSON array:", error);
    return null;
  }
};

const removeDataProperty = (
  properties: Record<string, unknown>,
  key: string,
  altKey: string
) => {
  if (key in properties) {
    delete properties[key];
  }

  if (altKey in properties) {
    delete properties[altKey];
  }
};

export const preserveCustomVariableProperties = () => (tree: Root) => {
  visit(tree, "element", (node) => {
    if (node.tagName !== "custom-variable" || !node.properties) {
      return;
    }

    const properties = node.properties as Record<string, unknown>;
    preserveArrayProperty(properties, "buttonTexts", DATA_BUTTON_TEXTS);
    preserveArrayProperty(properties, "buttonValues", DATA_BUTTON_VALUES);
  });
};

export const restoreCustomVariableProperties = () => (tree: Root) => {
  visit(tree, "element", (node) => {
    if (node.tagName !== "custom-variable" || !node.properties) {
      return;
    }

    const properties = node.properties as Record<string, unknown>;

    const buttonTexts =
      readJsonArray(properties[DATA_BUTTON_TEXTS]) ??
      readJsonArray(properties.dataButtonTexts);
    if (buttonTexts) {
      properties.buttonTexts = buttonTexts;
    }

    const buttonValues =
      readJsonArray(properties[DATA_BUTTON_VALUES]) ??
      readJsonArray(properties.dataButtonValues);
    if (buttonValues) {
      properties.buttonValues = buttonValues;
    }

    removeDataProperty(properties, DATA_BUTTON_TEXTS, "dataButtonTexts");
    removeDataProperty(properties, DATA_BUTTON_VALUES, "dataButtonValues");
  });
};
