import type { PluggableList } from "unified";
import remarkFlow from "remark-flow";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";

export const remarkPlugins: PluggableList = [
  remarkGfm,
  remarkMath,
  remarkFlow,
  remarkBreaks,
];
