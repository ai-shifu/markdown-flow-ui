import { memo, useEffect } from "react";
import { RotateCw } from "lucide-react";

import { cn } from "../../lib/utils";
import { DEFAULT_FULLSCREEN_HINT_DURATION_MS } from "./constants";

export type SlideFullscreenHintProps = {
  open: boolean;
  text: string;
  duration?: number;
  className?: string;
  onClose: () => void;
};

const SlideFullscreenHint = memo(
  ({
    open,
    text,
    duration = DEFAULT_FULLSCREEN_HINT_DURATION_MS,
    className,
    onClose,
  }: SlideFullscreenHintProps) => {
    useEffect(() => {
      if (!open) {
        return;
      }

      // Auto-dismiss the fullscreen hint after a short delay.
      const timeoutId = window.setTimeout(() => {
        onClose();
      }, duration);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }, [duration, onClose, open]);

    if (!open) {
      return null;
    }

    return (
      <div
        aria-live="polite"
        className={cn(
          "pointer-events-none absolute inset-0 z-[75] flex items-center justify-center bg-foreground/80 px-6 backdrop-blur-[2px]",
          className
        )}
        role="status"
      >
        <div className="flex max-w-[320px] flex-col items-center gap-6 text-center text-background">
          <RotateCw className="h-12 w-12" strokeWidth={2.25} />
          <p className="text-[clamp(22px,4vw,30px)] font-semibold leading-tight">
            {text}
          </p>
        </div>
      </div>
    );
  }
);

SlideFullscreenHint.displayName = "SlideFullscreenHint";

export default SlideFullscreenHint;
