import type { Meta, StoryObj } from "@storybook/react";
import { Col } from "../layout/FlexBox";
import { Span, Text, type TextProps } from "./Text";

type TextStoryArgs = Pick<TextProps, "as" | "size" | "color" | "indent">;

const meta = {
  title: "Display/Text",
  args: {
    as: "p",
    size: "body",
    color: "default",
    indent: 0,
  },
  render: (args) => <Text {...args}>Text</Text>,
  argTypes: {
    as: {
      control: "select",
      options: ["div", "p", "blockquote", "h1", "h2", "h3", "h4", "h5"],
    },
    size: {
      control: "select",
      options: ["caption", "body", "h1", "h2", "h3", "h4", "h5"],
    },
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
        "muted",
        "disabled",
        "link",
      ],
    },
    indent: {
      control: "select",
      options: [0, 1, 2, 3, 4],
    },
  },
  parameters: {
    controls: {
      include: ["as", "size", "color", "indent"],
    },
  },
  decorators: [
    (Story) => (
      <Col p={4}>
        <Story />
      </Col>
    ),
  ],
} satisfies Meta<TextStoryArgs>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {};

export const Sizes: Story = {
  parameters: {
    controls: {
      include: ["as", "color", "indent"],
    },
  },
  render: (args) => (
    <div>
      {(["caption", "body", "h1", "h2", "h3", "h4", "h5"] as const).map(
        (size) => (
          <Text key={size} {...args} size={size}>
            {size}
          </Text>
        ),
      )}
    </div>
  ),
};

export const Colors: Story = {
  parameters: {
    controls: {
      include: ["as", "size", "indent"],
    },
  },
  render: (args) => (
    <div>
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
          "muted",
          "disabled",
          "link",
        ] as const
      ).map((color) => (
        <Text key={color} {...args} color={color}>
          {color}
        </Text>
      ))}
    </div>
  ),
};

export const Annotations: Story = {
  render: (args) => (
    <div>
      <Text {...args}>
        <Span>default</Span>
      </Text>
      <Text {...args}>
        <Span bold>bold</Span>
      </Text>
      <Text {...args}>
        <Span italic>italic</Span>
      </Text>
      <Text {...args}>
        <Span underline>underline</Span>
      </Text>
      <Text {...args}>
        <Span strikethrough>strikethrough</Span>
      </Text>
      <Text {...args}>
        <Span code>code</Span>
      </Text>
      <Text {...args}>
        <Span redacted>redacted</Span>
      </Text>
    </div>
  ),
};
