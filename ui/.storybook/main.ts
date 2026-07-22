import type { StorybookConfig } from "@storybook/react-vite";
import { fileURLToPath } from "node:url";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  core: {
    builder: "@storybook/builder-vite",
    allowedHosts: true,
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
    }),
};

export default config;
