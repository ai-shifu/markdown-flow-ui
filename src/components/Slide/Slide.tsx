import React from "react";

import ContentRender from "../ContentRender";
import { cn } from "../../lib/utils";

type ElementType =
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
  content: string;
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

  return (
    <section className={cn("w-full h-full", className)} {...props}>
      <div className="grid gap-4">
        {visibleElementList.length > 0
          ? visibleElementList.map((element, index) => (
              <div
                key={`${element.serial_number ?? index}-${element.type}`}
                className="w-full"
              >
                {/* Keep slide rendering minimal and defer content parsing to ContentRender */}
                <ContentRender content={element.content} />
              </div>
            ))
          : null}
      </div>
    </section>
  );
};

export default Slide;
