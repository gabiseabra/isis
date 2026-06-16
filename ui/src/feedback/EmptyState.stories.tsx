import type { Meta, StoryObj } from "@storybook/react";
import { FaBoxOpen } from "react-icons/fa";
import { Col } from "../layout/FlexBox";
import { EmptyState } from "./EmptyState";

type EmptyStateSize = "m" | "l";

type EmptyStateStoryArgs = {
  size: EmptyStateSize;
  color: EmptyStateColor;
  title: string;
  message: string;
};

const sizes = ["m", "l"] as const;
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

const meta = {
  title: "Feedback/EmptyState",
  args: {
    size: "m",
    color: "muted",
    title: "Nothing to show yet",
    message: "Content will appear here once there is something available.",
  },
  render: ({ message, ...args }) => (
    <EmptyState {...args}>{message}</EmptyState>
  ),
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
  decorators: [
    (Story) => (
      <Col p={4} gap={2}>
        <Story />
      </Col>
    ),
  ],
} satisfies Meta<EmptyStateStoryArgs>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {};

export const Sizes: Story = {
  parameters: {
    controls: {
      exclude: ["size"],
    },
  },
  render: ({ message, ...args }) => (
    <Col gap={3}>
      {sizes.map((size) => (
        <EmptyState key={size} {...args} size={size}>
          {message}
        </EmptyState>
      ))}
    </Col>
  ),
};

export const WithIcon: Story = {
  args: {
    title: "No matching results",
    message: "Adjust the search or filters and try again.",
  },
  render: ({ message, ...args }) => (
    <EmptyState {...args} icon={<FaBoxOpen />}>
      {message}
    </EmptyState>
  ),
};
