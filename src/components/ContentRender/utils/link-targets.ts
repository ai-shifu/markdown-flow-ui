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

export const isAnchorElement = (
  node: { tagName?: string | null } | null | undefined
): node is HTMLAnchorElement => node?.tagName?.toLowerCase() === "a";

export const resolveClosestAnchor = (target: EventTarget | null) => {
  const candidate = target as {
    closest?: (selector: string) => Element | null;
    parentElement?: Element | null;
  } | null;

  if (!candidate) {
    return null;
  }

  if (typeof candidate.closest === "function") {
    const anchor = candidate.closest("a[href]");
    return isAnchorElement(anchor) ? anchor : null;
  }

  const anchor = candidate.parentElement?.closest("a[href]");
  return isAnchorElement(anchor) ? anchor : null;
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
