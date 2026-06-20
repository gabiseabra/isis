import type { StorybookConfig } from "@storybook/react-vite";
import { fileURLToPath } from "node:url";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  core: {
    builder: "@storybook/builder-vite",
  },
  viteFinal: (config) =>
    mergeConfig(config, {
      optimizeDeps: {
        exclude: ["@isis/common"],
      },
      resolve: {
        alias: {
          "@isis/common": fileURLToPath(
            new URL("../../common/src", import.meta.url),
          ),
        },
      },
    }),
};

export default config;
