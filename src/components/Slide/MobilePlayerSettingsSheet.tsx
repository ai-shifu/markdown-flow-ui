import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "../../lib/utils";
import { Dialog, DialogOverlay, DialogPortal, DialogTitle } from "../ui/dialog";
import type { MobileViewMode } from "./utils/mobileScreenMode";

export type MobilePlayerSettingsSheetLabels = {
  title: string;
  screen: string;
  nonFullscreen: string;
  fullscreen: string;
};

export type MobilePlayerSettingsSheetProps = {
  open: boolean;
  labels: MobilePlayerSettingsSheetLabels;
  viewMode: MobileViewMode;
  container?: HTMLElement | null;
  onClose: () => void;
  onOpenChange: (open: boolean) => void;
  onViewModeChange: (nextViewMode: MobileViewMode) => void;
};

const MobilePlayerSettingsSheet = ({
  open,
  labels,
  viewMode,
  container,
  onClose,
  onOpenChange,
  onViewModeChange,
}: MobilePlayerSettingsSheetProps) => {
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
          <div className="flex min-h-14 items-center justify-between border-b border-border px-6">
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

          <div className="flex min-h-[72px] items-center gap-6 px-6">
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
