import type { Meta, StoryObj } from "@storybook/react";
import { IconControl, type IconControlProps } from "./IconControl";
import { Logo } from "./Logo";

type LogoStoryProps = Pick<IconControlProps, "color" | "size">;

const meta: Meta<LogoStoryProps> = {
  title: "Display/Logo",
  args: {
    color: "primary",
  },
};

type Story = StoryObj<LogoStoryProps>;

export default meta;

export const Default: Story = {
  render: (props) => (
    <IconControl {...props} as="span" size="auto" style={{ height: "300px" }}>
      <Logo />
    </IconControl>
  ),
};
