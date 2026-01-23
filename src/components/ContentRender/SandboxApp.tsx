import React, { useEffect, useRef, useState } from "react";

export interface SandboxAppProps {
  html: string;
  loadingText?: string;
}

const SandboxApp: React.FC<SandboxAppProps> = ({ html, loadingText }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isWaitingFirstDiv, setIsWaitingFirstDiv] = useState(true);
  const appendedStylesRef = useRef<HTMLStyleElement[]>([]);
  const appendedScriptsRef = useRef<HTMLScriptElement[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const doc = container.ownerDocument;
    const body = doc?.body;
    if (!body) return;

    appendedStylesRef.current.forEach((node) => node.remove());
    appendedStylesRef.current = [];
    appendedScriptsRef.current.forEach((node) => node.remove());
    appendedScriptsRef.current = [];

    container.innerHTML = "";
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;

    const openScriptCount = (html.match(/<script[\s>]/gi) || []).length;
    const closeScriptCount = (html.match(/<\/script>/gi) || []).length;
    const shouldExecuteScripts =
      openScriptCount > 0 && openScriptCount === closeScriptCount;

    const resourceQueue: HTMLElement[] = [];

    Array.from(wrapper.querySelectorAll("style, script")).forEach((node) => {
      if (node.tagName.toLowerCase() === "style") {
        const cloned = doc.createElement("style");
        cloned.textContent = node.textContent || "";
        Array.from(node.attributes).forEach((attr) => {
          cloned.setAttribute(attr.name, attr.value);
        });
        resourceQueue.push(cloned);
      } else {
        const replacement = doc.createElement("script");
        Array.from(node.attributes).forEach((attr) => {
          replacement.setAttribute(attr.name, attr.value);
        });
        replacement.textContent = node.textContent || "";
        resourceQueue.push(replacement);
      }
      node.remove();
    });

    const hasFirstElement = !!wrapper.firstElementChild;
    setIsWaitingFirstDiv(!hasFirstElement);

    const contentNodes = Array.from(wrapper.childNodes);
    container.append(...contentNodes);

    resourceQueue.forEach((node) => {
      if (node.tagName.toLowerCase() === "style") {
        doc.head?.appendChild(node);
        appendedStylesRef.current.push(node as HTMLStyleElement);
        return;
      }

      if (shouldExecuteScripts) {
        const scriptNode = node as HTMLScriptElement;
        const scriptText = scriptNode.textContent || "";
        const shouldValidate = !scriptNode.src;

        if (shouldValidate) {
          try {
            // Validate script is syntactically complete before executing

            new Function(scriptText);
          } catch {
            scriptNode.remove();
            return;
          }
        }

        try {
          body.appendChild(scriptNode);
          appendedScriptsRef.current.push(scriptNode);
        } catch {
          scriptNode.remove();
        }
      } else {
        // Defer execution until all script tags are fully received
        node.remove();
      }
    });
  }, [html]);

  return (
    <div style={{ position: "relative", minHeight: 120 }}>
      <div ref={containerRef} />
      {isWaitingFirstDiv && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(180deg, rgba(148,163,184,0.08), rgba(148,163,184,0.02))",
            color: "#475569",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {loadingText || "Loading..."}
        </div>
      )}
    </div>
  );
};

export default SandboxApp;
