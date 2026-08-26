import { existsSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { dirname, relative, resolve } from "node:path";
import dts from "vite-plugin-dts";

const peerPackageNames = ["next", "react", "react-dom"];
const sourceRoot = resolve(__dirname, "src");
const outputRoot = resolve(__dirname, "dist");

const isPeerImport = (id) =>
  peerPackageNames.some(
    (packageName) => id === packageName || id.startsWith(`${packageName}/`)
  );

const hasFileExtension = (specifier) => /\/[^/]+\.[^/]+$/.test(specifier);

const appendJavaScriptExtension = (filePath, specifier) => {
  if (hasFileExtension(specifier)) return specifier;

  const outputRelativePath = relative(outputRoot, resolve(filePath));
  const sourceImporterDirectory = dirname(
    resolve(sourceRoot, outputRelativePath)
  );
  const sourceTarget = resolve(sourceImporterDirectory, specifier);
  const resolvesToIndex = ["index.ts", "index.tsx", "index.js", "index.jsx"]
    .map((fileName) => resolve(sourceTarget, fileName))
    .some((filePath) => existsSync(filePath));
  return resolvesToIndex ? `${specifier}/index.js` : `${specifier}.js`;
};

const makeNodeNextCompatible = (filePath, content) =>
  content
    .replace(
      /(\bfrom\s+)(["'])(\.{1,2}\/[^"']+)\2/g,
      (_match, prefix, quote, specifier) =>
        `${prefix}${quote}${appendJavaScriptExtension(filePath, specifier)}${quote}`
    )
    .replace(
      /(\bimport\s+)(["'])(\.{1,2}\/[^"']+)\2/g,
      (_match, prefix, quote, specifier) =>
        `${prefix}${quote}${appendJavaScriptExtension(filePath, specifier)}${quote}`
    )
    .replace(
      /(\bimport\s*\(\s*)(["'])(\.{1,2}\/[^"']+)\2/g,
      (_match, prefix, quote, specifier) =>
        `${prefix}${quote}${appendJavaScriptExtension(filePath, specifier)}${quote}`
    );

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      entryRoot: "src",
      tsconfigPath: "tsconfig.build.json",
      beforeWriteFile(filePath, content) {
        return {
          filePath,
          content: makeNodeNextCompatible(filePath, content),
        };
      },
    }),
  ],

  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },

  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        editor: resolve(__dirname, "src/editor.ts"),
        renderer: resolve(__dirname, "src/renderer.ts"),
        slide: resolve(__dirname, "src/slide.ts"),
        scroll: resolve(__dirname, "src/scroll.ts"),
      },
    },

    rollupOptions: {
      external: isPeerImport,

      output: [
        {
          format: "es",
          preserveModules: true,
          preserveModulesRoot: "src",
          entryFileNames: "[name].es.js",
          chunkFileNames: "chunks/[name]-[hash].js",
          assetFileNames: "assets/[name][extname]",
        },
        {
          format: "cjs",
          exports: "named",
          preserveModules: true,
          preserveModulesRoot: "src",
          entryFileNames: "[name].cjs",
          chunkFileNames: "chunks/[name]-[hash].cjs",
          assetFileNames: "assets/[name][extname]",
        },
      ],
    },

    sourcemap: true,
    emptyOutDir: true,
  },
});
