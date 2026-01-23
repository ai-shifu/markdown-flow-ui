import React, { useEffect, useRef, useState } from "react";

export interface SandboxAppProps {
  html: string;
  loadingText?: string;
}

const SandboxApp: React.FC<SandboxAppProps> = ({ html, loadingText }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isWaitingFirstDiv, setIsWaitingFirstDiv] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;

    // Ensure inline scripts execute by recreating them after injection
    wrapper.querySelectorAll("script").forEach((script) => {
      const replacement = document.createElement("script");
      Array.from(script.attributes).forEach((attr) => {
        replacement.setAttribute(attr.name, attr.value);
      });
      replacement.textContent = script.textContent;
      script.replaceWith(replacement);
    });

    const hasFirstDiv = !!wrapper.querySelector("div");
    setIsWaitingFirstDiv(!hasFirstDiv);

    container.append(...Array.from(wrapper.childNodes));
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
