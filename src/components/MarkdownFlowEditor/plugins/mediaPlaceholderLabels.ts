import { Facet } from "@codemirror/state";
import { getEditorLocaleMessages } from "../editorI18n";

interface MediaPlaceholderLabels {
  image: string;
  video: string;
}

const defaultMessages = getEditorLocaleMessages();
const defaultLabels: MediaPlaceholderLabels = {
  image: defaultMessages.imageDefaultTitle,
  video: defaultMessages.videoDefaultTitle,
};

export const mediaPlaceholderLabels: Facet<
  MediaPlaceholderLabels,
  MediaPlaceholderLabels
> = Facet.define({
  combine: (values) => values[0] ?? defaultLabels,
});
