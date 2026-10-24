import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

const require = createRequire(import.meta.url);
const mermaidManifest = require.resolve("mermaid/package.json");
const yamlModule = resolve(
  dirname(mermaidManifest),
  "dist/chunks/mermaid.core/chunk-ZIRB5QZD.mjs"
);
const patchedYamlModule = resolve(
  dirname(require.resolve("js-yaml/package.json")),
  "dist/js-yaml.mjs"
);

// Mermaid's npm artifact embeds js-yaml, so package-manager overrides alone
// cannot repair it. Replace its shared YAML import before either bundle is
// generated; all static and lazy diagram consumers then use our runtime dep.
/** @returns {import("vite").Plugin} */
export function patchedMermaidYaml() {
  let libraryBuild = false;
  return {
    name: "patched-mermaid-yaml",
    enforce: "pre",
    config() {
      return {
        optimizeDeps: {
          esbuildOptions: {
            plugins: [
              {
                name: "patched-mermaid-yaml",
                setup(build) {
                  build.onResolve({ filter: /chunk-ZIRB5QZD\.mjs$/ }, (args) =>
                    resolve(args.resolveDir, args.path) === yamlModule
                      ? { path: patchedYamlModule }
                      : undefined
                  );
                },
              },
            ],
          },
        },
      };
    },
    configResolved(config) {
      libraryBuild = Boolean(config.build.lib);
    },
    buildStart() {
      const { version } = JSON.parse(readFileSync(mermaidManifest, "utf8"));
      if (version !== "11.16.1") {
        this.error(
          "Revalidate the embedded YAML module when upgrading Mermaid."
        );
      }
      const source = readFileSync(yamlModule, "utf8");
      if (
        !source.includes("js-yaml@4.1.1/") ||
        !/export\s*\{\s*JSON_SCHEMA,\s*load\s*\}/.test(source)
      ) {
        this.error(
          "Mermaid's embedded YAML module no longer matches its contract."
        );
      }
    },
    resolveId(source, importer) {
      if (importer && resolve(dirname(importer), source) === yamlModule) {
        return libraryBuild
          ? { id: "js-yaml", external: true }
          : { id: patchedYamlModule };
      }
      return null;
    },
  };
}
