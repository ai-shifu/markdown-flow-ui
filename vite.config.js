import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      entryRoot: "src",
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
      },
    },

    rollupOptions: {
      external: ["react", "react-dom", "next", "next/router", "react-dom/client"],

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
          entryFileNames: "[name].cjs.js",
          chunkFileNames: "chunks/[name]-[hash].cjs.js",
          assetFileNames: "assets/[name][extname]",
        },
      ],
    },

    sourcemap: true,
    emptyOutDir: true,
  },
});
