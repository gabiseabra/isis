import { createRecord } from "@isis/common/utils/object";
import type { Meta, StoryObj } from "@storybook/react";
import { FaBook, FaThumbsUp } from "react-icons/fa";
import { Table } from "../layout/Table";
import { IconControl, type IconControlProps } from "./IconControl";

type IconControlStoryProps = Pick<
  IconControlProps,
  "size" | "color" | "badge" | "pressed" | "title"
>;

const iconControlSizes = ["xs", "s", "m", "l", "xl", "auto"] as const;

const meta: Meta<IconControlStoryProps> = {
  title: "Display/IconControl",
  args: {
    size: "m",
    color: "primary",
    badge: "",
    pressed: false,
    title: "",
  },
  argTypes: {
    size: {
      control: "select",
      options: iconControlSizes,
    },
    color: {
      control: "select",
      options: [
        "currentColor",
        "default",
        "gray",
        "brown",
        "orange",
        "yellow",
        "green",
        "blue",
        "purple",
        "pink",
        "red",
        "primary",
        "muted",
      ],
    },
    badge: {
      control: "text",
    },
    title: {
      control: "text",
    },
  },
};

type Story = StoryObj<IconControlStoryProps>;

export default meta;

export const Default: Story = {
  render: (props) => (
    <IconControl {...props}>
      <FaBook />
    </IconControl>
  ),
};

export const Emoji: Story = {
  render: (props) => <IconControl {...props}>❤️</IconControl>,
};

export const WithBadge: Story = {
  args: {
    badge: "3",
  },
  render: (props) => (
    <IconControl {...props}>
      <FaThumbsUp />
    </IconControl>
  ),
};

export const Sizes: Story = {
  parameters: {
    controls: {
      exclude: ["size"],
    },
  },
  render: (props) => (
    <Table
      variant="unstyled"
      gap={2}
      columns={iconControlSizes}
      rows={[
        createRecord(iconControlSizes, (size) => (
          <IconControl key={size} {...props} size={size}>
            <FaBook />
          </IconControl>
        )),
      ]}
      cell={(row, col) => row[col]}
      headerCell={(col) => <Table.Label>{col}</Table.Label>}
    />
  ),
};
