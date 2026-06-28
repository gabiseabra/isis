import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../form/Button";
import { Row } from "../layout/FlexBox";
import { OverlayProvider } from "./OverlayProvider";
import { Tooltip, type TooltipProps } from "./Tooltip";

type TooltipStoryArgs = Pick<
  TooltipProps,
  "align" | "alignOffset" | "content" | "side" | "sideOffset" | "delay"
>;

const sides = ["top", "right", "bottom", "left"] as const;
const aligns = ["start", "center", "end"] as const;

const meta = {
  title: "Overlay/Tooltip",
  args: {
    align: "center",
    alignOffset: 0,
    content: "Additional context appears on hover.",
    side: "top",
    sideOffset: 1,
    delay: 300,
  },
  render: (props) => (
    <Tooltip {...props}>
      <Button>Hover for tooltip</Button>
    </Tooltip>
  ),
  argTypes: {
    align: {
      control: "select",
      options: aligns,
    },
    alignOffset: {
      control: "number",
    },
    side: {
      control: "select",
      options: sides,
    },
    sideOffset: {
      control: "number",
    },
    delay: {
      control: "number",
    },
  },
  decorators: [
    (Story) => (
      <OverlayProvider>
        <Row
          p={4}
          alignX="center"
          alignY="center"
          style={{ minHeight: "60vh" }}
        >
          <Story />
        </Row>
      </OverlayProvider>
    ),
  ],
} satisfies Meta<TooltipStoryArgs>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {};
