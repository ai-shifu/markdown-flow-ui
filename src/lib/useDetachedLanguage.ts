import { useEffect, useState, type RefObject } from "react";

/** Carry the host language across portal and iframe DOM boundaries. */
export const useDetachedLanguage = (
  hostRef: RefObject<HTMLElement | null>,
  language?: string
) => {
  const [inheritedLanguage, setInheritedLanguage] = useState<string>();
  useEffect(() => {
    const host = hostRef.current;
    if (language !== undefined || !host) return;
    const updateLanguage = () => {
      setInheritedLanguage(
        host.closest("[lang]")?.getAttribute("lang") ?? undefined
      );
    };
    updateLanguage();
    const observer = new MutationObserver(updateLanguage);
    for (
      let ancestor: HTMLElement | null = host;
      ancestor;
      ancestor = ancestor.parentElement
    ) {
      observer.observe(ancestor, {
        attributes: true,
        attributeFilter: ["lang"],
      });
    }
    return () => observer.disconnect();
  }, [hostRef, language]);
  return language ?? inheritedLanguage;
};
