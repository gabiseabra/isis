import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../form/Button";
import { Card } from "../layout/Card";
import { Popover, PopoverProps } from "./Popover";

type PopoverStoryProps = Pick<
  PopoverProps,
  "align" | "alignOffset" | "side" | "sideOffset" | "content" | "variant"
>;

const sides = ["top", "right", "bottom", "left"] as const;
const aligns = ["start", "center", "end"] as const;
const variants = ["solid", "sheer"] as const;

const meta: Meta<PopoverStoryProps> = {
  title: "Overlay/Popover",
  args: {
    align: "center",
    alignOffset: 0,
    content: "This content opens from the centered trigger.",
    side: "bottom",
    sideOffset: 1,
    variant: "solid",
  },
  argTypes: {
    align: {
      control: "select",
      options: aligns,
    },
    side: {
      control: "select",
      options: sides,
    },
    variant: {
      control: "select",
      options: variants,
    },
  },
};

type Story = StoryObj<PopoverStoryProps>;

export default meta;

function PopoverStory(props: PopoverStoryProps) {
  return (
    <Popover {...props}>
      <Button color="primary" variant="primary">
        Open popover
      </Button>
    </Popover>
  );
}

export const Default: Story = {
  render: (props) => <PopoverStory {...props} />,
};

export const Bounded: Story = {
  args: {
    content: "This popover uses the card as its collision boundary.",
  },
  render: (props) => (
    <Popover.Boundary padding={2} asChild>
      <Card elevation={1} px={20} py={10} alignX="center" alignY="center">
        <PopoverStory {...props} />
      </Card>
    </Popover.Boundary>
  ),
};
