import type { Meta, StoryObj } from "@storybook/react";
import { OverlayProvider } from "../context/OverlayProvider";
import { Button } from "../form/Button";
import { Card } from "./Card";
import { Row } from "./FlexBox";
import { Popover, PopoverProps } from "./Popover";

type PopoverStoryArgs = Pick<
  PopoverProps,
  | "align"
  | "alignOffset"
  | "collisionPadding"
  | "side"
  | "sideOffset"
  | "content"
  | "variant"
>;

const sides = ["top", "right", "bottom", "left"] as const;
const aligns = ["start", "center", "end"] as const;
const variants = ["solid", "sheer"] as const;

const meta = {
  title: "Layout/Popover",
  args: {
    align: "center",
    alignOffset: 0,
    collisionPadding: 8,
    content: "This content opens from the centered trigger.",
    side: "bottom",
    sideOffset: 8,
    variant: "solid",
  },
  render: (args) => <PopoverDemo {...args} />,
  argTypes: {
    align: {
      control: "select",
      options: aligns,
    },
    alignOffset: {
      control: "number",
    },
    collisionPadding: {
      control: "number",
    },
    side: {
      control: "select",
      options: sides,
    },
    sideOffset: {
      control: "number",
    },
    variant: {
      control: "select",
      options: variants,
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
} satisfies Meta<PopoverStoryArgs>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {};

export const Bounded: Story = {
  args: {
    content: "This popover uses the card as its collision boundary.",
  },
  render: (args) => <BoundedPopover {...args} />,
};

function PopoverDemo(props: PopoverStoryArgs) {
  return (
    <Popover {...props}>
      <Button color="primary" variant="primary">
        Open popover
      </Button>
    </Popover>
  );
}

function BoundedPopover(args: PopoverStoryArgs) {
  return (
    <Popover.Boundary asChild>
      <Card elevation={1} px={20} py={10} alignX="center" alignY="center">
        <Popover {...args}>
          <Button color="primary" variant="primary">
            Open popover
          </Button>
        </Popover>
      </Card>
    </Popover.Boundary>
  );
}
