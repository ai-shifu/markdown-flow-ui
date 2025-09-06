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
      <div
        className="mermaid-error-container"
        style={{
          margin: "1rem 0",
          border: "2px solid #ef4444", // 标红边框
          borderRadius: "8px",
          backgroundColor: "#fef2f2", // 淡红色背景
          position: "relative",
        }}
      >
        {/* 错误提示头部 */}
        <div
          style={{
            padding: "0.75rem 1rem",
            backgroundColor: "#ef4444",
            color: "white",
            fontSize: "0.875rem",
            fontWeight: "500",
            borderRadius: "6px 6px 0 0",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            whiteSpace: "pre-wrap",
          }}
        >
          <span>⚠️</span>
          {error}
        </div>

        {/* 代码展示区域 */}
        <div style={{ position: "relative" }}>
          <pre
            style={{
              padding: "1rem",
              backgroundColor: "#fff1f2",
              fontSize: "0.875rem",
              overflow: "auto",
              fontFamily:
                'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Menlo", monospace',
              margin: 0,
              borderRadius: "0 0 6px 6px",
              color: "#991b1b",
            }}
          >
            <code>{chart}</code>
          </pre>
          <div
            style={{
              position: "absolute",
              top: "0.5rem",
              right: "0.5rem",
              fontSize: "0.75rem",
              color: "#ef4444",
              backgroundColor: "rgba(255,255,255,0.9)",
              padding: "0.25rem 0.5rem",
              borderRadius: "3px",
              border: "1px solid #ef4444",
              fontWeight: "500",
            }}
          >
            mermaid
          </div>
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
