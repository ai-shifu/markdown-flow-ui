export type MarkdownMetadataRange = Readonly<{
  start: number;
  end: number;
  pending?: true;
  imageAltEnd?: number;
  imageResolveEnd?: number;
}>;

/** Protect unresolved metadata and image alt in a raw prefix's render copy. */
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
  const spans: Array<{ start: number; end: number; alt: boolean }> = [];
  for (let index = 0; index < low; index += 1) {
    const image = ranges[index];
    if (
      image.imageAltEnd !== undefined &&
      image.imageAltEnd > sourceOffset &&
      (image.pending || end < (image.imageResolveEnd ?? image.end))
    )
      spans.push({
        start: Math.max(0, image.start - sourceOffset),
        end: Math.min(visible.length, image.imageAltEnd - sourceOffset),
        alt: true,
      });
  }
  if (range && end <= range.end && (end < range.end || range.pending)) {
    const start = Math.max(
      sourceOffset,
      range.imageAltEnd === undefined ? range.start : range.imageAltEnd + 1
    );
    if (start < end)
      spans.push({
        start: start - sourceOffset,
        end: visible.length,
        alt: false,
      });
  }
  if (!spans.length) return visible;
  const parts: string[] = [];
  let cursor = 0;
  for (const span of spans) {
    if (span.end <= span.start) continue;
    parts.push(visible.slice(cursor, span.start));
    const value = visible.slice(span.start, span.end);
    parts.push(
      span.alt
        ? value.replace(/(\\*)</g, (match, slashes: string) =>
            slashes.length % 2 ? match : `${slashes}&lt;`
          )
        : value.replace(/</g, "&lt;")
    );
    cursor = span.end;
  }
  parts.push(visible.slice(cursor));
  return parts.join("");
};
