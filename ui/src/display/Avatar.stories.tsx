import type { Meta, StoryObj } from "@storybook/react";
import { Row } from "../layout/FlexBox";
import { Avatar, type AvatarProps } from "./Avatar";

type AvatarStoryArgs = Pick<AvatarProps, "src" | "title" | "fallback" | "size">;

const meta: Meta<AvatarStoryArgs> = {
  title: "Display/Avatar",
  args: {
    src: "https://cataas.com/cat",
    title: "Eyy Lmao",
    fallback: "",
    size: "l",
  },
  argTypes: {
    size: {
      control: "select",
      options: ["s", "m", "l"],
    },
  },
};

type Story = StoryObj<AvatarStoryArgs>;

export default meta;

export const Default: Story = {
  render: (args) => <Avatar {...args} />,
};

export const Fallback: Story = {
  args: {
    src: "",
  },
  parameters: {
    controls: {
      exclude: ["src"],
    },
  },
  render: (args) => <Avatar {...args} />,
};

export const Sizes: Story = {
  parameters: {
    controls: {
      exclude: ["size"],
    },
  },
  render: (args) => (
    <Row gap={2}>
      {(["s", "m", "l"] as const).map((size) => (
        <Avatar key={size} {...args} size={size} />
      ))}
    </Row>
  ),
};
