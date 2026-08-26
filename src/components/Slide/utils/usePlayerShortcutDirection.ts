import { useCallback, useLayoutEffect, useState, type RefObject } from "react";

/** Keep keyboard navigation aligned with the player containing the audio element. */
export const usePlayerShortcutDirection = (
  audioRef: RefObject<HTMLAudioElement | null>,
  direction?: string
) => {
  const [shortcutDirection, setShortcutDirection] = useState<"ltr" | "rtl">(
    direction === "rtl" ? "rtl" : "ltr"
  );
  const readDirection = useCallback(() => {
    const root = audioRef.current?.parentElement;
    return root?.ownerDocument.defaultView?.getComputedStyle(root).direction ===
      "rtl"
      ? "rtl"
      : "ltr";
  }, [audioRef]);

  useLayoutEffect(() => {
    const root = audioRef.current?.parentElement;
    const view = root?.ownerDocument.defaultView;
    if (!root || !view) return;
    let autoHost: Element | null = null;
    const textObserver = new view.MutationObserver(() => updateDirection());
    const updateDirection = () => {
      setShortcutDirection(readDirection());
      const owner = root.closest("[dir]");
      const nextAutoHost =
        owner?.getAttribute("dir")?.toLowerCase() === "auto" ? owner : null;
      if (nextAutoHost === autoHost) return;
      textObserver.disconnect();
      autoHost = nextAutoHost;
      if (autoHost) {
        textObserver.observe(autoHost, {
          childList: true,
          characterData: true,
          subtree: true,
        });
      }
    };
    updateDirection();
    const observer = new view.MutationObserver(updateDirection);
    for (
      let ancestor: HTMLElement | null = root;
      ancestor;
      ancestor = ancestor.parentElement
    ) {
      observer.observe(ancestor, {
        attributes: true,
        attributeFilter: ["dir", "class", "style"],
      });
    }
    view.addEventListener("resize", updateDirection);
    return () => {
      observer.disconnect();
      textObserver.disconnect();
      view.removeEventListener("resize", updateDirection);
    };
  }, [audioRef, direction, readDirection]);

  return { shortcutDirection, readDirection };
};
