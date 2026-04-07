import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "../../lib/utils";
import { Dialog, DialogOverlay, DialogPortal, DialogTitle } from "../ui/dialog";

export type MobilePlayerSettingsSheetLabels = {
  title: string;
  screen: string;
  portrait: string;
  landscape: string;
};

export type MobilePlayerSettingsSheetProps = {
  open: boolean;
  labels: MobilePlayerSettingsSheetLabels;
  isFullscreen: boolean;
  onClose: () => void;
  onOpenChange: (open: boolean) => void;
  onScreenModeChange: (nextIsFullscreen: boolean) => void;
};

const MobilePlayerSettingsSheet = ({
  open,
  labels,
  isFullscreen,
  onClose,
  onOpenChange,
  onScreenModeChange,
}: MobilePlayerSettingsSheetProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="z-[60] bg-black/35 sm:hidden" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            "fixed inset-x-0 bottom-0 z-[61] flex max-h-[min(360px,calc(100dvh-32px))] flex-col overflow-hidden rounded-t-[24px] border-t border-border bg-background shadow-[0_-12px_32px_rgba(28,44,64,0.16)] outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:slide-in-from-bottom-full data-[state=closed]:slide-out-to-bottom-full",
            "sm:hidden"
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
              aria-label="Screen orientation"
              className="flex items-center gap-8"
              role="radiogroup"
            >
              <button
                aria-checked={!isFullscreen}
                className={cn(
                  "border-none bg-transparent p-0 text-[15px] leading-5 text-foreground/70 transition-colors",
                  !isFullscreen && "font-semibold text-primary"
                )}
                onClick={() => onScreenModeChange(false)}
                role="radio"
                type="button"
              >
                {labels.portrait}
              </button>
              <button
                aria-checked={isFullscreen}
                className={cn(
                  "border-none bg-transparent p-0 text-[15px] leading-5 text-foreground/70 transition-colors",
                  isFullscreen && "font-semibold text-primary"
                )}
                onClick={() => onScreenModeChange(true)}
                role="radio"
                type="button"
              >
                {labels.landscape}
              </button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};

export default MobilePlayerSettingsSheet;
