import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const distDir = join(process.cwd(), "dist");
const sourcePath = join(distDir, "assets", "markdown-flow-ui.css");
const legacyPath = join(distDir, "markdown-flow-ui.css");

const css = readFileSync(sourcePath, "utf8").replaceAll("../fonts/", "fonts/");

writeFileSync(legacyPath, css);
console.log("[copy-legacy-css-entry] Wrote dist/markdown-flow-ui.css");
