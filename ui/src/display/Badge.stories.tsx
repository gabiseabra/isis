import { createRecord } from "@isis/common/utils/object";
import type { Meta, StoryObj } from "@storybook/react";
import { Row } from "../layout/FlexBox";
import { Table } from "../layout/Table";
import { Badge, type BadgeProps } from "./Badge";
import { Span, Text } from "./Text";

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
  render: ({ label, ...props }) => (
    <Table
      variant="unstyled"
      gap={2}
      render={(data) => data}
      header={<Table.Header />}
      columns={badgeSizes.map((size) => ({ key: size, title: size }))}
      rows={[
        createRecord(badgeSizes, (size) => (
          <Badge key={size} {...props} size={size}>
            {label}
          </Badge>
        )),
      ]}
    />
  ),
};

export const Colors: Story = {
  parameters: {
    controls: {
      exclude: ["color", "label"],
    },
  },
  render: (props) => (
    <Table
      variant="unstyled"
      gap={2}
      render={(data) => data}
      renderIndex={(_item, index) => (
        <Table.Label align="end">{badgeColors[index]}</Table.Label>
      )}
      columns={[{ key: "element" }]}
      rows={badgeColors.map((color) => ({
        element: (
          <Badge
            key={color}
            active={props.active}
            color={color}
            size={props.size}
            status={props.status}
          >
            {color}
          </Badge>
        ),
      }))}
    />
  ),
};

export const Statuses: Story = {
  parameters: {
    controls: {
      exclude: ["status", "label"],
    },
  },
  render: (props) => (
    <Table
      variant="unstyled"
      gap={2}
      render={(data) => data}
      header={<Table.Header />}
      columns={badgeStatuses.map((status) => ({ key: status, title: status }))}
      rows={[
        createRecord(badgeStatuses, (status) => (
          <Badge key={status} status={status} {...props}>
            {status}
          </Badge>
        )),
      ]}
    />
  ),
};
