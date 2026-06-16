import type { Meta, StoryObj } from "@storybook/react";
import { Col } from "../layout/FlexBox";
import { Span, Text, type TextProps } from "./Text";

type TextStoryArgs = Pick<
  TextProps,
  "as" | "size" | "color" | "font" | "indent"
>;

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
    font: {
      control: "select",
      options: ["body", "heading", "subheading", "monospace"],
    },
    indent: {
      control: "select",
      options: [0, 1, 2, 3, 4],
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

export const Default: Story = {
  render: (props) => (
    <Col>
      <hgroup>
        <Text as="h1">Lorem ipsum dolor sit amet</Text>
        <Text as="h4" color="muted" mt={-2}>
          Consectetur adipiscing elit, sed do eiusmod tempor incididunt.
        </Text>
      </hgroup>
      <Text as="p" {...props}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
      </Text>
    </Col>
  ),
};

export const Sizes: Story = {
  parameters: {
    controls: {
      exclude: ["size"],
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
      exclude: ["color"],
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

export const Fonts: Story = {
  parameters: {
    controls: {
      exclude: ["font"],
    },
  },
  render: (args) => (
    <div>
      {(["body", "heading", "subheading", "monospace"] as const).map((font) => (
        <Text key={font} {...args} font={font}>
          {font}
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
