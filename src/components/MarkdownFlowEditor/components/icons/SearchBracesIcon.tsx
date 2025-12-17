import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { cn } from "../../../../lib/utils";

const SearchBracesIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ className, size = 20, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide lucide-search-braces", className)}
      {...props}
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="16.65" y1="16.65" x2="21" y2="21" />
      <path d="M10 8c-1 0-1.5.5-1.5 1.5S8 11 7 11s1.5.5 1.5 1.5S9 14 10 14" />
      <path d="M12 8c1 0 1.5.5 1.5 1.5S14 11 15 11s-1.5.5-1.5 1.5S13 14 12 14" />
    </svg>
  )
);

SearchBracesIcon.displayName = "SearchBracesIcon";

export default SearchBracesIcon;
