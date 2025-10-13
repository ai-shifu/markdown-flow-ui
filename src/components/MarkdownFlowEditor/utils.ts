import {
  type CompletionContext,
  type CompletionResult,
} from "@codemirror/autocomplete";
import { EditorView } from "@codemirror/view";
import { SelectedOption } from "./types";
import {
  biliVideoUrlRegexp,
  youtubeVideoUrlRegexp,
} from "./components/VideoInject";

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
        {
          label: labels?.fixedText ?? "Fixed Text",
          apply: (view, _, from, to) => {
            handleSelect(view, _, from, to, SelectedOption.FixedText);
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
        {
          label: labels?.variable ?? "Variable",
          apply: (view, _, from, to) => {
            handleSelect(view, _, from, to, SelectedOption.Variable);
          },
        },
      ],
      filter: false,
    };
  };
}

const getEmbedUrl = (url: string) => {
  if (biliVideoUrlRegexp.test(url)) {
    const encoded = encodeURIComponent(url);
    const key = process.env.NEXT_PUBLIC_IFRAME_KEY ?? "";
    return key
      ? `https://if-cdn.com/api/iframe?url=${encoded}&key=${key}`
      : url;
  }
  if (youtubeVideoUrlRegexp.test(url)) {
    const match = url.match(youtubeVideoUrlRegexp);
    const videoId = match?.[1];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }
  return url;
};

const getVideoContentToInsert = (
  resourceUrl: string,
  resourceTitle: string
) => {
  const embedUrl = getEmbedUrl(resourceUrl);
  return `<iframe data-tag="video" data-title="${resourceTitle}" class="w-full aspect-video rounded-lg border-0" src="${embedUrl}" allowfullscreen="" allow="autoplay; encrypted-media"></iframe>`;
};

export {
  biliVideoUrlRegexp,
  createSlashCommands,
  parseContentInfo,
  getEmbedUrl,
  getVideoContentToInsert,
};
