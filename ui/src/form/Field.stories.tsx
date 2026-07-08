import type { Meta, StoryObj } from "@storybook/react";
import { Field, type FieldProps } from "./Field";
import { Input } from "./Input";

type FieldStoryArgs = Pick<FieldProps, "label" | "description" | "error">;

const meta = {
  title: "Form/Field",
  args: {
    label: "Label",
    description: "",
    error: "",
  },
} satisfies Meta<FieldStoryArgs>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {
  render: (args) => (
    <Field htmlFor="field" {...args}>
      <Input id="field" placeholder="Input" />
    </Field>
  ),
};

export const WithDescription: Story = {
  args: {
    description: "Description",
  },
  parameters: {
    controls: {
      exclude: ["description"],
    },
  },
  render: (args) => (
    <Field htmlFor="field" {...args}>
      <Input id="field" placeholder="Input" />
    </Field>
  ),
};

export const WithError: Story = {
  args: {
    error: "Error",
  },
  parameters: {
    controls: {
      exclude: ["error"],
    },
  },
  render: (args) => (
    <Field htmlFor="field" {...args}>
      <Input id="field" placeholder="Input" />
    </Field>
  ),
};
