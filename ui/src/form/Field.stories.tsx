import type { Meta, StoryObj } from "@storybook/react";
import { Col } from "../layout/FlexBox";
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
  render: (args) => (
    <Field id="field" {...args}>
      <Input placeholder="Input" />
    </Field>
  ),
  decorators: [
    (Story) => (
      <Col p={4} gap={1}>
        <Story />
      </Col>
    ),
  ],
} satisfies Meta<FieldStoryArgs>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {};

export const WithDescription: Story = {
  args: {
    description: "Description",
  },
  parameters: {
    controls: {
      exclude: ["description"],
    },
  },
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
};
