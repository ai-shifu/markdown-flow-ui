import {
  type CompletionContext,
  type CompletionResult,
} from "@codemirror/autocomplete";
import {
  EditorView,
  Decoration,
  DecorationSet,
  ViewPlugin,
  ViewUpdate,
  MatchDecorator,
  WidgetType,
} from "@codemirror/view";
import { SelectedOption } from "./types";
import "./markdownFlowEditor.css";
import { biliVideoUrlRegexp } from "./components/VideoInject";

const biliVideoContextRegexp =
  /<iframe\s+[^>]*data-tag="video"[^>]*data-title="([^"]*)"[^>]*src="([^"]+)"[^>]*>[^<]*<\/iframe>/gi;
const agiImgContextRegexp = /!\[([^\]]*)\]\(([^)]+)\)/gi;

const parseContentInfo = (
  type: SelectedOption,
  dataset: { title: string; url: string }
) => {
  switch (type) {
    case SelectedOption.Image:
      return {
        resourceUrl: dataset.url,
        resourceTitle: dataset.title,
      };

    case SelectedOption.Video:
      return {
        resourceUrl: dataset.url,
        resourceTitle: dataset.title,
      };
  }
};

class PlaceholderWidget extends WidgetType {
  constructor(
    private text: string,
    private dataset: any,
    private styleClass: string,
    private type: SelectedOption,
    private view: EditorView
  ) {
    super();
  }

  getPosition() {
    let from = -1;
    let to = -1;
    const decorations = this.view.state.facet(EditorView.decorations);
    for (const deco of decorations) {
      const decoSet = typeof deco === "function" ? deco(this.view) : deco;
      decoSet.between(
        0,
        this.view.state.doc.length,
        (start: number, end: number, decoration: Decoration) => {
          if (decoration.spec.widget === this) {
            from = start;
            to = end;
            return false;
          }
        }
      );
      if (from !== -1) break;
    }
    if (from !== -1 && to !== -1) {
      return [from, to];
    }
  }

  toDOM() {
    const container = document.createElement("span");
    container.className = this.styleClass;
    const span = document.createElement("span");
    span.textContent = this.text;
    span.dataset["tag"] = this.dataset.tag || "";
    span.dataset["url"] = this.dataset.url || "";
    span.dataset["title"] = this.dataset.title || "";
    const icon = document.createElement("span");
    icon.className = "tag-icon";
    icon.innerHTML = "✕";
    icon.addEventListener("click", (e) => {
      e.stopPropagation();
      const [from, to] = this.getPosition() ?? [-1, -1];
      if (from !== -1 && to !== -1) {
        this.view.dispatch({
          changes: { from, to, insert: "" },
        });
      }
    });
    span.addEventListener("click", () => {
      const [from, to] = this.getPosition() ?? [-1, -1];
      const event = new CustomEvent("globalTagClick", {
        detail: {
          view: this.view,
          type: this.type,
          dataset: this.dataset,
          content: span.textContent,
          from,
          to,
        },
      });
      window.dispatchEvent(event);
    });
    container.appendChild(span);
    container.appendChild(icon);
    return container;
  }

  ignoreEvent() {
    return false;
  }
}

const imageUrlMatcher = new MatchDecorator({
  regexp: agiImgContextRegexp,
  decoration: (match, view) =>
    Decoration.replace({
      widget: new PlaceholderWidget(
        match?.[1],
        {
          tag: "image",
          url: match?.[2],
          title: match?.[1],
        },
        "tag-image",
        SelectedOption.Image,
        view
      ),
    }),
});

const biliUrlMatcher = new MatchDecorator({
  regexp: biliVideoContextRegexp,
  decoration: (match, view) => {
    // Extract and decode the original URL from the API endpoint
    let originalUrl = match?.[2] || "";
    try {
      const urlParams = new URLSearchParams(new URL(originalUrl).search);
      const encodedUrl = urlParams.get("url");
      if (encodedUrl) {
        originalUrl = decodeURIComponent(encodedUrl);
      }
    } catch (error) {
      console.warn("Failed to decode video URL:", error);
    }

    return Decoration.replace({
      widget: new PlaceholderWidget(
        match?.[1] || "Video", // Display title from data-title
        {
          tag: "video",
          url: originalUrl, // Decoded original Bilibili URL
          title: match?.[1], // title from data-title attribute
        },
        "tag-video",
        SelectedOption.Video,
        view
      ),
    });
  },
});

const imgPlaceholders = ViewPlugin.fromClass(
  class {
    placeholders: DecorationSet;
    constructor(view: EditorView) {
      this.placeholders = imageUrlMatcher.createDeco(view);
    }
    update(update: ViewUpdate) {
      this.placeholders = imageUrlMatcher.updateDeco(update, this.placeholders);
    }
  },
  {
    decorations: (instance) => instance.placeholders,
    provide: (plugin) =>
      EditorView.atomicRanges.of((view) => {
        return view.plugin(plugin)?.placeholders || Decoration.none;
      }),
  }
);

const videoPlaceholders = ViewPlugin.fromClass(
  class {
    placeholders: DecorationSet;
    constructor(view: EditorView) {
      this.placeholders = biliUrlMatcher.createDeco(view);
    }
    update(update: ViewUpdate) {
      this.placeholders = biliUrlMatcher.updateDeco(update, this.placeholders);
    }
  },
  {
    decorations: (instance) => instance.placeholders,
    provide: (plugin) =>
      EditorView.atomicRanges.of((view) => {
        return view.plugin(plugin)?.placeholders || Decoration.none;
      }),
  }
);

function createSlashCommands(
  onSelectOption: (selectedOption: SelectedOption) => void
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
          label: "Image",
          apply: (view, _, from, to) => {
            handleSelect(view, _, from, to, SelectedOption.Image);
          },
        },
        {
          label: "Video",
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
  if (biliVideoUrlRegexp.test(url)) {
    const encoded = encodeURIComponent(url);
    return `https://if-cdn.com/api/iframe?url=${encoded}&key=a68bac8b6624d46b6d0ba46e5b3f8971`;
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
  imgPlaceholders,
  videoPlaceholders,
  createSlashCommands,
  parseContentInfo,
  getEmbedUrl,
  getVideoContentToInsert,
};
