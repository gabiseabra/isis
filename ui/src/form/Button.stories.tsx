import type { Meta, StoryObj } from "@storybook/react";
import { FaArrowRight, FaPlus } from "react-icons/fa";
import { Table } from "../layout/Table";
import { Button, type ButtonProps } from "./Button";

type ButtonStoryArgs = Pick<
  ButtonProps,
  "color" | "size" | "disabled" | "loading" | "pressed"
> & {
  content: string;
};

const variants = ["primary", "secondary", "sheer", "link"] as const;
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
] as const;
const sizes = ["s", "m", "l"] as const;

const meta: Meta<ButtonStoryArgs> = {
  title: "Form/Button",
  args: {
    content: "Hello button",
    color: "primary",
    size: "m",
    disabled: false,
    loading: false,
    pressed: false,
  },
  argTypes: {
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

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {
  render: ({ content, ...props }) => <Button {...props}>{content}</Button>,
};

export const Colors: Story = {
  parameters: {
    controls: {
      exclude: ["color", "content"],
    },
  },
  render: (args) => (
    <Table
      variant="unstyled"
      gap={2}
      rows={colors}
      columns={variants}
      cell={(color, variant) => (
        <Button {...args} color={color} variant={variant}>
          Button
        </Button>
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
  render: (args) => (
    <Table
      variant="unstyled"
      gap={2}
      rows={sizes}
      columns={variants}
      cell={(size, variant) => (
        <Button {...args} size={size} variant={variant}>
          Button
        </Button>
      )}
      headerCell={(variant) => <Table.Label>{variant}</Table.Label>}
      index={(size) => <Table.Label align="end">{size}</Table.Label>}
    />
  ),
};

export const WithSlots: Story = {
  render: (args) => (
    <Table
      variant="unstyled"
      gap={2}
      rows={["slots"]}
      columns={variants}
      cell={(_, variant) => (
        <Button
          {...args}
          left={<FaPlus />}
          right={<FaArrowRight />}
          variant={variant}
        >
          Button
        </Button>
      )}
      headerCell={(variant) => <Table.Label>{variant}</Table.Label>}
    />
  ),
};
