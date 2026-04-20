import {
  type CompletionContext,
  type CompletionResult,
} from "@codemirror/autocomplete";
import { EditorView } from "@codemirror/view";
import { SelectedOption } from "./types";
import { getVideoEmbedUrl } from "./utils/video";

const VARIABLE_NAME_SOURCE = "[\\p{L}\\p{N}_]+";
const VARIABLE_NAME_REGEXP = new RegExp(`^${VARIABLE_NAME_SOURCE}$`, "u");
const VARIABLE_EXPRESSION_PATTERN = `\\{\\{(${VARIABLE_NAME_SOURCE})\\}\\}`;
const FIXED_OUTPUT_MARKER = "===";

const createVariableExpressionRegexp = () =>
  new RegExp(VARIABLE_EXPRESSION_PATTERN, "gu");

const isValidVariableName = (name: string) =>
  typeof name === "string" && VARIABLE_NAME_REGEXP.test(name);

const extractVariableNames = (content: string) => {
  if (!content) {
    return [];
  }
  const matches: string[] = [];
  const regexp = createVariableExpressionRegexp();
  let match: RegExpExecArray | null;

  while ((match = regexp.exec(content)) !== null) {
    matches.push(match[1]);
  }

  return matches;
};

const parseContentInfo = (
  type: SelectedOption,
  dataset: { title?: string; url?: string; scalePercent?: number }
) => {
  switch (type) {
    case SelectedOption.Image:
      return {
        resourceUrl: dataset.url,
        resourceTitle: dataset.title,
        scalePercent: dataset.scalePercent,
      };

    case SelectedOption.Video:
      return {
        resourceUrl: dataset.url,
        resourceTitle: dataset.title,
      };
    case SelectedOption.Variable:
      return {
        variableName: dataset.title,
      };
    default:
      return {
        resourceUrl: dataset.url ?? "",
        resourceTitle: dataset.title ?? "",
      };
  }
};

function createSlashCommands(
  onSelectOption: (selectedOption: SelectedOption) => void,
  labels?: {
    divider?: string;
    fixedText?: string;
    image?: string;
    video?: string;
    variable?: string;
  }
) {
  return (context: CompletionContext): CompletionResult | null => {
    const word = context.matchBefore(/\/(\w*)$/);
    if (!word) return null;

    const handleSelect = (
      view: EditorView,
      _: any,
      from: number,
      to: number,
      selectedOption: SelectedOption
    ) => {
      view.dispatch({
        changes: { from, to, insert: "" },
      });
      onSelectOption(selectedOption);
    };

    return {
      from: word.from,
      to: word.to,
      options: [
        // {
        //   label: labels?.divider ?? "Divider",
        //   apply: (view, _, from, to) => {
        //     handleSelect(view, _, from, to, SelectedOption.Divider);
        //   },
        // },
        // {
        //   label: labels?.fixedText ?? "Fixed Text",
        //   apply: (view, _, from, to) => {
        //     handleSelect(view, _, from, to, SelectedOption.FixedText);
        //   },
        // },
        {
          label: labels?.variable ?? "Variable",
          apply: (view, _, from, to) => {
            handleSelect(view, _, from, to, SelectedOption.Variable);
          },
        },
        {
          label: labels?.image ?? "Image",
          apply: (view, _, from, to) => {
            handleSelect(view, _, from, to, SelectedOption.Image);
          },
        },
        {
          label: labels?.video ?? "Video",
          apply: (view, _, from, to) => {
            handleSelect(view, _, from, to, SelectedOption.Video);
          },
        },
      ],
      filter: false,
    };
  };
}

const getEmbedUrl = (url: string) => {
  return getVideoEmbedUrl(url);
};

const escapeHtmlAttribute = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

const escapeMarkdownText = (text: string) =>
  text.replace(/([\[\]\\])/g, "\\$1");

const clampScalePercent = (value: number) =>
  Math.max(1, Math.min(1000, Math.round(value)));

const wrapWithFixedOutput = (content: string) => {
  const normalizedContent = content.trim();
  if (!normalizedContent) {
    return `${FIXED_OUTPUT_MARKER}${FIXED_OUTPUT_MARKER}`;
  }
  const wrappedPattern = new RegExp(
    `^${FIXED_OUTPUT_MARKER}\\s*[\\s\\S]*?\\s*${FIXED_OUTPUT_MARKER}$`
  );
  if (wrappedPattern.test(normalizedContent)) {
    return normalizedContent;
  }
  return `${FIXED_OUTPUT_MARKER} ${normalizedContent} ${FIXED_OUTPUT_MARKER}`;
};

const unwrapFixedOutput = (content: string) => {
  const normalizedContent = content.trim();
  const wrappedPattern = new RegExp(
    `^${FIXED_OUTPUT_MARKER}\\s*([\\s\\S]*?)\\s*${FIXED_OUTPUT_MARKER}$`
  );
  const match = normalizedContent.match(wrappedPattern);
  return (match?.[1] ?? normalizedContent).trim();
};

const getImageContentToInsert = ({
  resourceUrl,
  resourceTitle,
  scalePercent,
}: {
  resourceUrl: string;
  resourceTitle?: string;
  scalePercent?: number;
}) => {
  const clampedScale =
    typeof scalePercent === "number"
      ? clampScalePercent(scalePercent)
      : undefined;
  const sanitizedHtmlUrl = escapeHtmlAttribute(resourceUrl);
  const sanitizedTitle = resourceTitle
    ? escapeHtmlAttribute(resourceTitle)
    : undefined;
  const markdownTitle = resourceTitle ? escapeMarkdownText(resourceTitle) : "";
  const widthAttribute =
    typeof clampedScale === "number" && clampedScale !== 100
      ? ` width="${clampedScale}%"`
      : "";
  const htmlTitleAttributes = sanitizedTitle
    ? ` alt="${sanitizedTitle}" title="${sanitizedTitle}"`
    : "";
  const imageMarkup =
    !clampedScale || clampedScale === 100
      ? `![${markdownTitle}](${resourceUrl})`
      : `<img src="${sanitizedHtmlUrl}"${htmlTitleAttributes}${widthAttribute} />`;

  return wrapWithFixedOutput(imageMarkup);
};

const getVideoContentToInsert = (
  resourceUrl: string,
  resourceTitle: string
) => {
  const embedUrl = getEmbedUrl(resourceUrl);
  const sanitizedTitle = resourceTitle
    ? escapeHtmlAttribute(resourceTitle)
    : "";
  const sanitizedResourceUrl = escapeHtmlAttribute(resourceUrl);
  const sanitizedEmbedUrl = escapeHtmlAttribute(embedUrl);
  const videoMarkup = `<iframe data-tag="video" data-title="${sanitizedTitle}" data-url="${sanitizedResourceUrl}" class="w-full aspect-video rounded-lg border-0" src="${sanitizedEmbedUrl}" allowfullscreen="" allow="autoplay; encrypted-media"></iframe>`;

  return wrapWithFixedOutput(videoMarkup);
};

export {
  createSlashCommands,
  parseContentInfo,
  getEmbedUrl,
  getImageContentToInsert,
  getVideoContentToInsert,
  isValidVariableName,
  extractVariableNames,
  createVariableExpressionRegexp,
  wrapWithFixedOutput,
  unwrapFixedOutput,
};
