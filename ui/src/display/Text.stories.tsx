import type { Meta, StoryObj } from "@storybook/react";
import { Col } from "../layout/FlexBox";
import { Table } from "../layout/Table";
import { Span, Text, type TextProps } from "./Text";

type TextStoryArgs = Pick<
  TextProps,
  "as" | "size" | "color" | "font" | "indent" | "align"
>;

const textSizes = ["caption", "body", "h1", "h2", "h3", "h4", "h5"] as const;
const textColors = [
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
] as const;
const textFonts = ["body", "heading", "subheading", "monospace"] as const;

const meta: Meta<TextStoryArgs> = {
  title: "Display/Text",
  args: {
    as: "p",
    size: "body",
    color: "default",
    indent: 0,
    align: "start",
  },
  argTypes: {
    as: {
      control: "select",
      options: ["div", "p", "blockquote", "h1", "h2", "h3", "h4", "h5"],
    },
    size: {
      control: "select",
      options: textSizes,
    },
    color: {
      control: "select",
      options: textColors,
    },
    font: {
      control: "select",
      options: textFonts,
    },
    indent: {
      control: "select",
      options: [0, 1, 2, 3, 4],
    },

    align: {
      control: "select",
      options: ["center", "left", "right", "start", "end"],
    },
  },
};

type Story = StoryObj<TextStoryArgs>;

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
    <Table
      variant="unstyled"
      columns={["element"]}
      rows={textSizes.map((size) => ({
        element: (
          <Text key={size} {...args} size={size}>
            {size}
          </Text>
        ),
      }))}
      cell={(row, col) => row[col]}
    />
  ),
};

export const Colors: Story = {
  parameters: {
    controls: {
      exclude: ["color"],
    },
  },
  render: (args) => (
    <Table
      variant="unstyled"
      columns={["color", "background"]}
      rows={textColors.map((color) => ({
        color: (
          <Text key={color} {...args}>
            <Span color={color}>{color}</Span>
          </Text>
        ),
        background:
          color === "muted" ||
          color === "link" ||
          color === "disabled" ? null : (
            <Text key={color} {...args}>
              <Span background={color}>{color}</Span>
            </Text>
          ),
      }))}
      cell={(row, col) => row[col]}
      headerCell={(col) => <Table.Label>{col}</Table.Label>}
    />
  ),
};

export const Fonts: Story = {
  parameters: {
    controls: {
      exclude: ["font"],
    },
  },
  render: (args) => (
    <Table
      variant="unstyled"
      columns={["element"]}
      rows={textFonts.map((font) => ({
        element: (
          <Text key={font} {...args} font={font}>
            {font}
          </Text>
        ),
      }))}
      cell={(row, col) => row[col]}
    />
  ),
};

const textAnnotations = [
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "code",
  "redacted",
] as const;

export const Annotations: Story = {
  render: (args) => (
    <Table
      variant="unstyled"
      columns={["element"]}
      rows={textAnnotations.map((annotation) => ({
        element: (
          <Text {...args}>
            <Span {...{ [annotation]: true }}>default</Span>
          </Text>
        ),
      }))}
      cell={(row, col) => row[col]}
    />
  ),
};
