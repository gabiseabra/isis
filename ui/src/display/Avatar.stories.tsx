import { createRecord } from "@isis/common/utils/object";
import type { Meta, StoryObj } from "@storybook/react";
import { Table } from "../layout/Table";
import { Avatar, type AvatarProps } from "./Avatar";

type AvatarStoryArgs = Pick<AvatarProps, "src" | "title" | "fallback" | "size">;

const avatarSizes = ["s", "m", "l"] as const;

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
      options: avatarSizes,
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
    <Table
      variant="unstyled"
      gap={2}
      columns={avatarSizes}
      rows={[
        createRecord(avatarSizes, (size) => (
          <Avatar key={size} {...args} size={size} />
        )),
      ]}
      cell={(row, col) => row[col]}
      headerCell={(col) => <Table.Label>{col}</Table.Label>}
    />
  ),
};
