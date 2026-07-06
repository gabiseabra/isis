import type { Meta, StoryObj } from "@storybook/react";
import { Table } from "../layout/Table";
import { Input, type InputProps } from "./Input";

type InputStoryArgs = Pick<
  InputProps,
  "placeholder" | "type" | "disabled" | "size" | "variant"
>;

const meta = {
  title: "Form/Input",
  args: {
    size: "m",
    placeholder: "Input",
    type: "text",
    disabled: false,
    variant: "default",
  },
  argTypes: {
    size: {
      control: "select",
      options: ["s", "m", "l"],
    },
    type: {
      control: "select",
      options: ["text", "email", "password", "search"],
    },
    variant: {
      control: "select",
      options: ["default", "unstyled"],
    },
  },
} satisfies Meta<InputStoryArgs>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {
  render: (args) => <Input {...args} />,
};

export const WithSlots: Story = {
  render: (args) => <Input {...args} left="left" right="right" />,
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
      style={{ width: "100%" }}
      columns={["element"]}
      rows={(["s", "m", "l"] as const).map((size) => ({
        size,
        element: <Input {...args} size={size} />,
      }))}
      cell={(row, col) => row[col]}
      index={(data) => <Table.Label align="end">{data.size}</Table.Label>}
    />
  ),
};
