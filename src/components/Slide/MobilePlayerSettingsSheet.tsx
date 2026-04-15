import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "../../lib/utils";
import { Dialog, DialogOverlay, DialogPortal, DialogTitle } from "../ui/dialog";
import type { MobileViewMode } from "./utils/mobileScreenMode";

export type MobilePlayerSettingsSheetLabels = {
  title: string;
  subtitle: string;
  subtitleToggle: string;
  screen: string;
  nonFullscreen: string;
  fullscreen: string;
};

export type MobilePlayerSettingsSheetProps = {
  open: boolean;
  labels: MobilePlayerSettingsSheetLabels;
  isSubtitleEnabled: boolean;
  viewMode: MobileViewMode;
  container?: HTMLElement | null;
  onClose: () => void;
  onOpenChange: (open: boolean) => void;
  onSubtitleToggle: () => void;
  onViewModeChange: (nextViewMode: MobileViewMode) => void;
};

const MobilePlayerSettingsSheet = ({
  open,
  labels,
  isSubtitleEnabled,
  viewMode,
  container,
  onClose,
  onOpenChange,
  onSubtitleToggle,
  onViewModeChange,
}: MobilePlayerSettingsSheetProps) => {
  const insetDividerClassName =
    "after:pointer-events-none after:absolute after:bottom-0 after:left-4 after:right-4 after:border-b after:border-border after:content-['']";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal container={container}>
        <DialogOverlay className="z-[60] bg-black/35" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            "fixed inset-x-0 bottom-0 z-[61] flex max-h-[min(360px,calc(100dvh-32px))] flex-col overflow-hidden rounded-t-[24px] border-t border-border bg-background shadow-[0_-12px_32px_rgba(28,44,64,0.16)] outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:slide-in-from-bottom-full data-[state=closed]:slide-out-to-bottom-full"
          )}
        >
          <div className="flex min-h-14 items-center justify-between border-b border-border px-4">
            <DialogTitle className="text-[15px] font-semibold leading-5 text-foreground">
              {labels.title}
            </DialogTitle>
            <button
              aria-label="Close settings"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border-none bg-transparent p-0 text-foreground/70 transition-colors hover:text-foreground"
              onClick={onClose}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div
            className={cn(
              "relative flex min-h-[72px] items-center justify-between gap-6 px-4",
              insetDividerClassName
            )}
          >
            <span className="shrink-0 text-[15px] font-semibold leading-5 text-foreground">
              {labels.subtitle}
            </span>

            <button
              aria-label={labels.subtitleToggle}
              aria-pressed={isSubtitleEnabled}
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center p-0"
              onClick={onSubtitleToggle}
              type="button"
            >
              <span
                className={cn(
                  "relative block h-4 w-6 rounded-full border-2 border-foreground transition-colors",
                  isSubtitleEnabled && "border-primary"
                )}
              >
                <span
                  className={cn(
                    "absolute left-[2px] top-1/2 block h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-foreground transition-transform",
                    isSubtitleEnabled
                      ? "translate-x-[10px] bg-primary"
                      : "translate-x-0"
                  )}
                />
              </span>
            </button>
          </div>

          <div className="flex min-h-[72px] items-center gap-6 px-4">
            <span className="shrink-0 text-[15px] font-semibold leading-5 text-foreground">
              {labels.screen}
            </span>
            <div
              aria-label="Screen mode"
              className="flex items-center gap-8"
              role="radiogroup"
            >
              <button
                aria-checked={viewMode === "nonFullscreen"}
                className={cn(
                  "border-none bg-transparent p-0 text-[15px] leading-5 text-foreground/70 transition-colors",
                  viewMode === "nonFullscreen" && "font-semibold text-primary"
                )}
                onClick={() => onViewModeChange("nonFullscreen")}
                role="radio"
                type="button"
              >
                {labels.nonFullscreen}
              </button>
              <button
                aria-checked={viewMode === "fullscreen"}
                className={cn(
                  "border-none bg-transparent p-0 text-[15px] leading-5 text-foreground/70 transition-colors",
                  viewMode === "fullscreen" && "font-semibold text-primary"
                )}
                onClick={() => onViewModeChange("fullscreen")}
                role="radio"
                type="button"
              >
                {labels.fullscreen}
              </button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};

export default MobilePlayerSettingsSheet;
