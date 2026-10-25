import type { StorybookConfig } from "@storybook/nextjs-vite";
import { resolve } from "path";
import { patchedMermaidYaml } from "../scripts/mermaid-yaml.mjs";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
  ],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  staticDirs: ["../public"],
  viteFinal: async (config) => {
    // The browser-test addon calls viteFinal without loading vite.config.js.
    // Reuse the parser boundary for previews, tests and static Storybook.
    config.plugins ??= [];
    if (
      !config.plugins.some(
        (plugin) =>
          plugin &&
          typeof plugin === "object" &&
          "name" in plugin &&
          plugin.name === "patched-mermaid-yaml"
      )
    ) {
      config.plugins.push(patchedMermaidYaml());
    }
    const aliasEntry = { find: "@", replacement: resolve(__dirname, "../src") };

    if (Array.isArray(config.resolve?.alias)) {
      config.resolve.alias = [...config.resolve.alias, aliasEntry];
    } else {
      config.resolve = {
        ...(config.resolve ?? {}),
        alias: {
          ...(config.resolve?.alias ?? {}),
          "@": aliasEntry.replacement,
        },
      };
    }

    return config;
  },
};
export default config;
