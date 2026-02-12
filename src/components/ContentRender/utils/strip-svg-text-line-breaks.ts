const TEXT_BLOCK_REGEX = /(<text\b[^>]*>)([\s\S]*?)(<\/text>)/gi;
const LINE_BREAK_TEST_REGEX = /<br\s*\/?>/i;
const LINE_BREAK_REPLACE_REGEX = /<br\s*\/?>/gi;

export const stripSvgTextLineBreaks = (svg: string) => {
  if (typeof svg !== "string") {
    return "";
  }

  if (!svg || svg.indexOf("<text") === -1 || svg.indexOf("<br") === -1) {
    return svg;
  }

  return svg.replace(TEXT_BLOCK_REGEX, (match, openTag, content, closeTag) => {
    if (!LINE_BREAK_TEST_REGEX.test(content)) {
      return match;
    }

    const cleaned = content.replace(LINE_BREAK_REPLACE_REGEX, "");
    return `${openTag}${cleaned}${closeTag}`;
  });
};
