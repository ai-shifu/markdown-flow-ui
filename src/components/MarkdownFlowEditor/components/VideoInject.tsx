import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useTranslation } from "react-i18next";
import EditorContext from "../editor-context";
import {
  biliVideoUrlRegexp,
  youtubeVideoUrlRegexp,
  getVideoEmbedUrl,
} from "../utils/video";

type VideoInjectProps = {
  value?: {
    resourceTitle?: string;
    resourceUrl?: string;
  };
  onSelect: ({
    resourceUrl,
    resourceTitle,
  }: {
    resourceUrl: string;
    resourceTitle: string;
  }) => void;
};

const VideoInject: React.FC<VideoInjectProps> = ({ value, onSelect }) => {
  const { t } = useTranslation();
  const { setDialogOpen } = useContext(EditorContext);
  const [title, setTitle] = useState(value?.resourceTitle || "");
  const [inputUrl, setInputUrl] = useState<string>(value?.resourceUrl || "");
  const [embedUrl, setEmbedUrl] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastUrlRef = useRef("");
  const [errorTips, setErrorTips] = useState("");

  const isValidVideoUrl = useCallback((url: string) => {
    return biliVideoUrlRegexp.test(url) || youtubeVideoUrlRegexp.test(url);
  }, []);

  const generateEmbedUrl = useCallback((url: string) => {
    return getVideoEmbedUrl(url);
  }, []);

  const getDefaultTitleForUrl = useCallback(
    (url: string) => {
      if (biliVideoUrlRegexp.test(url)) {
        return t("videoDefaultTitleBilibili");
      }
      if (youtubeVideoUrlRegexp.test(url)) {
        return t("videoDefaultTitleYoutube");
      }
      return t("videoDefaultTitle", "Video Title");
    },
    [t]
  );

  const handleRun = () => {
    setErrorTips("");
    if (!isValidVideoUrl(inputUrl)) {
      setErrorTips(
        t(
          "videoInvalidUrl",
          "Please enter a valid Bilibili or YouTube video URL"
        )
      );
      return;
    }

    const newEmbedUrl = generateEmbedUrl(inputUrl);

    if (lastUrlRef.current === newEmbedUrl) {
      checkVideoPlayback();
      return;
    }

    setEmbedUrl(newEmbedUrl);
    lastUrlRef.current = newEmbedUrl;
  };

  const handleSelect = () => {
    if (!embedUrl) {
      return;
    }

    const finalTitle = title.trim() || getDefaultTitleForUrl(inputUrl);

    try {
      const normalizedUrl = new URL(inputUrl).toString();
      onSelect({
        resourceUrl: normalizedUrl,
        resourceTitle: finalTitle,
      });
    } catch (error) {
      console.log("error", error);
      onSelect({ resourceUrl: inputUrl, resourceTitle: finalTitle });
    }
    setDialogOpen(false);
  };

  const handleCancel = () => {
    setDialogOpen(false);
  };

  const checkVideoPlayback = () => {
    if (!iframeRef.current) return;
  };

  useEffect(() => {
    if (embedUrl) {
      setTimeout(checkVideoPlayback, 2000);
    }
  }, [embedUrl]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {t("videoUrlLabel", "URL")}
        </label>
        <div className="flex gap-2">
          <Input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value?.trim())}
            placeholder={t(
              "videoUrlPlaceholder",
              "Please enter Bilibili or YouTube video URL"
            )}
            autoComplete="off"
          />
          <Button
            className="h-8"
            variant="outline"
            type="button"
            onClick={handleRun}
          >
            {t("videoRunButton", "Preview")}
          </Button>
        </div>
        {!!errorTips && <p className="text-xs text-destructive">{errorTips}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {t("videoTitleLabel", "Title")}
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 100))}
          placeholder={t("videoTitlePlaceholder", "Video Title")}
          maxLength={100}
        />
      </div>

      <div
        className={`aspect-video overflow-hidden rounded-lg border border-muted ${
          embedUrl ? "" : "bg-black text-white flex items-center justify-center"
        }`}
      >
        {embedUrl ? (
          <iframe
            ref={iframeRef}
            title="video-preview"
            className="w-full h-full border-0"
            src={embedUrl}
            allowFullScreen
            allow="autoplay; encrypted-media"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-sm">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 text-lg">
              ▶
            </span>
            <span className="text-xs text-white/70">
              {t("videoPreviewPlaceholder", "Preview will appear here")}
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={handleCancel}>
          {t("videoCancelButton", "Cancel")}
        </Button>
        <Button type="button" onClick={handleSelect} disabled={!embedUrl}>
          {t("videoUseVideoButton", "Use Video")}
        </Button>
      </div>
    </div>
  );
};
export default VideoInject;
