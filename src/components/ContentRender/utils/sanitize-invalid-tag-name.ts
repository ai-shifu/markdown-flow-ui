import type { Root } from "hast";
import { visit } from "unist-util-visit";

const VALID_TAG_NAME = /^[A-Za-z][A-Za-z0-9._:-]*$/;
const INVALID_TAG_NAME_CHARS = /[^A-Za-z0-9._:-]/g;

const normalizeTagName = (tagName: string) => {
  if (VALID_TAG_NAME.test(tagName)) {
    return tagName;
  }

  const normalized = tagName.replace(INVALID_TAG_NAME_CHARS, "");
  if (!normalized || !VALID_TAG_NAME.test(normalized)) {
    return "span";
  }

  return normalized;
};

export const sanitizeInvalidTagName = () => (tree: Root) => {
  visit(tree, "element", (node) => {
    if (!node.tagName) return;
    const safeTagName = normalizeTagName(node.tagName);
    if (safeTagName !== node.tagName) {
      node.tagName = safeTagName;
    }
  });
};
