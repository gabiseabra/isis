import { createRecord } from "@isis/common/utils/object";
import type { Meta, StoryObj } from "@storybook/react";
import { FaBook } from "react-icons/fa";
import { Table } from "../layout/Table";
import { IconBadge, type IconBadgeProps } from "./IconBadge";
import { IconControl, type IconControlProps } from "./IconControl";

type IconBadgeStoryProps = Pick<
  IconBadgeProps,
  "badge" | "color" | "position"
> &
  Pick<IconControlProps, "size">;

const iconBadgePositions = [
  "top-start",
  "top-end",
  "bottom-start",
  "bottom-end",
] as const;

const iconBadgeColors = [
  "transparent",
  "gray",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
  "red",
  "primary",
  "muted",
  "disabled",
] as const;

const iconControlSizes = ["xs", "s", "m", "l", "xl"] as const;

const meta: Meta<IconBadgeStoryProps> = {
  title: "Display/IconBadge",
  args: {
    badge: "3",
    color: "primary",
    position: "top-end",
    size: "m",
  },
  argTypes: {
    color: {
      control: "select",
      options: iconBadgeColors,
    },
    position: {
      control: "select",
      options: iconBadgePositions,
    },
    size: {
      control: "select",
      options: iconControlSizes,
    },
  },
};

type Story = StoryObj<IconBadgeStoryProps>;

export default meta;

function DemoIcon({ badge, position, color, size }: IconBadgeStoryProps) {
  return (
    <IconBadge badge={badge} color={color} position={position}>
      <IconControl color="muted" size={size}>
        <FaBook />
      </IconControl>
    </IconBadge>
  );
}

export const Default: Story = {
  render: (props) => <DemoIcon {...props} />,
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
      rows={[createRecord(iconControlSizes, (size) => ({ ...props, size }))]}
      cell={(row, col) => <DemoIcon {...row[col]} />}
      headerCell={(col) => <Table.Label>{col}</Table.Label>}
    />
  ),
};

export const Positions: Story = {
  parameters: {
    controls: {
      exclude: ["position"],
    },
  },
  render: (props) => (
    <Table
      variant="unstyled"
      gap={2}
      columns={[""]}
      rows={iconBadgePositions.map((position) => ({ ...props, position }))}
      cell={(props) => <DemoIcon {...props} />}
      index={(row) => (
        <Table.Label style={{ whiteSpace: "nowrap" }}>
          {row.position}
        </Table.Label>
      )}
    />
  ),
};

export const Colors: Story = {
  parameters: {
    controls: {
      exclude: ["color"],
    },
  },
  render: (props) => (
    <Table
      variant="unstyled"
      gap={2}
      columns={[""]}
      rows={iconBadgeColors.map((color) => ({ ...props, color }))}
      cell={(props) => <DemoIcon {...props} />}
      index={(row) => <Table.Label>{row.color}</Table.Label>}
    />
  ),
};
