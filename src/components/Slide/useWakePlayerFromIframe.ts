import { useEffect, useRef } from "react";

type UseWakePlayerFromIframeParams = {
  sectionRef: React.RefObject<HTMLElement | null>;
  enabled: boolean;
  onWake: () => void;
};

const useWakePlayerFromIframe = ({
  sectionRef,
  enabled,
  onWake,
}: UseWakePlayerFromIframeParams) => {
  const enabledRef = useRef(enabled);
  const onWakeRef = useRef(onWake);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    onWakeRef.current = onWake;
  }, [onWake]);

  useEffect(() => {
    const sectionElement = sectionRef.current;

    if (!sectionElement) {
      return;
    }

    const cleanupMap = new Map<
      HTMLIFrameElement,
      {
        cleanup: () => void;
      }
    >();

    const restorePlayerControls = () => {
      if (!enabledRef.current) {
        return;
      }

      onWakeRef.current();
    };

    const bindIframeDocument = (iframeElement: HTMLIFrameElement) => {
      if (cleanupMap.has(iframeElement)) {
        return;
      }

      const handleLoad = () => {
        cleanupMap.get(iframeElement)?.cleanup();
        cleanupMap.delete(iframeElement);
        bindIframeDocument(iframeElement);
      };

      iframeElement.addEventListener("load", handleLoad);

      const iframeDocument = iframeElement.contentDocument;

      if (!iframeDocument) {
        cleanupMap.set(iframeElement, {
          cleanup: () => {
            iframeElement.removeEventListener("load", handleLoad);
          },
        });
        return;
      }

      const handleIframeDocumentInteraction = () => {
        restorePlayerControls();
      };

      iframeDocument.addEventListener(
        "pointerdown",
        handleIframeDocumentInteraction,
        true
      );
      iframeDocument.addEventListener(
        "mousedown",
        handleIframeDocumentInteraction,
        true
      );
      iframeDocument.addEventListener(
        "touchstart",
        handleIframeDocumentInteraction,
        true
      );

      cleanupMap.set(iframeElement, {
        cleanup: () => {
          iframeDocument.removeEventListener(
            "pointerdown",
            handleIframeDocumentInteraction,
            true
          );
          iframeDocument.removeEventListener(
            "mousedown",
            handleIframeDocumentInteraction,
            true
          );
          iframeDocument.removeEventListener(
            "touchstart",
            handleIframeDocumentInteraction,
            true
          );
          iframeElement.removeEventListener("load", handleLoad);
        },
      });
    };

    const syncIframeBindings = () => {
      const iframeElements = Array.from(
        sectionElement.querySelectorAll<HTMLIFrameElement>(
          "iframe.content-render-iframe"
        )
      );

      iframeElements.forEach(bindIframeDocument);

      cleanupMap.forEach((value, iframeElement) => {
        if (iframeElements.includes(iframeElement)) {
          return;
        }

        value.cleanup();
        cleanupMap.delete(iframeElement);
      });
    };

    const mutationObserver = new MutationObserver(() => {
      syncIframeBindings();
    });

    syncIframeBindings();
    mutationObserver.observe(sectionElement, {
      childList: true,
      subtree: true,
    });

    return () => {
      mutationObserver.disconnect();
      cleanupMap.forEach((value) => value.cleanup());
      cleanupMap.clear();
    };
  }, [sectionRef]);
};

export default useWakePlayerFromIframe;
