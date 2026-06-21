import type { Meta, StoryObj } from "@storybook/react";
import { Row } from "../layout/FlexBox";
import { Badge, type BadgeProps } from "./Badge";

type BadgeStoryProps = {
  label: string;
} & Pick<BadgeProps, "color" | "size" | "status" | "active">;

const badgeColors = [
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
] as const;

const badgeSizes = ["s", "m", "l"] as const;

const badgeStatuses = ["empty", "in-progress", "completed"] as const;

const meta: Meta<BadgeStoryProps> = {
  title: "Display/Badge",
  args: {
    color: "primary",
    size: "m",
    status: undefined,
    active: false,
    label: "Badge",
  },
  argTypes: {
    color: {
      control: "select",
      options: badgeColors,
    },
    size: {
      control: "select",
      options: badgeSizes,
    },
    status: {
      control: "select",
      options: [undefined, ...badgeStatuses],
    },
  },
};

type Story = StoryObj<BadgeStoryProps>;

export default meta;

export const Default: Story = {
  render: ({ label, ...args }) => <Badge {...args}>{label}</Badge>,
};

export const Sizes: Story = {
  parameters: {
    controls: {
      exclude: ["size"],
    },
  },
  render: ({ label, ...args }) => (
    <Row gap={2} wrap>
      {badgeSizes.map((size) => (
        <Badge key={size} {...args} size={size}>
          {label}
        </Badge>
      ))}
    </Row>
  ),
};

export const Colors: Story = {
  parameters: {
    controls: {
      exclude: ["color", "label"],
    },
  },
  render: (props) => (
    <Row gap={2} wrap>
      {badgeColors.map((color) => (
        <Badge
          key={color}
          active={props.active}
          color={color}
          size={props.size}
          status={props.status}
        >
          {color}
        </Badge>
      ))}
    </Row>
  ),
};

export const Statuses: Story = {
  parameters: {
    controls: {
      exclude: ["status", "label"],
    },
  },
  render: (props) => (
    <Row gap={2} wrap>
      {badgeStatuses.map((status) => (
        <Badge
          key={status}
          active={props.active}
          color={props.color}
          size={props.size}
          status={status}
        >
          {status}
        </Badge>
      ))}
    </Row>
  ),
};
