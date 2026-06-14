import type { Preview } from "@storybook/react";
import "../styles/global.scss";

const preview: Preview = {
  parameters: {
    actions: { disable: true },
  },
};

export default preview;
