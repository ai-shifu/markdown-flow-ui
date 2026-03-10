import React from "react";

import { cn } from "../../lib/utils";
import IframeSandbox from "../ContentRender/IframeSandbox";

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
  audio_segments?: string[];
}

export interface SlideProps extends React.ComponentProps<"section"> {
  elementList?: Element[];
}

const Slide: React.FC<SlideProps> = ({
  elementList = [],
  className,
  ...props
}) => {
  const visibleElementList = elementList.filter(
    (element) => element.is_show && element.is_checkpoint
  );
  const isSingleSlide = visibleElementList.length === 1;

  return (
    <section className={cn("h-full w-full", className)} {...props}>
      <div className={cn("w-full", isSingleSlide ? "h-full" : "grid gap-4")}>
        {visibleElementList.length > 0
          ? visibleElementList.map((element, index) => (
              <div
                key={`${element.serial_number ?? index}-${element.type}`}
                className={cn("w-full", isSingleSlide && "h-full")}
              >
                {/* Render custom slot content directly and use the iframe sandbox for string-based content */}
                {element.type === "slot" ? (
                  <div className="flex h-full w-full items-center justify-center">
                    {element.content}
                  </div>
                ) : element.type === "html" ? (
                  <IframeSandbox
                    className="content-render-iframe"
                    mode="blackboard"
                    type="sandbox"
                    content={element.content as string}
                  />
                ) : (
                  <IframeSandbox
                    className="content-render-iframe"
                    mode="blackboard"
                    type="markdown"
                    content={element.content as string}
                  />
                )}
              </div>
            ))
          : null}
      </div>
    </section>
  );
};

export default Slide;
