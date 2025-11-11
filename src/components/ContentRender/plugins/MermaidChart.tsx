import React, { useEffect, useState } from "react";
import mermaid from "mermaid";

export interface MermaidChartProps {
  chart: string;
  messages?: {
    emptyChart?: string;
    loading?: string;
    badge?: string;
  };
}

const DEFAULT_MESSAGES = {
  emptyChart: "Empty chart content",
  loading: "Loading Mermaid chart...",
  badge: "mermaid",
} as const;

const MERMAID_FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif';

const MermaidChart: React.FC<MermaidChartProps> = ({ chart, messages }) => {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const renderChart = async () => {
      try {
        const trimmed = chart.trim();

        if (!trimmed) {
          setError(messages?.emptyChart ?? DEFAULT_MESSAGES.emptyChart);
          setSvg("");
          return;
        }

        // Initialize mermaid with the same font stack used in markdown content.
        // Using a concrete stack avoids clipping caused by `inherit` resolving to
        // Storybook's default font during off-screen rendering.
        mermaid.initialize({
          startOnLoad: false,
          theme: "default",
          securityLevel: "loose",
          fontFamily: MERMAID_FONT_STACK,
          themeVariables: {
            fontFamily: MERMAID_FONT_STACK,
          },
        });

        // use mermaid.parse to check for errors
        try {
          await mermaid.parse(trimmed);
        } catch (parseErr) {
          const parseErrorMsg = String(parseErr).toLowerCase();
          setError(parseErrorMsg);
          setSvg("");
          return;
        }

        const id = `mermaid-${Date.now()}`;

        // Render the chart
        const { svg: renderedSvg } = await mermaid.render(id, trimmed);
        setSvg(renderedSvg);
        setError("");
      } catch (err) {
        const errorMsg = String(err).toLowerCase();
        setError(errorMsg);
        setSvg("");
      }
    };

    renderChart();
  }, [chart]);

  if (error) {
    return (
      <div className="my-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="px-4 py-3 bg-gray-100 border-b border-gray-200 flex items-center gap-2">
          <span className="text-yellow-600">⚠️</span>
          <span className="text-sm text-yellow-700 font-medium whitespace-pre-wrap">
            {error}
          </span>
        </div>
        <div className="relative">
          <pre className="p-4 text-sm font-mono text-yellow-800">
            <code>{chart}</code>
          </pre>
          <div className="absolute top-2 right-2 px-2 py-1 text-xs text-yellow-700 bg-white/90 rounded border border-gray-200">
            {messages?.badge ?? DEFAULT_MESSAGES.badge}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-4 text-center overflow-auto">
      {svg ? (
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="py-8 text-gray-500 italic">
          {messages?.loading ?? DEFAULT_MESSAGES.loading}
        </div>
      )}
    </div>
  );
};

export default MermaidChart;
