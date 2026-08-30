// Vite's library mode inlines every asset a stylesheet references, and unlike a
// normal build it ignores `assetsInlineLimit` entirely -- there is no config
// that turns this off. KaTeX ships 20 font families in three formats each, so
// base64-expanded they leave `dist/assets/markdown-flow-ui.css` weighing about
// 1.5 MB. Consumers load that stylesheet in their root layout, where it blocks
// the first render of every page.
//
// The fonts themselves are already copied into `dist/fonts` for the library
// stylesheet, so this step points the bundled stylesheet at the same files:
// each data URI is matched back to its source font by content and rewritten to
// a relative URL. Browsers then fetch only the format they need instead of
// carrying all three inline.

import { createRequire } from "node:module";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const cssPath = join(process.cwd(), "dist/assets/markdown-flow-ui.css");
const fontsDir = join(
  dirname(require.resolve("katex/package.json")),
  "dist/fonts"
);

const byContent = new Map();
for (const name of readdirSync(fontsDir)) {
  byContent.set(readFileSync(join(fontsDir, name)).toString("base64"), name);
}

let replaced = 0;
const unmatched = new Set();
const css = readFileSync(cssPath, "utf8").replaceAll(
  /url\(\s*(["']?)data:font\/[a-z0-9-]+;base64,([A-Za-z0-9+/=]+)\1\s*\)/g,
  (whole, _quote, base64) => {
    const name = byContent.get(base64);
    if (!name) {
      unmatched.add(whole.slice(0, 40));
      return whole;
    }
    replaced += 1;
    return `url(../fonts/${name})`;
  }
);

if (replaced === 0) {
  console.error(
    "[externalize-katex-fonts] No inlined fonts found -- did the build layout change?"
  );
  process.exit(1);
}
if (unmatched.size > 0) {
  console.error(
    `[externalize-katex-fonts] ${unmatched.size} inlined font(s) had no match in ${fontsDir}`
  );
  process.exit(1);
}

writeFileSync(cssPath, css);
console.log(
  `[externalize-katex-fonts] Rewrote ${replaced} inlined fonts to dist/fonts`
);
