import tailwindScript from "./vendor/tailwindcss-v3.min.js?raw";
import daisyuiCss from "./vendor/daisyui-v4.min.css?raw";
import gsapScript from "./vendor/gsap-v3.min.js?raw";

/**
 * Inject blackboard-mode libraries (Tailwind CSS, DaisyUI, GSAP)
 * into an iframe document using DOM API to avoid template-string escaping issues.
 */
export function injectBlackboardLibraries(doc: Document): void {
  // 1. Tailwind CSS v3 (JIT compiler, must load first)
  const tailwindEl = doc.createElement("script");
  tailwindEl.textContent = tailwindScript;
  doc.head.appendChild(tailwindEl);

  // 2. DaisyUI v4 CSS
  const daisyuiEl = doc.createElement("style");
  daisyuiEl.textContent = daisyuiCss;
  doc.head.appendChild(daisyuiEl);

  // 3. GSAP v3
  const gsapEl = doc.createElement("script");
  gsapEl.textContent = gsapScript;
  doc.head.appendChild(gsapEl);
}
