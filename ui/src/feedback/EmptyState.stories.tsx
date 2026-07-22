import type { Meta, StoryObj } from "@storybook/react";
import { Table } from "../layout/Table";
import { EmptySearch, EmptyStateProps, ErrorState } from "./EmptyState";

type EmptyStateStoryProps = {
  size: EmptyStateProps["size"];
  color: EmptyStateColor;
  title: string;
  message: string;
};

const sizes = ["s", "m"] as const;
const colors = [
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

type EmptyStateColor = (typeof colors)[number];

const meta: Meta<EmptyStateStoryProps> = {
  title: "Feedback/EmptyState",
  args: {
    size: "m",
    color: "muted",
    title: "Nothing to show yet",
    message: "",
  },
  argTypes: {
    size: {
      control: "select",
      options: sizes,
    },
    color: {
      control: "select",
      options: colors,
    },
  },
};

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {
  parameters: {
    controls: {
      exclude: ["color"],
    },
  },
  render: ({ color: _color, message, ...args }) => (
    <Table
      variant="unstyled"
      gap={2}
      columns={["element"]}
      rows={(["EmptySearch", "ErrorState"] as const).map((variant) => ({
        variant,
        Component: {
          EmptySearch,
          ErrorState,
        }[variant],
      }))}
      cell={({ Component }) => <Component {...args}>{message}</Component>}
      index={(row) => <Table.Label align="end">{row.variant}</Table.Label>}
    />
  ),
};

export const Sizes: Story = {
  parameters: {
    controls: {
      exclude: ["size"],
    },
  },
  render: ({ message, ...args }) => (
    <Table
      variant="unstyled"
      gap={2}
      columns={["element"]}
      rows={sizes.map((size) => ({
        size,
        element: (
          <EmptySearch key={size} {...args} size={size}>
            {message}
          </EmptySearch>
        ),
      }))}
      cell={(row, col) => row[col]}
      index={(row) => <Table.Label align="end">{row.size}</Table.Label>}
    />
  ),
};
