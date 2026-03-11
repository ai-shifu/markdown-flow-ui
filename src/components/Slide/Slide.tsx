import React, { useEffect, useRef, useState } from "react";

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
  const [activeRenderKey, setActiveRenderKey] = useState(
    currentElementRenderKey
  );
  const [activeRenderElement, setActiveRenderElement] =
    useState(currentElement);
  const [exitingRenderKey, setExitingRenderKey] = useState<
    string | number | undefined
  >();
  const [exitingRenderElement, setExitingRenderElement] = useState<Element>();

  useEffect(() => {
    if (!currentElement || currentElementRenderKey == null) {
      setActiveRenderKey(undefined);
      setActiveRenderElement(undefined);
      setExitingRenderKey(undefined);
      setExitingRenderElement(undefined);
      return;
    }

    setActiveRenderKey((prevKey) => {
      if (prevKey == null || prevKey === currentElementRenderKey) {
        return currentElementRenderKey;
      }

      setExitingRenderKey(prevKey);
      setExitingRenderElement(activeRenderElement);
      return currentElementRenderKey;
    });
    setActiveRenderElement(currentElement);
  }, [activeRenderElement, currentElement, currentElementRenderKey]);

  useEffect(() => {
    if (exitingRenderKey == null) {
      return;
    }

    const timer = window.setTimeout(() => {
      setExitingRenderKey(undefined);
      setExitingRenderElement(undefined);
    }, 260);

    return () => {
      window.clearTimeout(timer);
    };
  }, [exitingRenderKey]);

  const renderSlideElement = (element?: Element) => {
    if (!element) {
      return null;
    }

    if (element.type === "slot") {
      return <>{element.content}</>;
    }

    if (element.type === "html") {
      return (
        <IframeSandbox
          className="content-render-iframe"
          hideFullScreen
          mode="blackboard"
          type="sandbox"
          content={element.content as string}
        />
      );
    }

    return (
      <IframeSandbox
        className="content-render-iframe"
        hideFullScreen
        mode="blackboard"
        type="markdown"
        content={element.content as string}
      />
    );
  };

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
        {activeRenderElement ? (
          <div className="slide-stage">
            {exitingRenderElement ? (
              <div
                key={exitingRenderKey}
                className={cn(
                  "slide-stage__layer slide-stage__layer--exit w-full",
                  isSingleSlide &&
                    exitingRenderElement.is_show !== false &&
                    "slide-element--single",
                  exitingRenderElement.is_show === false && "hidden"
                )}
              >
                {renderSlideElement(exitingRenderElement)}
              </div>
            ) : null}

            <div
              key={activeRenderKey}
              className={cn(
                "slide-stage__layer slide-stage__layer--enter w-full",
                isSingleSlide &&
                  activeRenderElement.is_show !== false &&
                  "slide-element--single",
                activeRenderElement.is_show === false && "hidden"
              )}
            >
              {renderSlideElement(activeRenderElement)}
            </div>
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
