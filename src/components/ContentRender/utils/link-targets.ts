const ANCHOR_WITH_HREF_PATTERN =
  /<a\b([^>]*\bhref\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)[^>]*)>/gi;

const readAttributeValue = (attributes: string, attributeName: string) => {
  const pattern = new RegExp(
    `\\b${attributeName}\\s*=\\s*(\"([^\"]*)\"|'([^']*)'|([^\\s>]+))`,
    "i"
  );
  const match = attributes.match(pattern);

  if (!match) {
    return null;
  }

  return match[2] ?? match[3] ?? match[4] ?? "";
};

const writeAttributeValue = (
  attributes: string,
  attributeName: string,
  attributeValue: string
) => {
  const pattern = new RegExp(
    `(\\b${attributeName}\\s*=\\s*)(\"[^\"]*\"|'[^']*'|[^\\s>]+)`,
    "i"
  );

  if (pattern.test(attributes)) {
    return attributes.replace(
      pattern,
      `$1"${attributeValue.replace(/"/g, "&quot;")}"`
    );
  }

  return `${attributes} ${attributeName}="${attributeValue.replace(/"/g, "&quot;")}"`;
};

export const shouldForceAnchorHrefToNewTab = (href: string | null) => {
  const normalizedHref = href?.trim().toLowerCase() ?? "";

  if (!normalizedHref) {
    return false;
  }

  if (
    normalizedHref.startsWith("#") ||
    normalizedHref.startsWith("javascript:")
  ) {
    return false;
  }

  return true;
};

export const mergeAnchorRelValue = (rel: string | null) => {
  const tokens = new Set(
    (rel ?? "")
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean)
  );

  tokens.add("noopener");
  tokens.add("noreferrer");

  return Array.from(tokens).join(" ");
};

const patchAnchorTagAttributes = (attributes: string) => {
  const href = readAttributeValue(attributes, "href");
  if (!shouldForceAnchorHrefToNewTab(href)) {
    return attributes;
  }

  const nextRel = mergeAnchorRelValue(readAttributeValue(attributes, "rel"));
  const withTarget = writeAttributeValue(attributes, "target", "_blank");

  return writeAttributeValue(withTarget, "rel", nextRel);
};

export const forceSandboxLinksToOpenInNewTab = (html: string) =>
  html.replace(ANCHOR_WITH_HREF_PATTERN, (fullMatch, attributes: string) => {
    const nextAttributes = patchAnchorTagAttributes(attributes);
    return `<a${nextAttributes}>`;
  });
