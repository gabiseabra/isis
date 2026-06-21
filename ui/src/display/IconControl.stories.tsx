import type { Meta, StoryObj } from "@storybook/react";
import { FaBook, FaHeart, FaShoppingCart, FaThumbsUp } from "react-icons/fa";
import { Col, Row } from "../layout/FlexBox";
import { IconControl, type IconControlProps } from "./IconControl";

type IconControlStoryProps = Pick<
  IconControlProps,
  "as" | "size" | "color" | "badge" | "disabled" | "title"
>;

const iconControlSizes = ["xs", "s", "m", "l", "xl", "auto"] as const;

const meta: Meta<IconControlStoryProps> = {
  title: "Display/IconControl",
  args: {
    as: "span",
    size: "m",
    color: "primary",
    badge: "",
    disabled: false,
    title: "",
  },
  argTypes: {
    as: {
      control: "select",
      options: ["button", "a", "div", "span"],
    },
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
    disabled: {
      control: "boolean",
      if: {
        arg: "as",
        eq: "button",
      },
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
    as: "span",
    badge: "3",
  },
  render: (props) => (
    <IconControl {...props}>
      <FaThumbsUp />
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
  render: (props) => (
    <IconControl {...props} as="button" onClick={() => undefined}>
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
  render: (props) => (
    <Row alignY="stretch" gap={2}>
      {iconControlSizes.map((size) => (
        <Col>
          <IconControl key={size} {...props} size={size}>
            <FaBook />
          </IconControl>
        </Col>
      ))}
    </Row>
  ),
};
