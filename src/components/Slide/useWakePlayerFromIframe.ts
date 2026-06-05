import { useEffect, useRef } from "react";

import {
  getPlayerKeyboardShortcutAction,
  shouldIgnorePlayerKeyboardShortcutEvent,
} from "./utils/playerKeyboardShortcuts";

type UseWakePlayerFromIframeParams = {
  sectionRef: React.RefObject<HTMLElement | null>;
  enabled: boolean;
  keyboardShortcutsEnabled?: boolean;
  onWake: () => void;
};

const useWakePlayerFromIframe = ({
  sectionRef,
  enabled,
  keyboardShortcutsEnabled = true,
  onWake,
}: UseWakePlayerFromIframeParams) => {
  const enabledRef = useRef(enabled);
  const keyboardShortcutsEnabledRef = useRef(keyboardShortcutsEnabled);
  const onWakeRef = useRef(onWake);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    keyboardShortcutsEnabledRef.current = keyboardShortcutsEnabled;
  }, [keyboardShortcutsEnabled]);

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

      const handleIframeDocumentKeyDown = (event: KeyboardEvent) => {
        if (!enabledRef.current || !keyboardShortcutsEnabledRef.current) {
          return;
        }

        const action = getPlayerKeyboardShortcutAction(event);

        if (shouldIgnorePlayerKeyboardShortcutEvent(event, action)) {
          return;
        }

        restorePlayerControls();

        const hostWindow = sectionElement.ownerDocument.defaultView;

        if (!hostWindow) {
          return;
        }

        const hostKeyboardEvent = new hostWindow.KeyboardEvent("keydown", {
          altKey: event.altKey,
          bubbles: true,
          cancelable: true,
          code: event.code,
          composed: true,
          ctrlKey: event.ctrlKey,
          key: event.key,
          location: event.location,
          metaKey: event.metaKey,
          repeat: event.repeat,
          shiftKey: event.shiftKey,
        });

        sectionElement.ownerDocument.dispatchEvent(hostKeyboardEvent);

        if (hostKeyboardEvent.defaultPrevented) {
          event.preventDefault();
        }
      };

      iframeDocument.addEventListener(
        "click",
        handleIframeDocumentInteraction,
        true
      );
      iframeDocument.addEventListener("keydown", handleIframeDocumentKeyDown);

      cleanupMap.set(iframeElement, {
        cleanup: () => {
          iframeDocument.removeEventListener(
            "click",
            handleIframeDocumentInteraction,
            true
          );
          iframeDocument.removeEventListener(
            "keydown",
            handleIframeDocumentKeyDown
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
