import React, { useRef } from "react";

import { cn } from "../../lib/utils";
import IframeSandbox from "../ContentRender/IframeSandbox";
import Player from "./Player";
import type { Element } from "./types";
import useSlide from "./useSlide";
import "./slide.css";
export type { Element } from "./types";

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
  const {
    currentElement,
    currentIndex,
    slideElementList,
    audioList,
    currentAudioIndex,
    canGoPrev,
    canGoNext,
    handlePrev,
    handleNext,
  } = useSlide(elementList);
  const visibleCheckpointCount = slideElementList.filter(
    (element) => element.is_show !== false
  ).length;
  const hasVisibleInteraction = interactionElement?.is_show !== false;
  const isSingleSlide = visibleCheckpointCount === 1;
  const shouldRenderPlayer =
    showPlayer && (isSingleSlide || hasVisibleInteraction);
  const currentElementRenderKey =
    currentElement?.serial_number ?? `${currentIndex}-${currentElement?.type}`;

  const handleFullscreen = () => {
    const target = sectionRef.current;
    if (!target) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      return;
    }

    target.requestFullscreen?.().catch(() => {});
  };

  console.log("currentElement", currentElement);

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
        {currentElement ? (
          <div
            key={currentElementRenderKey}
            className={cn(
              "w-full",
              isSingleSlide &&
                currentElement.is_show !== false &&
                "slide-element--single",
              currentElement.is_show === false && "hidden"
            )}
          >
            {/* Render the current slide element selected by useSlide */}
            {currentElement.type === "slot" ? (
              <>{currentElement.content}</>
            ) : currentElement.type === "html" ? (
              <IframeSandbox
                className="content-render-iframe"
                hideFullScreen
                mode="blackboard"
                type="sandbox"
                content={currentElement.content as string}
              />
            ) : (
              <IframeSandbox
                className="content-render-iframe"
                hideFullScreen
                mode="blackboard"
                type="markdown"
                content={currentElement.content as string}
              />
            )}
          </div>
        ) : null}
      </div>

      {shouldRenderPlayer ? (
        <div className="slide-player-wrapper">
          <Player
            audioList={audioList}
            className={playerClassName}
            currentAudioIndex={currentAudioIndex}
            interactionContent={visibleInteractionContent}
            interactionTitle={interactionTitle}
            onFullscreen={handleFullscreen}
            onNext={handleNext}
            onPrev={handlePrev}
            nextDisabled={!canGoNext}
            prevDisabled={!canGoPrev}
          />
        </div>
      ) : null}
    </section>
  );
};

export default Slide;
