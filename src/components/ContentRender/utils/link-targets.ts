export const shouldForceAnchorHrefToNewTab = (href: string | null) => {
  const normalizedHref = href?.trim().toLowerCase() ?? "";

  if (!normalizedHref) {
    return false;
  }

  if (
    normalizedHref.startsWith("#") ||
    normalizedHref.startsWith("javascript:") ||
    normalizedHref.startsWith("data:") ||
    normalizedHref.startsWith("mailto:") ||
    normalizedHref.startsWith("tel:")
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
