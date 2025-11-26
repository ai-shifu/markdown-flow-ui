import type { StorybookConfig } from "@storybook/nextjs-vite";
import { resolve } from "path";

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
