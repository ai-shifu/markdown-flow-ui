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
        // Initialize mermaid
        mermaid.initialize({
          startOnLoad: false,
          theme: "default",
          securityLevel: "loose",
          fontFamily: "inherit",
        });

        // Generate unique ID for this chart
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Render the chart
        const { svg: renderedSvg } = await mermaid.render(id, chart);
        setSvg(renderedSvg);
        setError("");
      } catch (err) {
        setError(`Failed to render Mermaid chart: ${err}`);
      }
    };

    if (chart.trim()) {
      renderChart();
    }
  }, [chart]);

  if (error) {
    return (
      <div
        className="mermaid-fallback"
        style={{
          margin: "1rem 0",
          position: "relative",
        }}
      >
        <pre
          style={{
            padding: "1rem",
            backgroundColor: "#f6f8fa",
            border: "1px solid #d1d9e0",
            borderRadius: "6px",
            fontSize: "0.9em",
            overflow: "auto",
            fontFamily:
              'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Menlo", monospace',
            margin: 0,
          }}
        >
          <code>{chart}</code>
        </pre>
        <div
          style={{
            position: "absolute",
            top: "0.5rem",
            right: "0.5rem",
            fontSize: "0.75em",
            color: "#656d76",
            backgroundColor: "#f6f8fa",
            padding: "0.25rem 0.5rem",
            borderRadius: "3px",
            border: "1px solid #d1d9e0",
          }}
        >
          mermaid
        </div>
      </div>
    );
  }

  return (
    <div
      ref={elementRef}
      className="mermaid-chart-container"
      style={{
        margin: "1rem 0",
        textAlign: "center",
        overflow: "auto",
      }}
    >
      {svg ? (
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div
          style={{
            padding: "2rem",
            color: "#666",
            fontStyle: "italic",
          }}
        >
          Loading Mermaid chart...
        </div>
      )}
    </div>
  );
};

export default MermaidChart;
