import React, { useEffect, useState } from "react";
import mermaid from "mermaid";
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
      try {
        await mermaid.parse(cleaned);
      } catch (parseErr) {
        const parseErrorMsg = String(parseErr).toLowerCase();
        setError(parseErrorMsg);
        setSvg("");
        // once render success, setHasRendered flag
        setHasRendered(true);
        return;
      }

      const id = `mermaid-${Date.now()}`;

      // Render the chart
      const { svg: renderedSvg } = await mermaid.render(id, cleaned);
      setSvg(renderedSvg);
      setError("");
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
