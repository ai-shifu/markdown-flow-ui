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
  const key = process.env.NEXT_PUBLIC_IFRAME_KEY || undefined;
  return getVideoEmbedUrl(url, key);
};

const getVideoContentToInsert = (
  resourceUrl: string,
  resourceTitle: string
) => {
  const embedUrl = getEmbedUrl(resourceUrl);
  const escapeAttr = (value: string) =>
    value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  const sanitizedTitle = resourceTitle ? escapeAttr(resourceTitle) : "";
  const sanitizedResourceUrl = escapeAttr(resourceUrl);
  const sanitizedEmbedUrl = escapeAttr(embedUrl);
  return `<iframe data-tag="video" data-title="${sanitizedTitle}" data-url="${sanitizedResourceUrl}" class="w-full aspect-video rounded-lg border-0" src="${sanitizedEmbedUrl}" allowfullscreen="" allow="autoplay; encrypted-media"></iframe>`;
};

export {
  createSlashCommands,
  parseContentInfo,
  getEmbedUrl,
  getVideoContentToInsert,
  isValidVariableName,
  extractVariableNames,
  createVariableExpressionRegexp,
};
