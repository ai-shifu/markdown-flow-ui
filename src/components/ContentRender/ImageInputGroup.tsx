import React, { useRef } from "react";
import { ImagePlus, LoaderCircle, X } from "lucide-react";

import { cn } from "../../lib/utils";
import type { MarkdownFlowLocale } from "../../lib/locale";
import { InputGroup, InputGroupButton } from "../ui/inputGroup/input-group";
import { getContentRenderLocaleTexts } from "./contentRenderI18n";

/** Controlled upload state. The host owns validation, persistence and errors. */
export interface ImageInputOptions {
  /** Uploaded image URLs in submission order. */
  images: readonly string[];
  /** Prevent submission and attachment changes while uploads are pending. */
  uploading?: boolean;
  /** Disable attachment changes independently of text editing. */
  disabled?: boolean;
  /** Receive the selected files; update images after uploading them. */
  onSelect?: (files: File[]) => void;
  /** Remove an uploaded image by its index. */
  onRemove?: (index: number) => void;
  /** File picker filter. Defaults to image files. */
  accept?: string;
  /** Disable adding more images when this count is reached. */
  maxImages?: number;
  /** Resolve display URLs without changing the URLs returned on submission. */
  resolvePreviewUrl?: (url: string) => string;
}

interface ImageInputGroupProps extends React.ComponentProps<typeof InputGroup> {
  showImageInput?: boolean;
  imageInput?: ImageInputOptions;
  disabled?: boolean;
  locale?: MarkdownFlowLocale;
}

/** Keep attachment controls inside the same border as the text input. */
export function ImageInputGroup({
  showImageInput = false,
  imageInput,
  disabled,
  locale,
  children,
  className,
  ...props
}: ImageInputGroupProps) {
  const input = useRef<HTMLInputElement>(null);
  const texts = getContentRenderLocaleTexts(locale);
  const images = imageInput?.images ?? [];
  const uploading = Boolean(imageInput?.uploading);
  const pickerDisabled =
    disabled ||
    imageInput?.disabled ||
    uploading ||
    !imageInput?.onSelect ||
    (imageInput.maxImages !== undefined &&
      images.length >= imageInput.maxImages);
  const hasAttachments = showImageInput || images.length > 0;

  return (
    <InputGroup
      {...props}
      data-disabled={disabled}
      className={cn(
        className,
        hasAttachments && "h-auto flex-col !items-stretch"
      )}
    >
      {images.length > 0 ? (
        <span className="flex w-full flex-wrap gap-2 px-3 pt-2 pb-1">
          {images.map((url, index) => {
            const source = imageInput?.resolvePreviewUrl?.(url) ?? url;
            // Only web URLs become active links; local data previews remain display-only.
            const href =
              source.startsWith("/") || /^https?:\/\//i.test(source)
                ? source
                : undefined;
            return (
              <span key={`${url}-${index}`} className="relative inline-flex">
                <a href={href} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element -- Host upload and data URLs bypass framework-specific image optimization. */}
                  <img
                    src={source}
                    alt={`${texts.attachedImageLabel} ${index + 1}`}
                    className="h-14 w-14 rounded-md border object-contain"
                  />
                </a>
                {!disabled && imageInput?.onRemove ? (
                  <button
                    type="button"
                    aria-label={`${texts.removeImageLabel} ${index + 1}`}
                    disabled={uploading || imageInput.disabled}
                    onClick={() => imageInput.onRemove?.(index)}
                    className="absolute -end-1 -top-1 inline-flex size-5 items-center justify-center rounded-full border bg-white text-gray-700 disabled:opacity-50"
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                ) : null}
              </span>
            );
          })}
        </span>
      ) : null}
      {hasAttachments ? (
        <span className="flex w-full min-w-0 items-end">
          {showImageInput && !disabled ? (
            <>
              <input
                ref={input}
                type="file"
                accept={imageInput?.accept ?? "image/*"}
                multiple
                hidden
                disabled={pickerDisabled}
                onChange={(event) => {
                  const files = Array.from(event.currentTarget.files ?? []);
                  event.currentTarget.value = "";
                  if (!pickerDisabled && files.length)
                    imageInput?.onSelect?.(files);
                }}
              />
              <InputGroupButton
                type="button"
                size="icon-sm"
                variant="ghost"
                disabled={pickerDisabled}
                onClick={() => input.current?.click()}
                aria-label={
                  uploading ? texts.imageUploadingLabel : texts.addImageLabel
                }
                title={texts.addImageLabel}
                className="ms-1 shrink-0"
              >
                {uploading ? (
                  <LoaderCircle
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <ImagePlus className="size-4" aria-hidden="true" />
                )}
              </InputGroupButton>
            </>
          ) : null}
          {children}
        </span>
      ) : (
        children
      )}
    </InputGroup>
  );
}
