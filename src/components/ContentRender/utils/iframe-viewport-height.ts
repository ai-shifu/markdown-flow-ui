export interface ViewportHeightInspectionNode {
  heightAttrValue?: string | null;
  styleAttrValue?: string | null;
  classAttrValue?: string | null;
}

export interface RootHeightMeta {
  viewportHeightCss: string | null;
  hasFullViewportHeight: boolean;
}

export interface ViewportHeightTraversalOptions<T> {
  getNode: (node: T) => ViewportHeightInspectionNode;
  getSingleChild: (node: T) => T | null;
}

export const EMPTY_ROOT_HEIGHT_META: RootHeightMeta = {
  viewportHeightCss: null,
  hasFullViewportHeight: false,
};

const INLINE_HEIGHT_PROPERTY_PATTERN =
  /\b(?:min-height|height)\s*:\s*([^;]+)/gi;

export const normalizeTailwindHeightTokens = (className: string) =>
  className
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => token.split(":").pop() || token);

export const parseViewportHeightCss = (value: string) => {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  const matched = normalized.match(/^([0-9.]+)(vh|dvh|svh|lvh)$/i);

  if (!matched) {
    return null;
  }

  return `${matched[1]}${matched[2].toLowerCase()}`;
};

export const parseExplicitHeight = (
  value: string,
  parentViewportHeight: number
) => {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  const numeric = Number.parseFloat(normalized);

  if (Number.isNaN(numeric)) {
    return null;
  }

  if (/(dvh|svh|lvh|vh)$/i.test(normalized)) {
    return (numeric / 100) * parentViewportHeight;
  }

  if (normalized.endsWith("px") || /^[0-9.]+$/.test(normalized)) {
    return numeric;
  }

  return null;
};

const extractHeightValueFromInlineStyle = (
  styleAttrValue: string,
  parser: (value: string) => string | null
) => {
  const matches = styleAttrValue.matchAll(INLINE_HEIGHT_PROPERTY_PATTERN);

  for (const match of matches) {
    const parsedValue = parser(match[1] || "");

    if (parsedValue) {
      return parsedValue;
    }
  }

  return null;
};

export const extractViewportHeightFromTailwindClass = (className: string) => {
  if (!className.trim()) {
    return null;
  }

  const normalizedTokens = normalizeTailwindHeightTokens(className);

  if (
    normalizedTokens.includes("h-screen") ||
    normalizedTokens.includes("h-dvh") ||
    normalizedTokens.includes("min-h-screen") ||
    normalizedTokens.includes("min-h-dvh")
  ) {
    return "100dvh";
  }

  if (
    normalizedTokens.includes("h-svh") ||
    normalizedTokens.includes("min-h-svh")
  ) {
    return "100svh";
  }

  if (
    normalizedTokens.includes("h-lvh") ||
    normalizedTokens.includes("min-h-lvh")
  ) {
    return "100lvh";
  }

  const arbitraryToken = normalizedTokens.find((token) =>
    /^(h|min-h)-\[[0-9.]+(vh|dvh|svh|lvh)\]$/i.test(token)
  );

  if (!arbitraryToken) {
    return null;
  }

  const matched = arbitraryToken.match(
    /^(h|min-h)-\[([0-9.]+)(vh|dvh|svh|lvh)\]$/i
  );

  if (!matched) {
    return null;
  }

  return `${matched[2]}${matched[3].toLowerCase()}`;
};

const extractPixelHeightFromTailwindClass = (className: string) => {
  if (!className.trim()) {
    return null;
  }

  const normalizedTokens = normalizeTailwindHeightTokens(className);
  const arbitraryToken = normalizedTokens.find((token) =>
    /^(h|min-h)-\[[0-9.]+px\]$/i.test(token)
  );

  if (!arbitraryToken) {
    return null;
  }

  const matched = arbitraryToken.match(/^(h|min-h)-\[([0-9.]+)px\]$/i);

  if (!matched) {
    return null;
  }

  return `${matched[2]}px`;
};

const getViewportHeightCssFromNode = ({
  heightAttrValue,
  styleAttrValue,
  classAttrValue,
}: ViewportHeightInspectionNode) =>
  (heightAttrValue ? parseViewportHeightCss(heightAttrValue) : null) ||
  (styleAttrValue
    ? extractHeightValueFromInlineStyle(styleAttrValue, parseViewportHeightCss)
    : null) ||
  (classAttrValue
    ? extractViewportHeightFromTailwindClass(classAttrValue)
    : null);

export const isFullViewportHeightCss = (value: string | null) =>
  value === "100vh" ||
  value === "100dvh" ||
  value === "100svh" ||
  value === "100lvh";

export const inspectViewportHeightFromNode = (
  node: ViewportHeightInspectionNode | null
): RootHeightMeta => {
  if (!node) {
    return EMPTY_ROOT_HEIGHT_META;
  }

  const viewportHeightCss = getViewportHeightCssFromNode(node);

  return {
    viewportHeightCss,
    hasFullViewportHeight: isFullViewportHeightCss(viewportHeightCss),
  };
};

export const inspectViewportHeightFromHtmlRootString = (
  html: string
): RootHeightMeta => {
  const normalized = html.trim();

  if (!normalized) {
    return EMPTY_ROOT_HEIGHT_META;
  }

  const rootMatch = normalized.match(/^<([a-zA-Z][\w:-]*)(\s[^>]*?)?>/);
  const attrs = rootMatch?.[2] || "";

  return inspectViewportHeightFromNode({
    heightAttrValue:
      attrs.match(/\bheight\s*=\s*["']([^"']+)["']/i)?.[1] ?? null,
    styleAttrValue: attrs.match(/\bstyle\s*=\s*["']([^"']+)["']/i)?.[1] ?? null,
    classAttrValue: attrs.match(/\bclass\s*=\s*["']([^"']+)["']/i)?.[1] ?? null,
  });
};

export const inspectViewportHeightFromNodeChain = <T>(
  root: T | null,
  { getNode, getSingleChild }: ViewportHeightTraversalOptions<T>
): RootHeightMeta => {
  let currentNode = root;

  while (currentNode) {
    const heightMeta = inspectViewportHeightFromNode(getNode(currentNode));

    if (heightMeta.viewportHeightCss) {
      return heightMeta;
    }

    currentNode = getSingleChild(currentNode);
  }

  return EMPTY_ROOT_HEIGHT_META;
};

export const resolveExplicitHeightFromNode = (
  node: ViewportHeightInspectionNode | null,
  parentViewportHeight: number
) => {
  if (!node) {
    return null;
  }

  const viewportHeightCss = getViewportHeightCssFromNode(node);

  if (viewportHeightCss) {
    return parseExplicitHeight(viewportHeightCss, parentViewportHeight);
  }

  const styleExplicitHeight = node.styleAttrValue
    ? extractHeightValueFromInlineStyle(node.styleAttrValue, (value) => {
        const parsedHeight = parseExplicitHeight(value, parentViewportHeight);

        return parsedHeight === null ? null : String(parsedHeight);
      })
    : null;

  if (styleExplicitHeight) {
    return Number.parseFloat(styleExplicitHeight);
  }

  const attrExplicitHeight = node.heightAttrValue
    ? parseExplicitHeight(node.heightAttrValue, parentViewportHeight)
    : null;

  if (attrExplicitHeight !== null) {
    return attrExplicitHeight;
  }

  const classExplicitHeight = node.classAttrValue
    ? extractPixelHeightFromTailwindClass(node.classAttrValue)
    : null;

  return classExplicitHeight
    ? parseExplicitHeight(classExplicitHeight, parentViewportHeight)
    : null;
};

export const resolveExplicitHeightFromNodeChain = <T>(
  root: T | null,
  parentViewportHeight: number,
  { getNode, getSingleChild }: ViewportHeightTraversalOptions<T>
) => {
  let currentNode = root;

  while (currentNode) {
    const resolvedHeight = resolveExplicitHeightFromNode(
      getNode(currentNode),
      parentViewportHeight
    );

    if (resolvedHeight !== null) {
      return resolvedHeight;
    }

    currentNode = getSingleChild(currentNode);
  }

  return null;
};
