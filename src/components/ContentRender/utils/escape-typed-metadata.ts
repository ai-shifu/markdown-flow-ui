export type MarkdownMetadataRange = Readonly<{
  start: number;
  end: number;
  pending?: true;
}>;

/** Protect only the unfinished metadata in a raw typed prefix's render copy. */
export const escapeTypedMarkdownMetadata = (
  visible: string,
  ranges: readonly MarkdownMetadataRange[],
  sourceOffset = 0
) => {
  const end = sourceOffset + visible.length;
  let low = 0;
  let high = ranges.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (ranges[middle].start < end) low = middle + 1;
    else high = middle;
  }
  const range = ranges[low - 1];
  if (!range || end > range.end || (end === range.end && !range.pending))
    return visible;
  const start = Math.max(0, range.start - sourceOffset);
  return visible.slice(0, start) + visible.slice(start).replace(/</g, "&lt;");
};
