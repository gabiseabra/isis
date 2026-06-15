import type { Meta, StoryObj } from "@storybook/react";
import { Col } from "../layout/FlexBox";
import { Badge, type BadgeProps } from "./Badge";

type BadgeStoryArgs = Pick<BadgeProps, "color" | "size" | "status" | "active">;

const meta = {
  title: "Display/Badge",
  args: {
    color: "primary",
    size: "m",
    status: undefined,
    active: false,
  },
  render: (args) => <Badge {...args}>Badge</Badge>,
  argTypes: {
    color: {
      control: "select",
      options: [
        "default",
        "gray",
        "orange",
        "yellow",
        "green",
        "blue",
        "purple",
        "pink",
        "red",
        "primary",
      ],
    },
    size: {
      control: "select",
      options: ["s", "m", "l"],
    },
    status: {
      control: "select",
      options: ["empty", "in-progress", "completed"],
    },
  },
  decorators: [
    (Story) => (
      <Col p={4} gap={1}>
        <Story />
      </Col>
    ),
  ],
} satisfies Meta<BadgeStoryArgs>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {};

export const Sizes: Story = {
  parameters: {
    controls: {
      exclude: ["size"],
    },
  },
  render: (args) => (
    <>
      <Badge {...args} size="s">
        Small
      </Badge>
      <Badge {...args} size="m">
        Medium
      </Badge>
      <Badge {...args} size="l">
        Large
      </Badge>
    </>
  ),
};

export const Colors: Story = {
  parameters: {
    controls: {
      exclude: ["color"],
    },
  },
  render: (args) => (
    <>
      {(
        [
          "default",
          "gray",
          "orange",
          "yellow",
          "green",
          "blue",
          "purple",
          "pink",
          "red",
          "primary",
        ] as const
      ).map((color) => (
        <Badge key={color} {...args} color={color}>
          {color}
        </Badge>
      ))}
    </>
  ),
};

export const Statuses: Story = {
  parameters: {
    controls: {
      exclude: ["status"],
    },
  },
  render: (args) => (
    <>
      {(["empty", "in-progress", "completed"] as const).map((status) => (
        <Badge key={status} {...args} status={status}>
          {status}
        </Badge>
      ))}
    </>
  ),
};
