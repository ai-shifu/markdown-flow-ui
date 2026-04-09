import React from "react";
import { LoaderCircle } from "lucide-react";

export interface LoadingOverlayCardProps {
  message: string;
  className?: string;
  style?: React.CSSProperties;
}

const loadingOverlayCardStyle: React.CSSProperties = {
  pointerEvents: "none",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  width: "7rem",
  height: "7rem",
  padding: "1rem 0.75rem",
  borderRadius: "1rem",
  backgroundColor: "rgba(23, 23, 23, 0.65)",
  color: "var(--background, #ffffff)",
  fontSize: "0.75rem",
  lineHeight: "1rem",
  fontWeight: 500,
  textAlign: "center",
  boxShadow:
    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
};

const loadingOverlayIconStyle: React.CSSProperties = {
  width: "1.25rem",
  height: "1.25rem",
  animation: "loading-overlay-card-spin 1s linear infinite",
};

const LoadingOverlayCard: React.FC<LoadingOverlayCardProps> = ({
  message,
  className,
  style,
}) => (
  <div
    role="status"
    aria-live="polite"
    className={className}
    style={{ ...loadingOverlayCardStyle, ...style }}
  >
    <style>
      {`
        @keyframes loading-overlay-card-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}
    </style>
    <LoaderCircle aria-hidden style={loadingOverlayIconStyle} />
    <span>{message}</span>
  </div>
);

export default LoadingOverlayCard;
