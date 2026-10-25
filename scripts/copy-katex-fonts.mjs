import { cpSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

const require = createRequire(import.meta.url);
const katexDirectory = dirname(require.resolve("katex/package.json"));

// Tailwind preserves relative font URLs; keep them valid in the published CSS.
cpSync(resolve(katexDirectory, "dist/fonts"), resolve("dist/fonts"), {
  recursive: true,
});
