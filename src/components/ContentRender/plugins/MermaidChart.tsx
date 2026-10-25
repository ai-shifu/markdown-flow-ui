import React, { useEffect, useState } from "react";
import mermaid, { type ParseResult } from "mermaid";
import { CJK_SAFE_SANS_FONT_FAMILY } from "../cjkFontFamily";

export interface MermaidChartProps {
  chart: string;
  messages?: {
    emptyChart?: string;
    loading?: string;
    error?: string;
    badge?: string;
  };
  frozen?: boolean;
}

const DEFAULT_MESSAGES = {
  emptyChart: "Empty chart content",
  loading: "Loading Mermaid chart...",
  error: "Unable to display the Mermaid chart",
  badge: "mermaid",
} as const;

const preprocessChart = (raw: string) =>
  raw.trim().replace(/^_streaming\s*/i, "");

let renderSequence = 0;

const createMeasurementContainer = (parsed: ParseResult | false) => {
  const container = document.createElement("div");
  container.className = "content-render-mermaid-measurement";
  let width = document.documentElement.clientWidth || window.innerWidth;
  if (parsed && parsed.diagramType === "xychart") {
    // XY charts measure text after setting their fixed SVG viewBox. Keep that
    // SVG at its natural size while measuring, even on a narrow screen.
    width = Math.max(
      width,
      parsed.config.xyChart?.width ??
        mermaid.mermaidAPI.defaultConfig.xyChart!.width!
    );
  }
  Object.assign(container.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: `${width}px`,
    display: "block",
    visibility: "hidden",
    pointerEvents: "none",
    margin: "0",
    padding: "0",
    border: "0",
    transformOrigin: "0 0",
  });
  container.setAttribute("aria-hidden", "true");
  document.body.appendChild(container);

  // Mermaid uses screen-space getBoundingClientRect values as SVG units.
  // Cancel inherited scaling locally without changing the consumer's body.
  const probe = document.createElement("div");
  Object.assign(probe.style, {
    width: "100px",
    height: "100px",
    padding: "0",
    border: "0",
    margin: "0",
    boxSizing: "border-box",
  });
  container.appendChild(probe);
  const bounds = probe.getBoundingClientRect();
  if (bounds.width > 0 && bounds.height > 0) {
    container.style.transform = `scale(${100 / bounds.width}, ${100 / bounds.height})`;
  }
  probe.remove();
  return container;
};

const fitXYViewBox = (svg: string, container: HTMLElement) => {
  container.innerHTML = svg;
  const element = container.querySelector("svg");
  if (!element?.hasAttribute("viewBox")) return svg;
  const viewBox = element.viewBox.baseVal;
  const screenToSvg = element.getScreenCTM()?.inverse();
  if (!screenToSvg) return svg;
  // Some fonts extend above the top tick's middle-aligned baseline. Include
  // their actual glyph bounds instead of clipping them to the fixed XY canvas.
  let left = viewBox.x;
  let top = viewBox.y;
  let right = viewBox.x + viewBox.width;
  let bottom = viewBox.y + viewBox.height;
  const labels = element.querySelectorAll<SVGGraphicsElement>(
    ".left-axis .label, .right-axis .label, .top-axis .label, .bottom-axis .label"
  );
  for (const label of labels) {
    const transform = label.getScreenCTM();
    if (!transform) continue;
    const matrix = screenToSvg.multiply(transform);
    const bounds = label.getBBox();
    for (const x of [bounds.x, bounds.x + bounds.width]) {
      for (const y of [bounds.y, bounds.y + bounds.height]) {
        const point = new DOMPoint(x, y).matrixTransform(matrix);
        if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) continue;
        left = Math.min(left, Math.floor(point.x));
        top = Math.min(top, Math.floor(point.y));
        right = Math.max(right, Math.ceil(point.x));
        bottom = Math.max(bottom, Math.ceil(point.y));
      }
    }
  }
  if (
    left === viewBox.x &&
    top === viewBox.y &&
    right === viewBox.x + viewBox.width &&
    bottom === viewBox.y + viewBox.height
  ) {
    return svg;
  }
  element.setAttribute(
    "viewBox",
    `${left} ${top} ${right - left} ${bottom - top}`
  );
  return element.outerHTML;
};

const MermaidChart: React.FC<MermaidChartProps> = ({
  chart,
  messages,
  frozen,
}) => {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  const [hasRendered, setHasRendered] = useState(false);

  const renderChart = async () => {
    try {
      const cleaned = preprocessChart(chart);

      if (!cleaned) {
        setError("");
        setSvg("");
        return;
      }

      // Initialize Mermaid with an explicit CJK-safe font stack.
      // Using a concrete stack avoids clipping caused by `inherit` resolving to
      // Storybook's default font during off-screen rendering.
      mermaid.initialize({
        startOnLoad: false,
        theme: "default",
        securityLevel: "loose",
        fontFamily: CJK_SAFE_SANS_FONT_FAMILY,
        themeVariables: {
          fontFamily: CJK_SAFE_SANS_FONT_FAMILY,
        },
      });

      // use mermaid.parse to check for errors
      let parsed: ParseResult | false;
      try {
        parsed = await mermaid.parse(cleaned);
      } catch (parseErr) {
        const parseErrorMsg = String(parseErr).toLowerCase();
        setError(parseErrorMsg);
        setSvg("");
        // once render success, setHasRendered flag
        setHasRendered(true);
        return;
      }

      const id = `mermaid-${Date.now()}-${++renderSequence}`;

      const container = createMeasurementContainer(parsed);
      try {
        const { svg: renderedSvg } = await mermaid.render(
          id,
          cleaned,
          container
        );
        let displaySvg = renderedSvg;
        if (parsed && parsed.diagramType === "xychart") {
          try {
            displaySvg = fitXYViewBox(renderedSvg, container);
          } catch {
            // Geometry fitting is optional; preserve a successful diagram if
            // the browser cannot measure its glyphs.
            displaySvg = renderedSvg;
          }
        }
        setSvg(displaySvg);
        setError("");
      } finally {
        container.remove();
      }
    } catch (err) {
      const errorMsg = String(err).toLowerCase();
      setError(errorMsg);
      setSvg("");
    }
  };

  useEffect(() => {
    if (frozen && hasRendered) return; // 核心：被冻结就不渲染
    renderChart();
  }, [chart, frozen]);

  const cleanedChart = preprocessChart(chart);
  if (error || !cleanedChart) {
    const displayChart = cleanedChart || chart.trim();
    return (
      <div
        className="my-4 border border-gray-200 rounded-lg bg-gray-50"
        data-mermaid-error={error || undefined}
      >
        <div className="px-4 py-3 bg-gray-100 border-b border-gray-200 flex items-center gap-2">
          <span className="text-yellow-600">⚠️</span>
          <span
            dir="auto"
            className="text-sm text-yellow-700 font-medium whitespace-pre-wrap"
          >
            {cleanedChart
              ? (messages?.error ?? DEFAULT_MESSAGES.error)
              : (messages?.emptyChart ?? DEFAULT_MESSAGES.emptyChart)}
          </span>
        </div>
        <div className="relative">
          <pre
            dir="ltr"
            className="p-4 text-sm font-mono text-yellow-800 text-start [unicode-bidi:isolate]"
          >
            <code>{displayChart}</code>
          </pre>
          <div className="absolute top-2 right-2 px-2 py-1 text-xs text-yellow-700 bg-white/90 rounded border border-gray-200">
            {messages?.badge ?? DEFAULT_MESSAGES.badge}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-4 text-center overflow-auto content-render-mermaid">
      {svg ? (
        <div
          className="content-render-mermaid-inner"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="py-8 text-gray-500 italic">
          {messages?.loading ?? DEFAULT_MESSAGES.loading}
        </div>
      )}
    </div>
  );
};

export default React.memo(MermaidChart, (prev, next) => {
  return (
    prev.chart === next.chart &&
    prev.frozen === next.frozen &&
    prev.messages?.emptyChart === next.messages?.emptyChart &&
    prev.messages?.loading === next.messages?.loading &&
    prev.messages?.error === next.messages?.error &&
    prev.messages?.badge === next.messages?.badge
  );
});
