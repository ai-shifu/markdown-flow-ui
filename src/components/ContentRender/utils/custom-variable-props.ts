import type { Root } from "hast";
import { visit } from "unist-util-visit";

const DATA_BUTTON_TEXTS = "data-button-texts";
const DATA_BUTTON_VALUES = "data-button-values";
const DATA_IS_MULTI_SELECT = "data-is-multi-select";

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

const preserveBooleanProperty = (
  properties: Record<string, unknown>,
  sourceKey: string,
  targetKey: string
) => {
  const value = properties[sourceKey];
  if (typeof value === "boolean") {
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
    preserveBooleanProperty(properties, "isMultiSelect", DATA_IS_MULTI_SELECT);
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

    const isMultiSelectRaw =
      properties[DATA_IS_MULTI_SELECT] ?? properties.dataIsMultiSelect;
    if (typeof isMultiSelectRaw === "string") {
      try {
        const parsed = JSON.parse(isMultiSelectRaw);
        if (typeof parsed === "boolean") {
          properties.isMultiSelect = parsed;
        }
      } catch (error) {
        console.error(
          "[markdown-flow-ui] Error parsing boolean isMultiSelect:",
          error
        );
      }
    }

    removeDataProperty(properties, DATA_BUTTON_TEXTS, "dataButtonTexts");
    removeDataProperty(properties, DATA_BUTTON_VALUES, "dataButtonValues");
    removeDataProperty(properties, DATA_IS_MULTI_SELECT, "dataIsMultiSelect");
  });
};
