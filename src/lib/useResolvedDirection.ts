import { useCallback, useLayoutEffect, useState, type RefObject } from "react";

/** Observe the host's effective direction for keyboard and detached UI surfaces. */
export const useResolvedDirection = (
  hostRef: RefObject<HTMLElement | null>,
  direction?: string
) => {
  const [resolvedDirection, setResolvedDirection] = useState<"ltr" | "rtl">(
    direction === "rtl" ? "rtl" : "ltr"
  );
  const readDirection = useCallback(() => {
    const root = hostRef.current;
    return root?.ownerDocument.defaultView?.getComputedStyle(root).direction ===
      "rtl"
      ? "rtl"
      : "ltr";
  }, [hostRef]);

  useLayoutEffect(() => {
    const root = hostRef.current;
    const view = root?.ownerDocument.defaultView;
    if (!root || !view) return;
    let autoHost: Element | null = null;
    const textObserver = new view.MutationObserver(() => updateDirection());
    const updateDirection = () => {
      setResolvedDirection(readDirection());
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
  }, [hostRef, direction, readDirection]);

  return { resolvedDirection, readDirection };
};
