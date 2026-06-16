import type { StorybookConfig } from "@storybook/react-vite";
import { fileURLToPath } from "node:url";
import { mergeConfig, type UserConfig } from "vite";

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  core: {
    builder: "@storybook/builder-vite",
  },
  viteFinal: (config) =>
    mergeConfig(config, {
      resolve: {
        alias: {
          "@isis/common": fileURLToPath(
            new URL("../../common/src", import.meta.url),
          ),
        },
      },
    } satisfies UserConfig),
};

export default config;
