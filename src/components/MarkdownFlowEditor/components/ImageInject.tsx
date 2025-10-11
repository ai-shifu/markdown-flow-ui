/** inject image to mc-editor */
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { useTranslation } from "react-i18next";
import { Upload } from "lucide-react";

import EditorContext from "../editor-context";
import { isValidImageUrl, sanitizeImageUrl } from "../utils/image";
import { UploadProps, UploadRequestOption } from "../uploadTypes";

export type ImageResource = {
  resourceUrl: string;
  resourceTitle?: string;
  scalePercent?: number;
};

export interface ImageInjectProps {
  value?: Partial<ImageResource>;
  onSelect: (resource: ImageResource) => void;
  uploadProps?: UploadProps;
}

const ImageInject = React.forwardRef<HTMLDivElement, ImageInjectProps>(
  ({ value, onSelect, uploadProps }, ref) => {
    const { t } = useTranslation();
    const { setDialogOpen } = useContext(EditorContext);

    const [resource, setResource] = useState<ImageResource>({
      resourceUrl: value?.resourceUrl ?? "",
      resourceTitle: value?.resourceTitle ?? "",
      scalePercent: value?.scalePercent ?? 100,
    });
    const [previewLoaded, setPreviewLoaded] = useState<boolean>(
      Boolean(value?.resourceUrl)
    );
    const [tempUrl, setTempUrl] = useState<string>(value?.resourceUrl ?? "");
    const [scale, setScale] = useState<number>(value?.scalePercent ?? 100);
    const [errorTip, setErrorTip] = useState<string>("");

    useEffect(() => {
      if (value?.resourceUrl) {
        setResource((prev) => ({
          ...prev,
          resourceUrl: value.resourceUrl ?? "",
          resourceTitle: value.resourceTitle ?? prev.resourceTitle ?? "",
          scalePercent: value.scalePercent ?? prev.scalePercent ?? 100,
        }));
        setTempUrl(value.resourceUrl ?? "");
        setScale(value.scalePercent ?? 100);
        setPreviewLoaded(true);
      }
    }, [value]);

    const handleCancel = () => {
      setDialogOpen(false);
    };

    const applyImage = (url: string, name?: string) => {
      const sanitizedUrl = sanitizeImageUrl(url);
      setResource({
        resourceUrl: sanitizedUrl,
        resourceTitle:
          name ||
          resource.resourceTitle ||
          t("imageDefaultTitle", "Image name"),
        scalePercent: scale,
      });
      setTempUrl(sanitizedUrl);
      setPreviewLoaded(true);
      setErrorTip("");
    };

    const handleSelect = () => {
      if (!resource.resourceUrl) return;
      onSelect({
        resourceUrl: resource.resourceUrl,
        resourceTitle:
          resource.resourceTitle || t("imageDefaultTitle", "Image name"),
        scalePercent: scale,
      });
      setDialogOpen(false);
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const url = e.target.value.trim();
      setTempUrl(url);
      setPreviewLoaded(false);
      setErrorTip("");
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setResource((prev) => ({
        ...prev,
        resourceTitle: e.target.value,
      }));
    };

    const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/[^\d]/g, "");
      const next = Math.max(1, Math.min(1000, Number(value || 100)));
      setScale(next);
      setResource((prev) => ({
        ...prev,
        scalePercent: next,
      }));
    };

    const handleRun = () => {
      if (!tempUrl) {
        setErrorTip(t("imageUrlRequired", "Please enter image URL"));
        return;
      }
      if (!isValidImageUrl(tempUrl)) {
        setErrorTip(t("imageInvalidUrl", "Please enter a valid image URL"));
        return;
      }
      applyImage(tempUrl);
      if (!resource.resourceTitle && tempUrl) {
        try {
          const parsed = new URL(tempUrl);
          const name = decodeURIComponent(
            parsed.pathname.split("/").filter(Boolean).pop() ?? ""
          );
          if (name) {
            setResource((prev) => ({
              ...prev,
              resourceTitle: name,
            }));
          }
        } catch (error) {
          // ignore
          console.error(error);
        }
      }
    };

    const finalize = (url: string, fileName: string) => {
      applyImage(url, fileName);
    };

    const handleUploadError = (error: any, currentFile: File) => {
      const message =
        error?.message || t("imageUploadError", "Upload failed, please retry");
      setErrorTip(message);
      uploadProps?.onError?.(error, currentFile);
    };

    const runCustomRequest = async (targetFile: File) => {
      const options: UploadRequestOption = {
        file: targetFile,
        filename: uploadProps?.name,
        data:
          typeof uploadProps?.data === "function"
            ? await uploadProps.data(targetFile)
            : uploadProps?.data,
        headers: uploadProps?.headers,
        withCredentials: uploadProps?.withCredentials,
        action:
          typeof uploadProps?.action === "function"
            ? await uploadProps.action(targetFile)
            : uploadProps?.action,
        onProgress: (event) => uploadProps?.onProgress?.(event, targetFile),
        onError: (error) => handleUploadError(error, targetFile),
        onSuccess: (response: any) => {
          uploadProps?.onSuccess?.(response, targetFile);
          const url =
            typeof response === "string"
              ? response
              : (response?.url ?? response?.data?.url);
          if (url) {
            finalize(url, targetFile.name);
          } else {
            handleUploadError(new Error("INVALID_RESPONSE"), targetFile);
          }
        },
      };
      uploadProps?.customRequest?.(options);
    };

    const runActionUpload = async (targetFile: File) => {
      const action =
        typeof uploadProps?.action === "function"
          ? await uploadProps.action(targetFile)
          : uploadProps?.action;
      if (!action) {
        finalize(URL.createObjectURL(targetFile), targetFile.name);
        return;
      }

      try {
        const formData = new FormData();
        formData.append(uploadProps?.name ?? "file", targetFile);
        const extraData =
          typeof uploadProps?.data === "function"
            ? await uploadProps.data(targetFile)
            : uploadProps?.data;
        if (extraData) {
          Object.entries(extraData).forEach(([key, val]) => {
            formData.append(key, val as any);
          });
        }

        const response = await fetch(action, {
          method: "POST",
          body: formData,
          headers: uploadProps?.headers,
          credentials: uploadProps?.withCredentials ? "include" : "same-origin",
        });
        const result = await response.json();
        uploadProps?.onSuccess?.(result, targetFile);
        const url = typeof result === "string" ? result : result?.data;

        if (url) {
          finalize(url, targetFile.name);
        } else {
          handleUploadError(new Error("INVALID_RESPONSE"), targetFile);
        }
      } catch (error: any) {
        handleUploadError(error, targetFile);
      }
    };

    const triggerUpload = async (file: File) => {
      try {
        let candidate: File | Blob | boolean | void = file;
        if (uploadProps?.beforeUpload) {
          candidate = await uploadProps.beforeUpload(file);
          if (candidate === false) {
            return;
          }
        }

        if (candidate instanceof Blob && !(candidate instanceof File)) {
          candidate = new File([candidate], file.name, {
            type: candidate.type || file.type,
          });
        }

        const finalFile = candidate instanceof File ? candidate : file;

        if (uploadProps?.customRequest) {
          await runCustomRequest(finalFile);
          return;
        }
        if (uploadProps?.action) {
          await runActionUpload(finalFile);
          return;
        }

        const localUrl = URL.createObjectURL(finalFile);
        finalize(localUrl, finalFile.name);
        uploadProps?.onSuccess?.({ url: localUrl }, finalFile);
      } catch (error: any) {
        handleUploadError(error, file);
      }
    };

    const onFileInputChange = async (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file = event.target.files?.[0];
      if (!file) return;
      await triggerUpload(file);
      event.target.value = "";
    };

    const scaleInput = useMemo(
      () => (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={scale}
            min={1}
            max={1000}
            onChange={handleScaleChange}
            className="w-24"
          />
          <span>%</span>
        </div>
      ),
      [scale]
    );

    return (
      <div ref={ref} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t("imageUrlLabel", "URL")}
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder={t("imageUrlPlaceholder", "Please enter image URL")}
              value={tempUrl}
              onChange={handleUrlChange}
              autoComplete="off"
            />
            <Button
              className="h-8"
              variant="outline"
              type="button"
              onClick={handleRun}
            >
              {t("imageRunButton", "Run")}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t("imageUploadLabel", "Upload")}
          </label>
          <label
            className={`flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed ${
              previewLoaded ? "bg-muted/40" : "bg-muted/10"
            }`}
          >
            {previewLoaded && resource.resourceUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resource.resourceUrl}
                alt={resource.resourceTitle || "preview"}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                <Upload className="h-6 w-6" />
                <span>
                  {t("imageUploadPlaceholder", "Drag files or click to upload")}
                </span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileInputChange}
            />
          </label>
        </div>

        {previewLoaded && resource.resourceUrl && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t("imageTitleLabel", "Image Title")}
              </label>
              <Input
                type="text"
                placeholder={t(
                  "imageTitlePlaceholder",
                  "Please enter image title"
                )}
                value={resource.resourceTitle || ""}
                onChange={handleTitleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t("imageScaleLabel", "Scale")}
              </label>
              {scaleInput}
            </div>
          </>
        )}

        {!!errorTip && <p className="text-xs text-destructive">{errorTip}</p>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleCancel}>
            {t("imageCancelButton", "Cancel")}
          </Button>
          <Button
            className="h-8"
            onClick={handleSelect}
            disabled={!resource?.resourceUrl}
          >
            {t("imageUseButton", "Use Image")}
          </Button>
        </div>
      </div>
    );
  }
);

ImageInject.displayName = "ImageInject";

export default ImageInject;
