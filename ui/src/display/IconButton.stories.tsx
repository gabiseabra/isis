import type { Meta, StoryObj } from "@storybook/react";
import { FaBook } from "react-icons/fa";
import { IconButton, IconButtonProps } from "./IconButton";
import { IconControl } from "./IconControl";

type IconButtonStoryProps = Pick<
  IconButtonProps,
  "variant" | "disabled" | "pressed"
>;

const meta: Meta<IconButtonStoryProps> = {
  title: "Display/IconButton",
  args: {
    variant: "sheer",
    disabled: false,
    pressed: false,
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["solid", "sheer"],
    },
  },
};

type Story = StoryObj<IconButtonProps>;

export default meta;

export const Default: Story = {
  render: (props) => (
    <IconButton {...props}>
      <IconControl color="blue">
        <FaBook />
      </IconControl>
    </IconButton>
  ),
};
