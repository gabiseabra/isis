import type { StorybookConfig } from "@storybook/react-vite";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { mergeConfig } from "vite";

dotenv.config({ path: "../.env" });

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
      server: {
        port: Number(process.env.STORYBOOK_PORT ?? 6663),
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
