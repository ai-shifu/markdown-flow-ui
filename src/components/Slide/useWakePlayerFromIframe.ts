import { useEffect, useRef } from "react";

import {
  getPlayerKeyboardShortcutAction,
  shouldIgnorePlayerKeyboardShortcutEvent,
} from "./utils/playerKeyboardShortcuts";

type UseWakePlayerFromIframeParams = {
  sectionRef: React.RefObject<HTMLElement | null>;
  enabled: boolean;
  keyboardShortcutsEnabled?: boolean;
  onKeyboardShortcut?: () => void;
  onWake: () => void;
};

/**
 * Restores player controls when users interact inside slide iframes and forwards supported keyboard shortcuts to the host document.
 *
 * @param params - Hook options.
 * @param params.sectionRef - Section element used to scope iframe wake events and host shortcut dispatch.
 * @param params.enabled - Enables or disables iframe wake handling.
 * @param params.keyboardShortcutsEnabled - Enables or disables iframe keyboard shortcut forwarding. Defaults to true.
 * @param params.onKeyboardShortcut - Callback invoked before iframe keyboard shortcuts are forwarded.
 * @param params.onWake - Callback invoked when iframe interaction should restore player controls.
 * @returns void
 */
const useWakePlayerFromIframe = ({
  sectionRef,
  enabled,
  keyboardShortcutsEnabled = true,
  onKeyboardShortcut,
  onWake,
}: UseWakePlayerFromIframeParams) => {
  const enabledRef = useRef(enabled);
  const keyboardShortcutsEnabledRef = useRef(keyboardShortcutsEnabled);
  const onKeyboardShortcutRef = useRef(onKeyboardShortcut);
  const onWakeRef = useRef(onWake);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    keyboardShortcutsEnabledRef.current = keyboardShortcutsEnabled;
  }, [keyboardShortcutsEnabled]);

  useEffect(() => {
    onKeyboardShortcutRef.current = onKeyboardShortcut;
  }, [onKeyboardShortcut]);

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

        onKeyboardShortcutRef.current?.();

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

        sectionElement.dispatchEvent(hostKeyboardEvent);

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
