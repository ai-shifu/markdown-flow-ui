import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

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

const biliVideoUrlRegexp =
  /(https?:\/\/(?:www\.|m\.)?bilibili\.com\/video\/\S+\/?)/i;

const VideoInject: React.FC<VideoInjectProps> = ({ value, onSelect }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState(
    value?.resourceTitle || t("videoDefaultTitle", "Video Title")
  );
  const [inputUrl, setInputUrl] = useState<string>(value?.resourceUrl || "");
  const [embedUrl, setEmbedUrl] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastUrlRef = useRef("");
  const [errorTips, setErrorTips] = useState("");

  const isValidBilibiliUrl = (url: string) => {
    return biliVideoUrlRegexp.test(url);
  };

  const generateEmbedUrl = (url: string) => {
    const encoded = encodeURIComponent(url);
    return `https://if-cdn.com/api/iframe?url=${encoded}&key=a68bac8b6624d46b6d0ba46e5b3f8971`;
  };

  const handleRun = () => {
    setErrorTips("");
    if (!isValidBilibiliUrl(inputUrl)) {
      setErrorTips(
        t("videoInvalidUrl", "Please enter a valid Bilibili video URL")
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
    if (inputUrl) {
      try {
        const returnUrlObj = new URL(inputUrl);
        onSelect({
          resourceUrl: returnUrlObj.origin + returnUrlObj.pathname,
          resourceTitle: title,
        });
      } catch (error) {
        console.log("error", error);
        onSelect({ resourceUrl: inputUrl, resourceTitle: title });
      }
    }
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
    <div>
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value?.trim())}
          placeholder={t(
            "videoUrlPlaceholder",
            "Please enter Bilibili video URL"
          )}
          autoComplete="off"
        />
        <Button
          className="h-8"
          variant="outline"
          type="button"
          onClick={handleRun}
        >
          {t("videoRunButton", "Run")}
        </Button>
        {embedUrl && (
          <Button
            className="h-8"
            variant="outline"
            type="button"
            onClick={handleSelect}
          >
            {t("videoUseButton", "Use Resource")}
          </Button>
        )}
      </div>
      {!!errorTips && <div>{errorTips}</div>}

      {embedUrl && (
        <div className="space-y-4">
          <Input
            value={title}
            aria-placeholder={t(
              "videoTitlePlaceholder",
              "Please enter video title"
            )}
            onChange={(e) => setTitle(e.target.value.slice(0, 100))}
            placeholder={t("videoTitlePlaceholder", "Video Title")}
            className="mt-4"
            maxLength={100}
          />
          <iframe
            ref={iframeRef}
            title="bilibili-video"
            className="w-full aspect-video rounded-lg border-0"
            src={embedUrl}
            allowFullScreen
            allow="autoplay; encrypted-media"
          />
        </div>
      )}
    </div>
  );
};
export { biliVideoUrlRegexp };
export default VideoInject;
