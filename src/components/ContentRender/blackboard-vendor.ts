import tailwindScript from "./vendor/tailwindcss-v3.min.js?raw";
import bootstrapCss from "./vendor/bootstrap-v5.min.css?raw";
import bootstrapIconsCss from "./vendor/bootstrap-icons-v1.min.css?raw";
import bootstrapScript from "./vendor/bootstrap-v5.bundle.min.js?raw";
import gsapScript from "./vendor/gsap-v3.min.js?raw";

/**
 * Inject blackboard-mode libraries (Tailwind CSS, Bootstrap 5, Bootstrap Icons, GSAP)
 * into an iframe document using DOM API to avoid template-string escaping issues.
 */
export function injectBlackboardLibraries(doc: Document): void {
  // 1. Tailwind CSS v3 (JIT compiler, must load first)
  const tailwindEl = doc.createElement("script");
  tailwindEl.textContent = tailwindScript;
  doc.head.appendChild(tailwindEl);

  // 2. Bootstrap 5.3 CSS
  const bootstrapCssEl = doc.createElement("style");
  bootstrapCssEl.textContent = bootstrapCss;
  doc.head.appendChild(bootstrapCssEl);

  // 3. Bootstrap Icons v1.11 CSS
  const bootstrapIconsEl = doc.createElement("style");
  bootstrapIconsEl.textContent = bootstrapIconsCss;
  doc.head.appendChild(bootstrapIconsEl);

  // 4. Bootstrap 5.3 JS Bundle (includes Popper.js, needed for tooltips/dropdowns)
  const bootstrapJsEl = doc.createElement("script");
  bootstrapJsEl.textContent = bootstrapScript;
  doc.head.appendChild(bootstrapJsEl);

  // 5. GSAP v3
  const gsapEl = doc.createElement("script");
  gsapEl.textContent = gsapScript;
  doc.head.appendChild(gsapEl);
}
