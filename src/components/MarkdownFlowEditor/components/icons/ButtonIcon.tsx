import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { cn } from "../../../../lib/utils";

const ButtonIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ className, size = 18, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      fill="currentColor"
      className={cn("lucide lucide-button-icon", className)}
      {...props}
    >
      <path d="M502.401 1001.473C227.236 1001.473 3.264 777.502 3.264 502.336S227.236 3.2 502.401 3.2c275.165 0 499.137 223.972 499.137 499.137 0 17.598-14.398 31.996-31.996 31.996s-31.996-14.398-31.996-31.996c0-239.97-195.175-435.145-435.144-435.145S67.256 262.367 67.256 502.336s195.175 435.145 435.145 435.145c17.598 0 31.996 14.398 31.996 31.996s-14.398 31.996-31.996 31.996Z" />
      <path d="m537.597 470.34 102.387 524.733a12 12 0 0 0 17.598 4.8l107.186-147.181 110.386 161.58a24 24 0 0 0 28.796 6.399l49.594-31.996a24 24 0 0 0 6.399-28.796l-111.986-159.98 166.379-63.992a12 12 0 0 0 1.6-19.198L556.794 457.542c-9.599-4.8-20.797 3.2-19.197 12.798Z" />
    </svg>
  )
);

ButtonIcon.displayName = "ButtonIcon";

export default ButtonIcon;
