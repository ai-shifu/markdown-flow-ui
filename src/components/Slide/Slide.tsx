import React, { useRef } from "react";

import { cn } from "../../lib/utils";
import IframeSandbox from "../ContentRender/IframeSandbox";
import Player from "./Player";
import "./slide.css";

type ElementType =
  | "slot"
  | "html"
  | "svg"
  | "diff"
  | "img"
  | "interaction"
  | "tables"
  | "code"
  | "latex"
  | "md_img"
  | "mermaid"
  | "title"
  | "text"
  | "link"
  | string;

type SlideOperation = "new" | "append" | string;

export interface Element {
  content: React.ReactNode;
  type: ElementType;
  is_show?: boolean;
  operation?: SlideOperation;
  is_checkpoint?: boolean;
  serial_number?: number;
  is_read?: boolean;
  audio_url?: string;
  user_input?: string;
  audio_segments?: string[];
}

export interface SlideProps extends React.ComponentProps<"section"> {
  elementList?: Element[];
  showPlayer?: boolean;
  playerClassName?: string;
  interactionTitle?: string;
}

const Slide: React.FC<SlideProps> = ({
  elementList = [],
  showPlayer = true,
  playerClassName,
  interactionTitle,
  className,
  ...props
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const checkpointElementList = elementList.filter(
    (element) => element.is_checkpoint
  );
  const interactionElement = checkpointElementList.find(
    (element) => element.type === "interaction"
  );
  const visibleInteractionContent =
    interactionElement?.is_show !== false &&
    typeof interactionElement?.content === "string"
      ? interactionElement.content
      : undefined;
  const slideElementList = checkpointElementList.filter(
    (element) => element.type !== "interaction"
  );
  const visibleCheckpointCount = slideElementList.filter(
    (element) => element.is_show !== false
  ).length;
  const hasVisibleInteraction = interactionElement?.is_show !== false;
  const isSingleSlide = visibleCheckpointCount === 1;
  const shouldRenderPlayer =
    showPlayer && (isSingleSlide || hasVisibleInteraction);

  const handleFullscreen = () => {
    const target = sectionRef.current;
    if (!target) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      return;
    }

    target.requestFullscreen?.().catch(() => {});
  };

  return (
    <section
      ref={sectionRef}
      className={cn("relative h-full w-full", className)}
      {...props}
    >
      <div
        className={cn(
          "w-full",
          isSingleSlide ? "slide-content--single" : "grid gap-4"
        )}
      >
        {slideElementList.length > 0
          ? slideElementList.map((element, index) => (
              <div
                key={`${element.serial_number ?? index}-${element.type}`}
                className={cn(
                  "w-full",
                  isSingleSlide &&
                    element.is_show !== false &&
                    "slide-element--single",
                  element.is_show === false && "hidden"
                )}
              >
                {/* Render custom slot content directly and use the iframe sandbox for string-based content */}
                {element.type === "slot" ? (
                  <>{element.content}</>
                ) : element.type === "html" ? (
                  <IframeSandbox
                    className="content-render-iframe"
                    hideFullScreen
                    mode="blackboard"
                    type="sandbox"
                    content={element.content as string}
                  />
                ) : (
                  <IframeSandbox
                    className="content-render-iframe"
                    hideFullScreen
                    mode="blackboard"
                    type="markdown"
                    content={element.content as string}
                  />
                )}
              </div>
            ))
          : null}
      </div>

      {shouldRenderPlayer ? (
        <div className="slide-player-wrapper">
          <Player
            className={playerClassName}
            interactionContent={visibleInteractionContent}
            interactionTitle={interactionTitle}
            onFullscreen={handleFullscreen}
          />
        </div>
      ) : null}
    </section>
  );
};

export default Slide;
