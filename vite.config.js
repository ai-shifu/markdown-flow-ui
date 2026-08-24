import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { createRequire } from "module";
import dts from "vite-plugin-dts";

const require = createRequire(import.meta.url);
const packageJson = require("./package.json");
const externalPackages = [
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.peerDependencies ?? {}),
];
const isExternal = (id) =>
  externalPackages.some(
    (dependency) => id === dependency || id.startsWith(`${dependency}/`)
  );

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      entryRoot: "src",
      tsconfigPath: "tsconfig.build.json",
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
      },
    },

    rollupOptions: {
      external: isExternal,

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
