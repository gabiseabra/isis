import type { Meta, StoryObj } from "@storybook/react";
import { FaBook, FaHeart, FaShoppingCart } from "react-icons/fa";
import { Row } from "../layout/FlexBox";
import { IconControl, type IconControlProps } from "./IconControl";

type IconControlStoryArgs = Pick<
  IconControlProps,
  "as" | "size" | "color" | "badge" | "disabled" | "readOnly" | "title"
>;

const meta = {
  title: "Display/IconControl",
  args: {
    as: "button",
    size: "m",
    color: "primary",
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
  },
  parameters: {
    controls: {
      include: [
        "as",
        "size",
        "color",
        "badge",
        "disabled",
        "readOnly",
        "title",
      ],
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
    badge: "3",
  },
  render: (args) => (
    <IconControl {...args}>
      <FaShoppingCart />
    </IconControl>
  ),
};

export const Sizes: Story = {
  parameters: {
    controls: {
      include: ["as", "color", "badge"],
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
