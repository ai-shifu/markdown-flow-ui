const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const RAW_TEXT_TAGS = new Set([
  "script",
  "style",
  "textarea",
  "title",
  "iframe",
  "xmp",
  "noembed",
  "noframes",
]);

export const isHtmlRawTextTag = (name: string) => RAW_TEXT_TAGS.has(name);

type Markup =
  | { kind: "incomplete" }
  | { kind: "invalid" }
  | { kind: "comment" | "declaration"; end: number }
  | {
      kind: "tag";
      end: number;
      name: string;
      closing: boolean;
      selfClosing: boolean;
    };

const findTagEnd = (raw: string, start: number) => {
  let quote = "";
  for (let index = start; index < raw.length; index += 1) {
    const character = raw[index];
    if (quote) {
      if (character === quote) quote = "";
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === ">") {
      return index + 1;
    }
  }
  return -1;
};

export const readHtmlMarkup = (raw: string, start: number): Markup => {
  if (raw.startsWith("<!--", start)) {
    const close = raw.indexOf("-->", start + 4);
    return close === -1
      ? { kind: "incomplete" }
      : { kind: "comment", end: close + 3 };
  }

  const nextCharacter = raw[start + 1];
  if (!nextCharacter) return { kind: "incomplete" };
  if (nextCharacter === "!" || nextCharacter === "?") {
    const end = findTagEnd(raw, start + 2);
    return end === -1 ? { kind: "incomplete" } : { kind: "declaration", end };
  }

  const closing = nextCharacter === "/";
  const nameStart = start + (closing ? 2 : 1);
  const nameMatch = /^[a-z][a-z0-9:-]*/i.exec(raw.slice(nameStart));
  if (!nameMatch) {
    return nameStart === raw.length
      ? { kind: "incomplete" }
      : { kind: "invalid" };
  }

  const afterName = nameStart + nameMatch[0].length;
  if (afterName === raw.length) return { kind: "incomplete" };
  if (!/[\s/>]/.test(raw[afterName])) return { kind: "invalid" };
  const end = findTagEnd(raw, afterName);
  if (end === -1) return { kind: "incomplete" };

  return {
    kind: "tag",
    end,
    name: nameMatch[0].toLowerCase(),
    closing,
    selfClosing: /\/\s*>$/.test(raw.slice(start, end)),
  };
};

/**
 * Find the received HTML run's end without requiring the run to be complete.
 * Nested text remains inside its root, and adjacent HTML siblings share the run.
 * Once all roots close, ordinary prose starts a new markdown segment.
 */
const findHtmlEnd = (
  raw: string,
  startIndex: number,
  stopBeforeRoot: ((startIndex: number) => boolean) | undefined,
  includeSiblings: boolean
): number => {
  const stack: string[] = [];
  let position = startIndex;
  let lastCompletedEnd = startIndex;
  let hasMarkup = false;

  while (position < raw.length) {
    const rawTextTag = stack[stack.length - 1];
    if (RAW_TEXT_TAGS.has(rawTextTag)) {
      // HTML treats script/style bodies as raw text, even when they contain '<'.
      const closingPattern = new RegExp(`</${rawTextTag}(?=[\\s/>])`, "gi");
      closingPattern.lastIndex = position;
      const closing = closingPattern.exec(raw);
      if (!closing) return raw.length;
      position = closing.index;
    }

    if (!stack.length && hasMarkup) {
      if (!includeSiblings) return lastCompletedEnd;
      while (/\s/.test(raw[position] ?? "") && position < raw.length) {
        position += 1;
      }
      if (position === raw.length) return raw.length;
      if (raw[position] !== "<") return lastCompletedEnd;
    }

    if (raw[position] !== "<") {
      const nextMarkup = raw.indexOf("<", position);
      if (nextMarkup === -1) return raw.length;
      position = nextMarkup;
    }

    const markup = readHtmlMarkup(raw, position);
    if (markup.kind === "incomplete") {
      if (
        !stack.length &&
        hasMarkup &&
        /^<[a-z][a-z0-9:-]*(?=[\s/>])/i.test(raw.slice(position)) &&
        stopBeforeRoot?.(position)
      )
        return lastCompletedEnd;
      return raw.length;
    }
    if (markup.kind === "invalid") {
      if (!stack.length && hasMarkup) return lastCompletedEnd;
      position += 1;
      continue;
    }

    if (
      !stack.length &&
      hasMarkup &&
      markup.kind === "tag" &&
      !markup.closing &&
      stopBeforeRoot?.(position)
    ) {
      return lastCompletedEnd;
    }

    hasMarkup = true;
    position = markup.end;
    if (markup.kind === "tag") {
      if (markup.closing) {
        const matchingOpen = stack.lastIndexOf(markup.name);
        if (matchingOpen !== -1) stack.length = matchingOpen;
      } else if (!markup.selfClosing && !VOID_TAGS.has(markup.name)) {
        stack.push(markup.name);
      }
    }

    if (!stack.length) lastCompletedEnd = position;
  }

  return raw.length;
};

export const findStreamingHtmlBlockEnd = (
  raw: string,
  startIndex: number,
  stopBeforeRoot?: (startIndex: number) => boolean
) => findHtmlEnd(raw, startIndex, stopBeforeRoot, true);

/** Return one received element, retaining its incomplete tail without siblings. */
export const findStreamingHtmlElementEnd = (raw: string, startIndex: number) =>
  findHtmlEnd(raw, startIndex, undefined, false);
