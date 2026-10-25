type FenceContainer = { quote: true } | { indent: number };

const expandFenceTabs = (line: string) => {
  let added = 0;
  return line.replace(/\t/g, (_tab, index: number) => {
    const width = 4 - ((index + added) % 4);
    added += width - 1;
    return " ".repeat(width);
  });
};

export const findResumedProseFence = (source: string, start: number) => {
  if (start > 0 && source[start - 1] !== "\n") return;
  const openingEnd = source.indexOf("\n", start);
  const line = expandFenceTabs(
    source.slice(start, openingEnd === -1 ? source.length : openingEnd)
  );
  const containers: FenceContainer[] = [];
  let cursor = 0;
  while (cursor < line.length) {
    const quote = /^ {0,3}> ?/.exec(line.slice(cursor));
    if (quote) {
      containers.push({ quote: true });
      cursor += quote[0].length;
      continue;
    }
    const list = /^( {0,3})([*+-]|\d{1,9}[.)])( +)/.exec(line.slice(cursor));
    if (!list) break;
    // Five or more spaces begin indented code instead of a fence in the item.
    const padding = list[3].length > 4 ? 1 : list[3].length;
    const indent = list[1].length + list[2].length + padding;
    containers.push({ indent });
    cursor += indent;
  }
  const opening = /^ {0,3}(`{3,}|~{3,})([^\r\n]*)\r?$/.exec(line.slice(cursor));
  if (!opening || (opening[1][0] === "`" && opening[2].includes("`"))) return;
  const closing = new RegExp(
    `^ {0,3}${opening[1][0]}{${opening[1].length},} *\\r?$`
  );
  let position = openingEnd === -1 ? source.length : openingEnd + 1;
  while (position < source.length) {
    const newline = source.indexOf("\n", position);
    const end = newline === -1 ? source.length : newline;
    const body = expandFenceTabs(source.slice(position, end));
    let offset = 0;
    for (const container of containers) {
      if ("quote" in container) {
        const quote = /^ {0,3}> ?/.exec(body.slice(offset));
        if (!quote) return { start, end: position, type: "markdown" as const };
        offset += quote[0].length;
      } else {
        const spaces = /^ */.exec(body.slice(offset))![0].length;
        if (spaces < container.indent) {
          // Empty lines may omit list continuation indentation.
          if (!body.slice(offset).trim()) {
            offset = body.length;
            break;
          }
          return { start, end: position, type: "markdown" as const };
        }
        offset += container.indent;
      }
    }
    if (closing.test(body.slice(offset)))
      return { start, end, type: "markdown" as const };
    position = newline === -1 ? source.length : newline + 1;
  }
  return { start, end: source.length, type: "markdown" as const };
};
