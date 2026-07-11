import { addCjkSafeSansToTailwindConfig } from "../cjkFontFamily";

interface TailwindRuntimeWindow extends Window {
  tailwind?: {
    config?: unknown;
  };
}

/**
 * Reassigns the Tailwind Play config so its JIT runtime rescans the iframe DOM.
 * This is required when a sandbox was initialized under a display:none parent.
 */
export const refreshTailwindRuntime = (doc: Document): boolean => {
  const tailwindRuntime = (doc.defaultView as TailwindRuntimeWindow | null)
    ?.tailwind;

  if (!tailwindRuntime) {
    return false;
  }

  tailwindRuntime.config = addCjkSafeSansToTailwindConfig(
    tailwindRuntime.config
  );
  return true;
};
