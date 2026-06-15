import type { Meta, StoryObj } from "@storybook/react";
import { FaBook, FaHeart, FaShoppingCart } from "react-icons/fa";
import { Row } from "../layout/FlexBox";
import { IconControl, type IconControlProps } from "./IconControl";

type IconControlStoryArgs = Pick<
  IconControlProps,
  "as" | "size" | "color" | "badge" | "disabled" | "title"
>;

const meta = {
  title: "Display/IconControl",
  args: {
    as: "span",
    size: "m",
    color: "primary",
    badge: "",
    disabled: false,
    title: "",
  },
  render: (args) => (
    <IconControl {...args}>
      <FaBook />
    </IconControl>
  ),
  argTypes: {
    as: {
      control: "select",
      options: ["button", "a", "div", "span"],
    },
    size: {
      control: "select",
      options: ["xs", "s", "m", "l", "xl", "auto"],
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
      ],
    },
    badge: {
      control: "text",
    },
    title: {
      control: "text",
    },
    disabled: {
      control: "boolean",
      if: {
        arg: "as",
        eq: "button",
      },
    },
  },
  decorators: [
    (Story) => (
      <Row p={4} gap={1}>
        <Story />
      </Row>
    ),
  ],
} satisfies Meta<IconControlStoryArgs>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {};

export const WithBadge: Story = {
  args: {
    as: "span",
    badge: "3",
  },
  render: (args) => (
    <IconControl {...args}>
      <FaShoppingCart />
    </IconControl>
  ),
};

export const IconButton: Story = {
  args: {
    as: "button",
    badge: "3",
    title: "Favorite",
  },
  parameters: {
    controls: {
      exclude: ["as"],
    },
  },
  render: (args) => (
    <IconControl {...args} as="button" onClick={() => undefined}>
      <FaHeart />
    </IconControl>
  ),
};

export const Sizes: Story = {
  parameters: {
    controls: {
      exclude: ["size"],
    },
  },
  render: (args) => (
    <>
      {(["xs", "s", "m", "l", "xl"] as const).map((size) => (
        <IconControl key={size} {...args} size={size}>
          <FaBook />
        </IconControl>
      ))}
    </>
  ),
};
