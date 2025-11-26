import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const interPackageJsonPath = require.resolve("@fontsource/inter/package.json");
const sourceDir = join(dirname(interPackageJsonPath), "files");
const targetDir = join(process.cwd(), "dist/files");

if (!existsSync(sourceDir)) {
  console.error(`[copy-fonts] Missing Inter font assets in ${sourceDir}`);
  process.exit(1);
}

rmSync(targetDir, { recursive: true, force: true });
mkdirSync(targetDir, { recursive: true });
cpSync(sourceDir, targetDir, { recursive: true });

console.log(`[copy-fonts] Copied Inter fonts to ${targetDir}`);
