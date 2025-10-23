/** inject image to mc-editor */
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { useTranslation } from "react-i18next";
import { Loader2, Upload } from "lucide-react";

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
    const [scale, setScale] = useState<number | undefined>(
      value?.scalePercent ?? 100
    );
    const [scaleInputValue, setScaleInputValue] = useState<string>(
      value?.scalePercent !== undefined ? String(value.scalePercent) : "100"
    );
    const [errorTip, setErrorTip] = useState<string>("");
    const [uploadStatus, setUploadStatus] = useState<
      "idle" | "loading" | "success" | "error"
    >("idle");
    const isUploading = uploadStatus === "loading";

    useEffect(() => {
      if (value?.resourceUrl) {
        setResource((prev) => ({
          ...prev,
          resourceUrl: value.resourceUrl ?? "",
          resourceTitle: value.resourceTitle ?? prev.resourceTitle ?? "",
          scalePercent: value.scalePercent ?? prev.scalePercent ?? 100,
        }));
        setTempUrl(value.resourceUrl ?? "");
        const resolvedScale =
          value.scalePercent !== undefined ? value.scalePercent : 100;
        setScale(resolvedScale);
        setScaleInputValue(
          value.scalePercent !== undefined
            ? String(value.scalePercent)
            : String(resolvedScale)
        );
        setPreviewLoaded(true);
      }
      setUploadStatus("idle");
    }, [value]);

    const handleCancel = () => {
      if (isUploading) return;
      setDialogOpen(false);
    };

    const applyImage = (url: string, name?: string) => {
      const sanitizedUrl = sanitizeImageUrl(url);
      setResource({
        resourceUrl: sanitizedUrl,
        resourceTitle: name || resource.resourceTitle || t("imageDefaultTitle"),
        scalePercent: scale,
      });
      setTempUrl(sanitizedUrl);
      setPreviewLoaded(true);
      setErrorTip("");
      if (uploadStatus === "loading") {
        setUploadStatus("success");
      }
    };

    const handleSelect = () => {
      if (isUploading) return;
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
      const inputValue = e.target.value.replace(/[^\d]/g, "");
      setScaleInputValue(inputValue);
      if (!inputValue) {
        setScale(undefined);
        setResource((prev) => ({
          ...prev,
          scalePercent: undefined,
        }));
        return;
      }
      const numeric = Math.max(1, Math.min(1000, Number(inputValue)));
      setScale(numeric);
      setResource((prev) => ({
        ...prev,
        scalePercent: numeric,
      }));
    };

    const handleRun = () => {
      if (isUploading) return;
      setUploadStatus("idle");
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
      setUploadStatus("success");
      applyImage(url, fileName);
    };

    const handleUploadError = (error: any, currentFile: File) => {
      const message =
        error?.message || t("imageUploadError", "Upload failed, please retry");
      setErrorTip(message);
      setUploadStatus("error");
      setPreviewLoaded(Boolean(resource.resourceUrl));
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
        setErrorTip("");
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
        setUploadStatus("loading");
        setPreviewLoaded(false);

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
        setUploadStatus("error");
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
            type="text"
            value={scaleInputValue}
            onChange={handleScaleChange}
            className="w-24"
            inputMode="numeric"
            pattern="[0-9]*"
          />
          <span>%</span>
        </div>
      ),
      [scaleInputValue]
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
            className={`relative group flex h-48 w-full flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed transition-colors ${
              previewLoaded ? "bg-muted/40" : "bg-muted/10"
            } ${
              isUploading
                ? "cursor-wait opacity-80 pointer-events-none"
                : "cursor-pointer"
            }`}
          >
            {isUploading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/80">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  {t("imageUploading", "Uploading...")}
                </span>
              </div>
            )}
            {previewLoaded && resource.resourceUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resource.resourceUrl}
                  alt={resource.resourceTitle || "preview"}
                  className="h-full w-full object-contain"
                />
                {!isUploading && (
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#D7D7D7] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <Upload
                      className="h-6 w-6"
                      style={{
                        color: "var(--base-muted-foreground, #737373)",
                      }}
                    />
                    <span
                      className="text-sm"
                      style={{
                        color: "var(--base-muted-foreground, #737373)",
                      }}
                    >
                      {t(
                        "imageUploadPlaceholder",
                        "Drag files or click to upload"
                      )}
                    </span>
                  </div>
                )}
              </>
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
              disabled={isUploading}
              onChange={onFileInputChange}
            />
          </label>
          {uploadStatus === "success" && (
            <p className="text-xs text-muted-foreground">
              {t("imageUploadSuccess", "Upload complete")}
            </p>
          )}
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
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isUploading}
          >
            {t("imageCancelButton", "Cancel")}
          </Button>
          <Button
            className="h-8"
            onClick={handleSelect}
            disabled={!resource?.resourceUrl || isUploading}
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
