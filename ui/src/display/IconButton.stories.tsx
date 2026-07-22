import { createRecord } from "@isis/common/utils/object";
import type { Meta, StoryObj } from "@storybook/react";
import { FaBook } from "react-icons/fa";
import { Table } from "../layout/Table";
import { IconButton, IconButtonProps } from "./IconButton";
import { IconControl, IconControlProps } from "./IconControl";

type IconButtonStoryProps = Pick<
  IconButtonProps,
  "variant" | "color" | "disabled" | "pressed"
> &
  Pick<IconControlProps, "size">;

const variants = ["solid", "sheer"] as const;
const colors = [
  "currentColor",
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
  "muted",
] as const;
const sizes = ["xs", "s", "m", "l", "xl"] as const;

const meta: Meta<IconButtonStoryProps> = {
  title: "Display/IconButton",
  args: {
    variant: "sheer",
    color: "blue",
    size: "m",
    disabled: false,
    pressed: false,
  },
  argTypes: {
    variant: {
      control: "select",
      options: variants,
    },
    color: {
      control: "select",
      options: colors,
    },
    size: {
      control: "select",
      options: sizes,
    },
  },
};

type Story = StoryObj<IconButtonStoryProps>;

export default meta;

export const Default: Story = {
  render: ({ color, size, ...props }) => (
    <IconButton {...props} color={color}>
      <IconControl color={color} size={size}>
        <FaBook />
      </IconControl>
    </IconButton>
  ),
};

export const Colors: Story = {
  parameters: {
    controls: {
      exclude: ["color"],
    },
  },
  render: ({ size, ...props }) => (
    <Table
      variant="unstyled"
      gap={2}
      rows={colors}
      columns={variants}
      cell={(color, variant) => (
        <IconButton {...props} color={color} variant={variant}>
          <IconControl p={0.5} size={size}>
            <FaBook />
          </IconControl>
        </IconButton>
      )}
      headerCell={(variant) => <Table.Label>{variant}</Table.Label>}
      index={(color) => <Table.Label align="end">{color}</Table.Label>}
    />
  ),
};

export const Sizes: Story = {
  parameters: {
    controls: {
      exclude: ["size"],
    },
  },
  render: ({ size: _size, ...props }) => (
    <Table
      variant="unstyled"
      gap={2}
      columns={sizes}
      rows={[
        createRecord(sizes, (size) => (
          <IconButton {...props}>
            <IconControl size={size} style={{ padding: "10%" }}>
              <FaBook />
            </IconControl>
          </IconButton>
        )),
      ]}
      cell={(row, size) => row[size]}
      headerCell={(size) => <Table.Label align="center">{size}</Table.Label>}
    />
  ),
};
