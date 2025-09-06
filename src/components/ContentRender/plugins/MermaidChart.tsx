import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface MermaidChartProps {
  chart: string;
}

const MermaidChart: React.FC<MermaidChartProps> = ({ chart }) => {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderChart = async () => {
      try {
        const trimmed = chart.trim();

        if (!trimmed) {
          setError("Empty chart content");
          setSvg("");
          return;
        }

        // Initialize mermaid
        mermaid.initialize({
          startOnLoad: false,
          theme: "default",
          securityLevel: "loose",
          fontFamily: "inherit",
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

        // Generate unique ID for this chart
        const id = `mermaid-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;

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
            mermaid
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={elementRef} className="my-4 text-center overflow-auto">
      {svg ? (
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="py-8 text-gray-500 italic">
          Loading Mermaid chart...
        </div>
      )}
    </div>
  );
};

export default MermaidChart;
