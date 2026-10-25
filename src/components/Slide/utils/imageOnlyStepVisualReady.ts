export const DEFAULT_IMAGE_ONLY_VISUAL_READY_TIMEOUT_MS = 15000;

export interface ImageOnlyStepVisualReadyImageLike {
  complete: boolean;
}

export interface ImageOnlyStepVisualReadyDocumentLike {
  readyState?: string;
  images?: ArrayLike<ImageOnlyStepVisualReadyImageLike>;
}

export interface ImageOnlyStepVisualReadyIframeLike {
  contentDocument?: ImageOnlyStepVisualReadyDocumentLike | null;
}

export const isImageOnlyStepIframeVisualReady = (
  iframe: ImageOnlyStepVisualReadyIframeLike
) => {
  const iframeDocument = iframe.contentDocument;

  if (!iframeDocument || iframeDocument.readyState !== "complete") {
    return false;
  }

  return Array.from(iframeDocument.images ?? []).every(
    (image) => image.complete
  );
};

export const areImageOnlyStepIframeVisualsReady = (
  iframes: ImageOnlyStepVisualReadyIframeLike[]
) => iframes.every(isImageOnlyStepIframeVisualReady);
