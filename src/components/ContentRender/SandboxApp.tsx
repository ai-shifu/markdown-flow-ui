import React, { useEffect, useRef } from "react";

export interface SandboxAppProps {
  html: string;
}

const SandboxApp: React.FC<SandboxAppProps> = ({ html }) => {
  const containerRef = useRef<HTMLDivElement>(null);

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

    container.append(...Array.from(wrapper.childNodes));
  }, [html]);

  return <div ref={containerRef} />;
};

export default SandboxApp;
